const DEFAULT_WINDOW_MS = 5 * 60 * 1000

export class DedupeService {
  private cache = new Map<string, number>()
  private windowMs: number

  constructor(windowMs = DEFAULT_WINDOW_MS) {
    this.windowMs = windowMs
  }

  shouldNotify(key: string) {
    const now = Date.now()
    const lastSentAt = this.cache.get(key)

    if (!lastSentAt) {
      this.cache.set(key, now)
      return true
    }

    if (now - lastSentAt > this.windowMs) {
      this.cache.set(key, now)
      return true
    }

    return false
  }

  cleanup() {
    const now = Date.now()

    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > this.windowMs) {
        this.cache.delete(key)
      }
    }
  }
}
