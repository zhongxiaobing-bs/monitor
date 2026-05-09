import type { MonitorEvent } from '@company/monitor-types'

export class EventQueue {
  private events: MonitorEvent[] = []

  add(event: MonitorEvent) {
    this.events.push(event)
  }

  drain() {
    const current = [...this.events]
    this.events = []
    return current
  }

  size() {
    return this.events.length
  }
}
