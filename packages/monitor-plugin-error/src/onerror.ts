import type { MonitorApi } from '@company/monitor-types'
import { createExceptionEvent } from './normalize'

export function registerWindowOnError(api: MonitorApi) {
  const handler = (
    message: Event | string,
    _source?: string,
    _lineno?: number,
    _colno?: number,
    error?: Error
  ) => {
    const targetError = error ?? message
    const event = createExceptionEvent({
      error: targetError,
      source: 'window.onerror'
    })

    api.emit(event)
    return false
  }

  window.onerror = handler

  return () => {
    if (window.onerror === handler) {
      window.onerror = null
    }
  }
}
