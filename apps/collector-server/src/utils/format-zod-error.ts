import type { ZodError } from 'zod'

export function formatZodError(error: ZodError, prefix?: string) {
  return error.issues.map((issue) => ({
    path: [prefix, ...issue.path]
      .filter((value): value is string | number => value !== undefined)
      .join('.'),
    message: issue.message
  }))
}
