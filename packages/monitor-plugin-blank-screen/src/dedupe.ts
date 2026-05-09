interface BlankScreenDedupeInput {
  pathname: string
  trigger: 'initial' | 'route_change' | 'manual'
  score: number
}

function normalizeScore(score: number) {
  return score.toFixed(1)
}

function createDedupeKey(input: BlankScreenDedupeInput) {
  return [input.pathname, input.trigger, normalizeScore(input.score)].join('|')
}

export function createBlankScreenDedupe(windowMs: number) {
  const cache = new Map<string, number>()

  function shouldReport(input: BlankScreenDedupeInput) {
    const now = Date.now()
    const key = createDedupeKey(input)
    const lastReportedAt = cache.get(key)

    if (!lastReportedAt || now - lastReportedAt > windowMs) {
      cache.set(key, now)
      return true
    }

    return false
  }

  function cleanup() {
    const now = Date.now()

    for (const [key, timestamp] of cache.entries()) {
      if (now - timestamp > windowMs) {
        cache.delete(key)
      }
    }
  }

  return {
    shouldReport,
    cleanup
  }
}
