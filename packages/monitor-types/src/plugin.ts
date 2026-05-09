import type { MonitorInitOptions } from './config'
import type { MonitorEvent } from './event'

export interface MonitorApi {
  emit(event: MonitorEvent): void
  captureException(error: unknown, extra?: Record<string, unknown>): void
}

export interface PluginSetupContext {
  api: MonitorApi
  options: MonitorInitOptions
}

export interface MonitorPlugin {
  name: string
  setup(context: PluginSetupContext): void | (() => void)
}
