export type GroupByField = 'appName' | 'env' | 'pathname' | 'eventType'

export interface ReportFilter {
  from?: number
  to?: number
  appName?: string
  env?: string
  eventType?: string
}

export interface EventsFilter extends ReportFilter {
  page: number
  pageSize: number
  keyword?: string
}

export interface TrendPoint {
  bucket: string
  count: number
}

export interface SummaryResult {
  total: number
  exceptionCount: number
  httpErrorCount: number
  blankScreenCount: number
  last24hCount: number
  trend: TrendPoint[]
}

export interface GroupResult {
  value: string | null
  count: number
}

export interface EventPayload {
  eventType: string
  error?: {
    name?: string
    message: string
    stack?: string
    source?: string
  }
  request?: {
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
  blankScreen?: {
    score: number
    rootSelector?: string
    domSummary?: string[]
    readyState?: string
    trigger?: 'initial' | 'route_change' | 'manual'
  }
  [key: string]: unknown
}

export interface EventRow {
  id: number
  eventId: string | null
  eventType: string
  appName: string | null
  env: string | null
  pathname: string | null
  eventTimestamp: number | null
  receivedAt: string
  payload: EventPayload
}

export interface EventsResult {
  total: number
  page: number
  pageSize: number
  events: EventRow[]
}
