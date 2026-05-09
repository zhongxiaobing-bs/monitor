import type { App, Plugin } from 'vue'
import { initMonitor } from '@company/monitor-core'
import { blankScreenPlugin, type BlankScreenPluginOptions } from '@company/monitor-plugin-blank-screen'
import { errorPlugin, type ErrorPluginOptions } from '@company/monitor-plugin-error'
import { networkPlugin, type NetworkPluginOptions } from '@company/monitor-plugin-network'
import type { MonitorInitOptions, MonitorApi, MonitorPlugin } from '@company/monitor-types'
import { createVueMonitorPlugin } from './plugin'

export type DefaultVueMonitorPluginName = 'error' | 'network' | 'blankScreen'

export interface CreateVueMonitorOptions
  extends Omit<MonitorInitOptions, 'plugins'> {
  plugins?: MonitorPlugin[]
  disableDefaultPlugins?: DefaultVueMonitorPluginName[]
  error?: ErrorPluginOptions
  network?: NetworkPluginOptions
  blankScreen?: BlankScreenPluginOptions
}

export interface VueMonitorInstance {
  monitor: MonitorApi
  plugin: Plugin
  install: (app: App) => void
}

export function createVueMonitor(
  options: CreateVueMonitorOptions
): VueMonitorInstance {
  const monitor = initMonitor({
    ...options,
    plugins: [
      ...getDefaultPlugins(options),
      ...(options.plugins ?? [])
    ]
  })

  const plugin = createVueMonitorPlugin(monitor)

  return {
    monitor,
    plugin,
    install(app: App) {
      app.use(plugin)
    }
  }
}

function getDefaultPlugins(options: CreateVueMonitorOptions): MonitorPlugin[] {
  const disabled = new Set(options.disableDefaultPlugins ?? [])
  const plugins: MonitorPlugin[] = []

  if (!disabled.has('error')) {
    plugins.push(errorPlugin(options.error))
  }

  if (!disabled.has('network')) {
    plugins.push(networkPlugin(options.network))
  }

  if (!disabled.has('blankScreen')) {
    plugins.push(blankScreenPlugin(options.blankScreen))
  }

  return plugins
}
