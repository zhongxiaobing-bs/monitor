import type { HttpErrorEvent } from '@company/monitor-types'

interface CreateHttpErrorEventParams {
  url: string
  method: string
  status?: number
  duration: number
  responseMessage?: string
}

export function createHttpErrorEvent({
  url,
  method,
  status,
  duration,
  responseMessage
}: CreateHttpErrorEventParams): HttpErrorEvent {
  return {
    eventId: '',
    eventType: 'http_error',
    appId: '',
    env: '',
    url: '',
    pathname: '',
    title: '',
    timestamp: 0,
    userAgent: '',
    request: {
      url,
      method,
      status,
      duration,
      success: false,
      source: 'fetch'
    },
    response: {
      message: responseMessage
    }
  }
}
