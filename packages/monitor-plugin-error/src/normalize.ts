import type { ExceptionEvent } from '@company/monitor-types'
import { normalizeError } from '@company/monitor-shared'

interface CreateExceptionEventParams {
  error: unknown
  source: 'window.onerror' | 'unhandledrejection'
}

export function createExceptionEvent({
  error,
  source
}: CreateExceptionEventParams): ExceptionEvent {
  const normalized = normalizeError(error)

  return {
    eventId: '',
    eventType: 'exception',
    appId: '',
    env: '',
    url: '',
    pathname: '',
    title: '',
    timestamp: 0,
    userAgent: '',
    error: {
      name: normalized.name,
      message: normalized.message,
      stack: normalized.stack,
      source
    }
  }
}
