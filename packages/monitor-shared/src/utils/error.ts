interface NormalizedError {
  name?: string
  message: string
  stack?: string
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }

  if (typeof error === 'string') {
    return {
      message: error
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const maybeError = error as { name?: unknown; message: string; stack?: unknown }

    return {
      name: typeof maybeError.name === 'string' ? maybeError.name : undefined,
      message: maybeError.message,
      stack: typeof maybeError.stack === 'string' ? maybeError.stack : undefined
    }
  }

  return {
    message: 'Unknown error'
  }
}
