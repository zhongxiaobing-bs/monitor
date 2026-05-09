import Fastify from 'fastify'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerReportRoutes } from './report-routes'

describe('registerReportRoutes', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid summary query params', async () => {
    const repository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn(),
      getEventById: vi.fn()
    }
    const app = Fastify()
    registerReportRoutes(app, repository)

    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/summary?eventType=invalid'
    })

    expect(response.statusCode).toBe(400)
    expect(repository.getSummary).not.toHaveBeenCalled()

    await app.close()
  })

  it('returns grouped data for valid requests', async () => {
    const repository = {
      getSummary: vi.fn(),
      getGroups: vi.fn().mockResolvedValue([{ value: 'exception', count: 3 }]),
      getEvents: vi.fn(),
      getEventById: vi.fn()
    }
    const app = Fastify()
    registerReportRoutes(app, repository)

    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/groups?groupBy=eventType'
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([{ value: 'exception', count: 3 }])

    await app.close()
  })

  it('returns paginated events for valid requests', async () => {
    const repository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn().mockResolvedValue({
        total: 1,
        page: 1,
        pageSize: 20,
        events: []
      }),
      getEventById: vi.fn()
    }
    const app = Fastify()
    registerReportRoutes(app, repository)

    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/events?page=1&pageSize=20'
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      total: 1,
      page: 1,
      pageSize: 20,
      events: []
    })

    await app.close()
  })

  it('returns 404 when the event detail is missing', async () => {
    const repository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn(),
      getEventById: vi.fn().mockResolvedValue(null)
    }
    const app = Fastify()
    registerReportRoutes(app, repository)

    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/events/123'
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ success: false, code: 'EVENT_NOT_FOUND' })

    await app.close()
  })
})
