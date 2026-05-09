import type { BlankScreenMonitorEvent } from '../types/monitor'

export function formatBlankScreenLog(event: BlankScreenMonitorEvent) {
  return {
    eventType: event.eventType,
    appId: event.appId,
    appName: event.appName,
    env: event.env,
    release: event.release,
    pathname: event.pathname,
    score: event.blankScreen?.score,
    trigger: event.blankScreen?.trigger,
    rootSelector: event.blankScreen?.rootSelector,
    readyState: event.blankScreen?.readyState,
    domSummary: event.blankScreen?.domSummary
  }
}
