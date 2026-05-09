import type { FastifyInstance } from 'fastify'
import {
  eventDetailParamsSchema,
  eventsQuerySchema,
  groupsQuerySchema,
  summaryQuerySchema
} from '../schemas/report-schema'
import type { ReportRepository } from '../db/report-repository'
import { formatZodError } from '../utils/format-zod-error'

export function registerReportRoutes(
  app: FastifyInstance,
  reportRepository: Pick<
    ReportRepository,
    'getSummary' | 'getGroups' | 'getEvents' | 'getEventById'
  >
) {
  app.get('/api/reports/summary', async (request, reply) => {
    const parsed = summaryQuerySchema.safeParse(request.query)

    if (!parsed.success) {
      reply.code(400).send({
        success: false,
        code: 'INVALID_QUERY',
        details: formatZodError(parsed.error)
      })
      return
    }

    try {
      const summary = await reportRepository.getSummary(parsed.data)
      reply.send(summary)
    } catch (error) {
      app.log.error({ error }, 'failed to query report summary')
      reply.code(500).send({ success: false, code: 'REPORT_QUERY_FAILED' })
    }
  })

  app.get('/api/reports/groups', async (request, reply) => {
    const parsed = groupsQuerySchema.safeParse(request.query)

    if (!parsed.success) {
      reply.code(400).send({
        success: false,
        code: 'INVALID_QUERY',
        details: formatZodError(parsed.error)
      })
      return
    }

    try {
      const groups = await reportRepository.getGroups(parsed.data)
      reply.send(groups)
    } catch (error) {
      app.log.error({ error }, 'failed to query report groups')
      reply.code(500).send({ success: false, code: 'REPORT_QUERY_FAILED' })
    }
  })

  app.get('/api/reports/events', async (request, reply) => {
    const parsed = eventsQuerySchema.safeParse(request.query)

    if (!parsed.success) {
      reply.code(400).send({
        success: false,
        code: 'INVALID_QUERY',
        details: formatZodError(parsed.error)
      })
      return
    }

    try {
      const events = await reportRepository.getEvents(parsed.data)
      reply.send(events)
    } catch (error) {
      app.log.error({ error }, 'failed to query report events')
      reply.code(500).send({ success: false, code: 'REPORT_QUERY_FAILED' })
    }
  })

  app.get('/api/reports/events/:id', async (request, reply) => {
    const parsed = eventDetailParamsSchema.safeParse(request.params)

    if (!parsed.success) {
      reply.code(400).send({
        success: false,
        code: 'INVALID_QUERY',
        details: formatZodError(parsed.error)
      })
      return
    }

    try {
      const event = await reportRepository.getEventById(parsed.data.id)

      if (!event) {
        reply.code(404).send({ success: false, code: 'EVENT_NOT_FOUND' })
        return
      }

      reply.send(event)
    } catch (error) {
      app.log.error({ error }, 'failed to query report event detail')
      reply.code(500).send({ success: false, code: 'REPORT_QUERY_FAILED' })
    }
  })
}
