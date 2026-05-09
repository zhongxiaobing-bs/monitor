import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app'

vi.mock('./services/wecom-service', () => ({
  sendWecomMarkdown: vi.fn().mockResolvedValue(undefined)
}))

describe('createApp', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid top-level payload', async () => {
    const repository = {
      insert: vi.fn().mockResolvedValue(undefined)
    }
    const reportRepository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn(),
      getEventById: vi.fn()
    }
    const app = createApp({
      eventRepository: repository,
      reportRepository
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/collect',
      payload: {}
    })

    expect(response.statusCode).toBe(400)
    expect(repository.insert).not.toHaveBeenCalled()

    await app.close()
  })

  it('persists valid events and keeps the response shape', async () => {
    const repository = {
      insert: vi.fn().mockResolvedValue(undefined)
    }
    const reportRepository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn(),
      getEventById: vi.fn()
    }
    const app = createApp({
      eventRepository: repository,
      reportRepository
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/collect',
      payload: {
        events: [
          {
            eventType: 'http_error',
            appName: 'playground-react',
            env: 'dev',
            pathname: '/',
            timestamp: 1710000000000,
            request: {
              url: '/api/mock-500',
              method: 'GET',
              success: false,
              status: 500,
              source: 'fetch'
            },
            response: {
              message: 'mock internal server error'
            }
          }
        ]
      }
    })

    expect(response.statusCode).toBe(200)
    expect(repository.insert).toHaveBeenCalledTimes(1)
    expect(response.json()).toEqual({
      success: true,
      received: 1,
      exceptionCount: 0,
      blankScreenCount: 0,
      notified: 0,
      skippedNonProd: 0,
      skippedDedupe: 0
    })

    await app.close()
  })

  it('still returns success when persistence fails', async () => {
    const repository = {
      insert: vi.fn().mockRejectedValue(new Error('db down'))
    }
    const reportRepository = {
      getSummary: vi.fn(),
      getGroups: vi.fn(),
      getEvents: vi.fn(),
      getEventById: vi.fn()
    }
    const app = createApp({
      eventRepository: repository,
      reportRepository
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/collect',
      payload: {
        events: [
          {
            eventType: 'exception',
            env: 'dev',
            error: {
              message: 'boom'
            }
          }
        ]
      }
    })

    expect(response.statusCode).toBe(200)
    expect(repository.insert).toHaveBeenCalledTimes(1)
    expect(response.json()).toEqual({
      success: true,
      received: 1,
      exceptionCount: 1,
      blankScreenCount: 0,
      notified: 0,
      skippedNonProd: 1,
      skippedDedupe: 0
    })

    await app.close()
  })
})
