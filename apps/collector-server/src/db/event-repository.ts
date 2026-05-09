import type { Pool } from 'pg'
import type { MonitorEvent } from '../types/monitor'

export class EventRepository {
  constructor(private readonly pool: Pick<Pool, 'query'>) {}

  async insertMany(events: MonitorEvent[]) {
    await Promise.all(events.map((event) => this.insert(event)))
  }

  async insert(event: MonitorEvent) {
    await this.pool.query(
      `
        INSERT INTO monitor_events (
          event_id,
          event_type,
          app_id,
          app_name,
          env,
          release,
          url,
          pathname,
          title,
          event_timestamp,
          user_agent,
          user_id,
          payload
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb
        )
      `,
      [
        event.eventId ?? null,
        event.eventType,
        event.appId ?? null,
        event.appName ?? null,
        event.env ?? null,
        event.release ?? null,
        event.url ?? null,
        event.pathname ?? null,
        event.title ?? null,
        event.timestamp ?? null,
        event.userAgent ?? null,
        event.userId ?? null,
        JSON.stringify(event)
      ]
    )
  }
}
