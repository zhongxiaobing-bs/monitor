import type {
  ExceptionEvent,
  MonitorApi,
  MonitorEvent,
  MonitorInitOptions
} from '@company/monitor-types'
import { createEventId, normalizeError } from '@company/monitor-shared'
import { EventQueue, sendEvents } from '@company/monitor-transport'
import { createBaseContext } from './context'
import { setupPlugins } from './plugin-system'

export class Monitor implements MonitorApi {
  private queue = new EventQueue()
  private options: MonitorInitOptions
  private context: ReturnType<typeof createBaseContext>
  private disposePlugins: (() => void) | null = null

  constructor(options: MonitorInitOptions) {
    this.options = options
    this.context = createBaseContext(options)
    this.disposePlugins = setupPlugins(options.plugins ?? [], this, options)
  }

  emit(event: MonitorEvent) {
    const mergedEvent: MonitorEvent = {
      ...this.context,
      ...event,
      appId: event.appId || this.context.appId,
      appName: event.appName || this.context.appName,
      env: event.env || this.context.env,
      release: event.release || this.context.release,
      url: event.url || this.context.url,
      pathname: event.pathname || this.context.pathname,
      title: event.title || this.context.title,
      userAgent: event.userAgent || this.context.userAgent,
      eventId: event.eventId || createEventId(),
      timestamp: event.timestamp || Date.now()
    }

    const finalEvent = this.options.beforeSend
      ? this.options.beforeSend(mergedEvent)
      : mergedEvent

    if (!finalEvent) return

    this.queue.add(finalEvent)
    void this.flush()
  }

  captureException(error: unknown, extra?: Record<string, unknown>) {
    const normalized = normalizeError(error)

    const event: ExceptionEvent = {
      eventId: '',
      eventType: 'exception',
      appId: '',
      env: '',
      url: '',
      pathname: '',
      title: '',
      timestamp: 0,
      userAgent: '',
      extra,
      error: {
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
        source: 'react'
      }
    }

    this.emit(event)
  }

  async flush() {
    const events = this.queue.drain()
    await sendEvents(this.options.dsn, events)
  }

  destroy() {
    this.disposePlugins?.()
    this.disposePlugins = null
  }
}

export function initMonitor(options: MonitorInitOptions) {
  return new Monitor(options)
}
