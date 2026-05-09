import type { BaseMonitorEvent, ExceptionMonitorEvent } from '../types/monitor'

function normalizeText(value?: string) {
  return (value || '').trim().toLowerCase()
}

export function createEventFingerprint(event: BaseMonitorEvent) {
  if (event.eventType === 'exception') {
    const exceptionEvent = event as ExceptionMonitorEvent

    return [
      normalizeText(event.appId),
      normalizeText(event.env),
      normalizeText(event.eventType),
      normalizeText(exceptionEvent.error?.name),
      normalizeText(exceptionEvent.error?.message),
      normalizeText(event.pathname || event.url)
    ].join('|')
  }

  return [
    normalizeText(event.appId),
    normalizeText(event.env),
    normalizeText(event.eventType),
    normalizeText(event.pathname || event.url)
  ].join('|')
}
