import type { Pool } from 'pg'

const schemaSql = `
CREATE TABLE IF NOT EXISTS monitor_events (
  id BIGSERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_id TEXT,
  event_type TEXT NOT NULL,
  app_id TEXT,
  app_name TEXT,
  env TEXT,
  release TEXT,
  url TEXT,
  pathname TEXT,
  title TEXT,
  event_timestamp BIGINT,
  user_agent TEXT,
  user_id TEXT,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS monitor_events_event_type_idx
  ON monitor_events (event_type);

CREATE INDEX IF NOT EXISTS monitor_events_event_timestamp_idx
  ON monitor_events (event_timestamp);

CREATE INDEX IF NOT EXISTS monitor_events_received_at_idx
  ON monitor_events (received_at);

CREATE INDEX IF NOT EXISTS monitor_events_app_name_idx
  ON monitor_events (app_name);

CREATE INDEX IF NOT EXISTS monitor_events_env_idx
  ON monitor_events (env);

CREATE INDEX IF NOT EXISTS monitor_events_pathname_idx
  ON monitor_events (pathname);
`

export async function migrateDatabase(pool: Pool) {
  await pool.query(schemaSql)
}
