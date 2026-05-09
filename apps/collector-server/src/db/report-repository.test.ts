import { describe, expect, it, vi } from 'vitest'
import { ReportRepository } from './report-repository'

describe('ReportRepository', () => {
  it('builds grouped queries using the mapped column name', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] })
    const repository = new ReportRepository({ query })

    await repository.getGroups({
      groupBy: 'eventType',
      appName: 'React Playground'
    })

    expect(query).toHaveBeenCalledTimes(1)
    const call = query.mock.calls[0]
    const sql = call?.[0]
    const params = call?.[1]

    expect(sql).toContain('event_type AS value')
    expect(sql).toContain('GROUP BY event_type')
    expect(params).toEqual(['React Playground'])
  })

  it('builds paginated events queries with keyword filters', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })
      .mockResolvedValueOnce({ rows: [] })
    const repository = new ReportRepository({ query })

    await repository.getEvents({
      page: 2,
      pageSize: 10,
      keyword: 'Failed to fetch',
      eventType: 'exception'
    })

    expect(query).toHaveBeenCalledTimes(2)
    const [, dataCall] = query.mock.calls
    const sql = dataCall?.[0]
    const params = dataCall?.[1]

    expect(sql).toContain('payload::text ILIKE')
    expect(sql).toContain('ORDER BY received_at DESC')
    expect(params).toEqual(['exception', '%Failed to fetch%', 10, 10])
  })
})
