import type { MonitorEvent } from './monitor'

export type GroupByField = 'appName' | 'env' | 'pathname' | 'eventType'

export interface ReportFilter {
  from?: number
  to?: number
  appName?: string
  env?: string
  eventType?: string
  eventId?: string
}

export interface EventsFilter extends ReportFilter {
  page: number
  pageSize: number
  keyword?: string
  eventId?: string
}

export interface GroupsFilter extends ReportFilter {
  groupBy: GroupByField
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

export interface EventRow {
  id: number
  eventId: string | null
  eventType: string
  appName: string | null
  env: string | null
  pathname: string | null
  eventTimestamp: number | null
  receivedAt: string
  payload: MonitorEvent
}

export interface EventsResult {
  total: number
  page: number
  pageSize: number
  events: EventRow[]
}
