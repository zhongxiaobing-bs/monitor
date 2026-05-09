export interface BaseMonitorEvent {
  eventId?: string
  eventType: string
  appId?: string
  appName?: string
  env?: string
  release?: string
  url?: string
  pathname?: string
  title?: string
  timestamp?: number
  userAgent?: string
  userId?: string
}

export interface ExceptionMonitorEvent extends BaseMonitorEvent {
  eventType: 'exception'
  error: {
    name?: string
    message: string
    stack?: string
    source?: string
  }
}

export interface BlankScreenMonitorEvent extends BaseMonitorEvent {
  eventType: 'blank_screen'
  blankScreen: {
    score: number
    rootSelector?: string
    domSummary?: string[]
    readyState?: string
    trigger?: 'initial' | 'route_change' | 'manual'
  }
}

export interface HttpErrorMonitorEvent extends BaseMonitorEvent {
  eventType: 'http_error'
  request: {
    url: string
    method: string
    status?: number
    duration?: number
    success: boolean
    source?: 'fetch' | 'xhr'
  }
  response?: {
    code?: string | number
    message?: string
  }
}

export type MonitorEvent =
  | BaseMonitorEvent
  | ExceptionMonitorEvent
  | BlankScreenMonitorEvent
  | HttpErrorMonitorEvent

export interface CollectRequestBody {
  events?: BaseMonitorEvent[]
}
