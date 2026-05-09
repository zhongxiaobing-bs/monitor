import Fastify from 'fastify'
import { formatBlankScreenLog } from './formatters/blank-screen-log'
import { formatExceptionMarkdown } from './formatters/wecom-message'
import {
  collectRequestSchema,
  parseMonitorEvent
} from './schemas/collect-schema'
import { EventRepository } from './db/event-repository'
import { ReportRepository } from './db/report-repository'
import { registerReportRoutes } from './routes/report-routes'
import { DedupeService } from './services/dedupe-service'
import { sendWecomMarkdown } from './services/wecom-service'
import type {
  BlankScreenMonitorEvent,
  ExceptionMonitorEvent,
  MonitorEvent
} from './types/monitor'
import { createEventFingerprint } from './utils/fingerprint'
import { formatZodError } from './utils/format-zod-error'

interface AppDependencies {
  eventRepository: Pick<EventRepository, 'insert'>
  reportRepository: Pick<
    ReportRepository,
    'getSummary' | 'getGroups' | 'getEvents' | 'getEventById'
  >
}

export function createApp({ eventRepository, reportRepository }: AppDependencies) {
  const app = Fastify({
    logger: true
  })

  const dedupeService = new DedupeService()

  app.get('/health', async () => {
    return { ok: true }
  })

  app.get('/api/mock-500', async (_, reply) => {
    reply.code(500).send({
      success: false,
      message: 'mock internal server error'
    })
  })

  app.post('/api/collect', async (request, reply) => {
    const topLevelParsed = collectRequestSchema.safeParse(request.body)

    if (!topLevelParsed.success) {
      const details = formatZodError(topLevelParsed.error)

      app.log.warn(
        {
          details,
          body: request.body
        },
        'invalid monitor collect payload'
      )

      reply.code(400).send({
        success: false,
        code: 'INVALID_PAYLOAD',
        details
      })
      return
    }

    const validatedEvents: MonitorEvent[] = []
    const validationErrors = []

    for (const [index, event] of topLevelParsed.data.events.entries()) {
      const parsedEvent = parseMonitorEvent(event)

      if (!parsedEvent.success) {
        validationErrors.push(
          ...formatZodError(parsedEvent.error, `events.${index}`)
        )
        continue
      }

      validatedEvents.push(parsedEvent.data as MonitorEvent)
    }

    if (validationErrors.length > 0) {
      app.log.warn(
        {
          details: validationErrors,
          body: request.body
        },
        'invalid monitor event payload'
      )

      reply.code(400).send({
        success: false,
        code: 'INVALID_EVENT',
        details: validationErrors
      })
      return
    }

    const persistenceResults = await Promise.allSettled(
      validatedEvents.map((event) => eventRepository.insert(event))
    )

    for (const [index, result] of persistenceResults.entries()) {
      if (result.status === 'rejected') {
        app.log.error(
          {
            error: result.reason,
            event: validatedEvents[index]
          },
          'failed to persist monitor event'
        )
      }
    }

    dedupeService.cleanup()

    app.log.info(
      {
        count: validatedEvents.length,
        events: validatedEvents
      },
      'received monitor events'
    )

    const exceptionEvents = validatedEvents.filter(
      (event): event is ExceptionMonitorEvent => event.eventType === 'exception'
    )

    const blankScreenEvents = validatedEvents.filter(
      (event): event is BlankScreenMonitorEvent =>
        event.eventType === 'blank_screen'
    )

    for (const event of blankScreenEvents) {
      app.log.info(
        {
          blankScreen: formatBlankScreenLog(event)
        },
        'received blank screen event'
      )
    }

    let notifiedCount = 0
    let skippedNonProdCount = 0
    let skippedDedupeCount = 0

    for (const event of exceptionEvents) {
      if (event.env !== 'prod') {
        skippedNonProdCount += 1
        continue
      }

      const fingerprint = createEventFingerprint(event)
      const shouldNotify = dedupeService.shouldNotify(fingerprint)

      if (!shouldNotify) {
        skippedDedupeCount += 1
        continue
      }

      try {
        const markdown = formatExceptionMarkdown(event)
        await sendWecomMarkdown(markdown)
        notifiedCount += 1
      } catch (error) {
        app.log.error(
          {
            error,
            event
          },
          'failed to send wecom notification'
        )
      }
    }

    reply.send({
      success: true,
      received: validatedEvents.length,
      exceptionCount: exceptionEvents.length,
      blankScreenCount: blankScreenEvents.length,
      notified: notifiedCount,
      skippedNonProd: skippedNonProdCount,
      skippedDedupe: skippedDedupeCount
    })
  })

  registerReportRoutes(app, reportRepository)

  return app
}
