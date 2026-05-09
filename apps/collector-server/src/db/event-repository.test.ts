import { describe, expect, it, vi } from 'vitest'
import { EventRepository } from './event-repository'

describe('EventRepository', () => {
  it('maps event fields into the insert query', async () => {
    const query = vi.fn().mockResolvedValue(undefined)
    const repository = new EventRepository({ query })
    const event = {
      eventId: 'evt-1',
      eventType: 'exception' as const,
      appId: 'app-1',
      appName: 'playground-react',
      env: 'prod',
      release: '1.0.0',
      url: 'http://localhost:5173/',
      pathname: '/',
      title: 'Frontend Monitor Playground',
      timestamp: 1710000000000,
      userAgent: 'test-agent',
      userId: 'user-1',
      error: {
        message: 'boom'
      }
    }

    await repository.insert(event)

    expect(query).toHaveBeenCalledTimes(1)
    const call = query.mock.calls[0]

    expect(call).toBeDefined()
    const sql = call?.[0]
    const params = call?.[1]

    expect(sql).toContain('INSERT INTO monitor_events')
    expect(params).toEqual([
      'evt-1',
      'exception',
      'app-1',
      'playground-react',
      'prod',
      '1.0.0',
      'http://localhost:5173/',
      '/',
      'Frontend Monitor Playground',
      1710000000000,
      'test-agent',
      'user-1',
      JSON.stringify(event)
    ])
  })
})
