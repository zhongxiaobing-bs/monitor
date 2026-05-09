import type {
  EventRow,
  EventsFilter,
  EventsResult,
  GroupByField,
  GroupResult,
  ReportFilter,
  SummaryResult
} from '../types/report'

function toRequestParams(params: Record<string, unknown>) {
  const result: Record<string, string | number | undefined> = {}

  for (const [key, value] of Object.entries(params)) {
    if (
      value === undefined ||
      value === '' ||
      (typeof value !== 'string' && typeof value !== 'number')
    ) {
      continue
    }

    result[key] = value
  }

  return result
}

function toSearchParams(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const searchParams = toSearchParams(params)
  const response = await fetch(
    searchParams.size > 0 ? `${path}?${searchParams.toString()}` : path
  )

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export function fetchSummary(filter: ReportFilter) {
  return request<SummaryResult>(
    '/api/reports/summary',
    toRequestParams(filter as unknown as Record<string, unknown>)
  )
}

export function fetchGroups(filter: ReportFilter & { groupBy: GroupByField }) {
  return request<GroupResult[]>(
    '/api/reports/groups',
    toRequestParams(filter as unknown as Record<string, unknown>)
  )
}

export function fetchEvents(filter: EventsFilter) {
  return request<EventsResult>(
    '/api/reports/events',
    toRequestParams(filter as unknown as Record<string, unknown>)
  )
}

export function fetchEvent(id: number) {
  return request<EventRow>(`/api/reports/events/${id}`)
}
