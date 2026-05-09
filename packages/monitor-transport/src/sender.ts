import type { MonitorEvent } from '@company/monitor-types'

export async function sendEvents(dsn: string, events: MonitorEvent[]) {
  if (!events.length) return

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify({ events })], {
      type: 'application/json'
    })
    navigator.sendBeacon(dsn, blob)
    return
  }

  await fetch(dsn, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ events }),
    keepalive: true
  })
}
