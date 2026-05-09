import { z } from 'zod'

const reportFilterSchema = z.object({
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
  appName: z.string().min(1).optional(),
  env: z.string().min(1).optional(),
  eventType: z.enum(['exception', 'blank_screen', 'http_error']).optional()
})

export const summaryQuerySchema = reportFilterSchema

export const groupsQuerySchema = reportFilterSchema.extend({
  groupBy: z.enum(['appName', 'env', 'pathname', 'eventType'])
})

export const eventsQuerySchema = reportFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().min(1).optional(),
  eventId: z.string().min(1).optional()
})

export const eventDetailParamsSchema = z.object({
  id: z.coerce.number().int().min(1)
})
