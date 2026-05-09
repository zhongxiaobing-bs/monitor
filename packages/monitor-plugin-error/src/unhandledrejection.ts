import type { MonitorApi } from '@company/monitor-types'
import { createExceptionEvent } from './normalize'

export function registerUnhandledRejection(api: MonitorApi) {
  const handler = (event: PromiseRejectionEvent) => {
    const exceptionEvent = createExceptionEvent({
      error: event.reason,
      source: 'unhandledrejection'
    })

    api.emit(exceptionEvent)
  }

  window.addEventListener('unhandledrejection', handler)

  return () => {
    window.removeEventListener('unhandledrejection', handler)
  }
}
