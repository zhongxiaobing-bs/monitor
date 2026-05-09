import { z } from 'zod'

export const baseEventSchema = z.object({
  eventId: z.string().optional(),
  eventType: z.string(),
  appId: z.string().optional(),
  appName: z.string().optional(),
  env: z.string().optional(),
  release: z.string().optional(),
  url: z.string().optional(),
  pathname: z.string().optional(),
  title: z.string().optional(),
  timestamp: z.number().optional(),
  userAgent: z.string().optional(),
  userId: z.string().optional(),
  pageLevel: z.enum(['critical', 'normal']).optional()
})

export const exceptionEventSchema = baseEventSchema.extend({
  eventType: z.literal('exception'),
  error: z.object({
    name: z.string().optional(),
    message: z.string(),
    stack: z.string().optional(),
    source: z.string().optional()
  })
})

export const blankScreenEventSchema = baseEventSchema.extend({
  eventType: z.literal('blank_screen'),
  blankScreen: z.object({
    score: z.number(),
    rootSelector: z.string().optional(),
    domSummary: z.array(z.string()).optional(),
    readyState: z.string().optional(),
    trigger: z.enum(['initial', 'route_change', 'manual']).optional()
  })
})

export const httpErrorEventSchema = baseEventSchema.extend({
  eventType: z.literal('http_error'),
  request: z.object({
    url: z.string(),
    method: z.string(),
    status: z.number().optional(),
    duration: z.number().optional(),
    success: z.boolean(),
    source: z.enum(['fetch', 'xhr']).optional()
  }),
  response: z
    .object({
      code: z.union([z.string(), z.number()]).optional(),
      message: z.string().optional()
    })
    .optional()
})

export const collectRequestSchema = z.object({
  events: z.array(z.unknown())
})

export function parseMonitorEvent(event: unknown) {
  const baseParsed = baseEventSchema.safeParse(event)

  if (!baseParsed.success) {
    return baseParsed
  }

  const { eventType } = baseParsed.data

  if (eventType === 'exception') {
    return exceptionEventSchema.safeParse(event)
  }

  if (eventType === 'blank_screen') {
    return blankScreenEventSchema.safeParse(event)
  }

  if (eventType === 'http_error') {
    return httpErrorEventSchema.safeParse(event)
  }

  return baseEventSchema.safeParse(event)
}

export type ParsedBaseEvent = z.infer<typeof baseEventSchema>
export type ParsedExceptionEvent = z.infer<typeof exceptionEventSchema>
export type ParsedBlankScreenEvent = z.infer<typeof blankScreenEventSchema>
export type ParsedHttpErrorEvent = z.infer<typeof httpErrorEventSchema>
export type CollectRequestInput = z.infer<typeof collectRequestSchema>
