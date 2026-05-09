import type { MonitorEvent } from './event'
import type { MonitorPlugin } from './plugin'

export interface MonitorInitOptions {
  appId: string
  appName?: string
  env: string
  release?: string
  dsn: string
  sampleRate?: number
  plugins?: MonitorPlugin[]
  beforeSend?: (event: MonitorEvent) => MonitorEvent | null
}
