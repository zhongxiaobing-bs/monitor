import type { BlankScreenEvent } from '@company/monitor-types'

interface CreateBlankScreenEventParams {
  score: number
  rootSelector?: string
  domSummary: string[]
  trigger: 'initial' | 'route_change' | 'manual'
}

export function createBlankScreenEvent({
  score,
  rootSelector,
  domSummary,
  trigger
}: CreateBlankScreenEventParams): BlankScreenEvent {
  return {
    eventId: '',
    eventType: 'blank_screen',
    appId: '',
    env: '',
    url: '',
    pathname: '',
    title: '',
    timestamp: 0,
    userAgent: '',
    blankScreen: {
      score,
      rootSelector,
      domSummary,
      readyState: document.readyState,
      trigger
    }
  }
}
