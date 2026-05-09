import type { MonitorApi, MonitorInitOptions } from '@company/monitor-types'
import { createHttpErrorEvent } from './normalize'
import type { NetworkPluginOptions } from './types'
import { isMonitorRequest } from './url'

export function patchFetch(
  api: MonitorApi,
  sdkOptions: MonitorInitOptions,
  options: NetworkPluginOptions
) {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return () => {}
  }

  const originalFetch = window.fetch.bind(window)
  const {
    capture5xx = true,
    captureNetworkError = true
  } = options

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase()
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

    if (isMonitorRequest(requestUrl, sdkOptions.dsn)) {
      return originalFetch(input, init)
    }

    const startedAt = Date.now()

    try {
      const response = await originalFetch(input, init)
      const duration = Date.now() - startedAt

      if (capture5xx && response.status >= 500) {
        api.emit(
          createHttpErrorEvent({
            url: requestUrl,
            method,
            status: response.status,
            duration,
            responseMessage: response.statusText
          })
        )
      }

      return response
    } catch (error) {
      const duration = Date.now() - startedAt

      if (captureNetworkError) {
        api.emit(
          createHttpErrorEvent({
            url: requestUrl,
            method,
            duration,
            responseMessage:
              error instanceof Error ? error.message : 'Fetch request failed'
          })
        )
      }

      throw error
    }
  }

  return () => {
    window.fetch = originalFetch
  }
}
