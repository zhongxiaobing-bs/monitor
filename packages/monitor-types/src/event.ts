export type MonitorEventType =
  | 'exception'
  | 'resource_error'
  | 'http_error'
  | 'blank_screen'

export interface Breadcrumb {
  type: string
  category?: string
  message?: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface BaseEvent {
  eventId: string
  eventType: MonitorEventType
  appId: string
  appName?: string
  env: string
  release?: string
  url: string
  pathname: string
  title: string
  timestamp: number
  userAgent: string
  userId?: string
  deviceId?: string
  breadcrumbs?: Breadcrumb[]
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

export interface ExceptionEvent extends BaseEvent {
  eventType: 'exception'
  error: {
    name?: string
    message: string
    stack?: string
    source?: string
  }
}

export interface HttpErrorEvent extends BaseEvent {
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

export interface BlankScreenEvent extends BaseEvent {
  eventType: 'blank_screen'
  blankScreen: {
    score: number
    rootSelector?: string
    domSummary?: string[]
    readyState?: string
    trigger?: 'initial' | 'route_change' | 'manual'
  }
}

export type MonitorEvent = ExceptionEvent | HttpErrorEvent | BlankScreenEvent
