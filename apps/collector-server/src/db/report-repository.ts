import type { Pool } from 'pg'
import type {
  EventRow,
  EventsFilter,
  EventsResult,
  GroupResult,
  GroupsFilter,
  GroupByField,
  ReportFilter,
  SummaryResult,
  TrendPoint
} from '../types/report'
import type { MonitorEvent } from '../types/monitor'

const groupByColumnMap: Record<GroupByField, string> = {
  appName: 'app_name',
  env: 'env',
  pathname: 'pathname',
  eventType: 'event_type'
}

function buildFilterClause(filters: ReportFilter, includeKeyword?: string) {
  const params: Array<number | string> = []
  const conditions: string[] = []

  if (filters.from !== undefined) {
    params.push(filters.from)
    conditions.push(`event_timestamp >= $${params.length}`)
  }

  if (filters.to !== undefined) {
    params.push(filters.to)
    conditions.push(`event_timestamp <= $${params.length}`)
  }

  if (filters.appName) {
    params.push(filters.appName)
    conditions.push(`app_name = $${params.length}`)
  }

  if (filters.env) {
    params.push(filters.env)
    conditions.push(`env = $${params.length}`)
  }

  if (filters.eventType) {
    params.push(filters.eventType)
    conditions.push(`event_type = $${params.length}`)
  }

  if (filters.eventId) {
    params.push(filters.eventId)
    conditions.push(`event_id = $${params.length}`)
  }

  if (includeKeyword) {
    params.push(`%${includeKeyword}%`)
    conditions.push(`payload::text ILIKE $${params.length}`)
  }

  return {
    params,
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  }
}

function mapEventRow(row: {
  id: number
  event_id: string | null
  event_type: string
  app_name: string | null
  env: string | null
  pathname: string | null
  event_timestamp: number | null
  received_at: string
  payload: MonitorEvent
}): EventRow {
  return {
    id: row.id,
    eventId: row.event_id,
    eventType: row.event_type,
    appName: row.app_name,
    env: row.env,
    pathname: row.pathname,
    eventTimestamp: row.event_timestamp,
    receivedAt: row.received_at,
    payload: row.payload
  }
}

export class ReportRepository {
  constructor(private readonly pool: Pick<Pool, 'query'>) {}

  async getSummary(filters: ReportFilter): Promise<SummaryResult> {
    const { params, whereClause } = buildFilterClause(filters)
    const aggregateResult = await this.pool.query<{
      total: string
      exception_count: string
      http_error_count: string
      blank_screen_count: string
      last24h_count: string
    }>(
      `
        SELECT
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE event_type = 'exception')::text AS exception_count,
          COUNT(*) FILTER (WHERE event_type = 'http_error')::text AS http_error_count,
          COUNT(*) FILTER (WHERE event_type = 'blank_screen')::text AS blank_screen_count,
          COUNT(*) FILTER (
            WHERE received_at >= NOW() - INTERVAL '24 hours'
          )::text AS last24h_count
        FROM monitor_events
        ${whereClause}
      `,
      params
    )

    const useHourlyBuckets =
      filters.from !== undefined &&
      filters.to !== undefined &&
      filters.to - filters.from <= 48 * 60 * 60 * 1000

    const bucketExpression = useHourlyBuckets
      ? "to_char(date_trunc('hour', received_at), 'YYYY-MM-DD\"T\"HH24:00:00')"
      : "to_char(date_trunc('day', received_at), 'YYYY-MM-DD')"

    const trendResult = await this.pool.query<{
      bucket: string
      count: string
    }>(
      `
        SELECT
          ${bucketExpression} AS bucket,
          COUNT(*)::text AS count
        FROM monitor_events
        ${whereClause}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      params
    )

    const aggregate = aggregateResult.rows[0] ?? {
      total: '0',
      exception_count: '0',
      http_error_count: '0',
      blank_screen_count: '0',
      last24h_count: '0'
    }

    return {
      total: Number(aggregate.total),
      exceptionCount: Number(aggregate.exception_count),
      httpErrorCount: Number(aggregate.http_error_count),
      blankScreenCount: Number(aggregate.blank_screen_count),
      last24hCount: Number(aggregate.last24h_count),
      trend: trendResult.rows.map<TrendPoint>((row) => ({
        bucket: row.bucket,
        count: Number(row.count)
      }))
    }
  }

  async getGroups(filters: GroupsFilter): Promise<GroupResult[]> {
    const { groupBy, ...reportFilter } = filters
    const { params, whereClause } = buildFilterClause(reportFilter)
    const columnName = groupByColumnMap[groupBy]

    const result = await this.pool.query<{
      value: string | null
      count: string
    }>(
      `
        SELECT
          ${columnName} AS value,
          COUNT(*)::text AS count
        FROM monitor_events
        ${whereClause}
        GROUP BY ${columnName}
        ORDER BY COUNT(*) DESC, ${columnName} ASC
      `,
      params
    )

    return result.rows.map((row) => ({
      value: row.value,
      count: Number(row.count)
    }))
  }

  async getEvents(filters: EventsFilter): Promise<EventsResult> {
    const { page, pageSize, keyword, ...reportFilter } = filters
    const { params, whereClause } = buildFilterClause(reportFilter, keyword)
    const offset = (page - 1) * pageSize

    const totalResult = await this.pool.query<{ total: string }>(
      `
        SELECT COUNT(*)::text AS total
        FROM monitor_events
        ${whereClause}
      `,
      params
    )

    const dataParams = [...params, pageSize, offset]
    const result = await this.pool.query<{
      id: number
      event_id: string | null
      event_type: string
      app_name: string | null
      env: string | null
      pathname: string | null
      event_timestamp: number | null
      received_at: string
      payload: MonitorEvent
    }>(
      `
        SELECT
          id,
          event_id,
          event_type,
          app_name,
          env,
          pathname,
          event_timestamp,
          received_at,
          payload
        FROM monitor_events
        ${whereClause}
        ORDER BY received_at DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      dataParams
    )

    return {
      total: Number(totalResult.rows[0]?.total ?? '0'),
      page,
      pageSize,
      events: result.rows.map(mapEventRow)
    }
  }

  async getEventById(id: number): Promise<EventRow | null> {
    const result = await this.pool.query<{
      id: number
      event_id: string | null
      event_type: string
      app_name: string | null
      env: string | null
      pathname: string | null
      event_timestamp: number | null
      received_at: string
      payload: MonitorEvent
    }>(
      `
        SELECT
          id,
          event_id,
          event_type,
          app_name,
          env,
          pathname,
          event_timestamp,
          received_at,
          payload
        FROM monitor_events
        WHERE id = $1
      `,
      [id]
    )

    const row = result.rows[0]
    return row ? mapEventRow(row) : null
  }
}
