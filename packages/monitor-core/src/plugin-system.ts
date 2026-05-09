import type {
  MonitorApi,
  MonitorInitOptions,
  MonitorPlugin
} from '@company/monitor-types'

export function setupPlugins(
  plugins: MonitorPlugin[],
  api: MonitorApi,
  options: MonitorInitOptions
) {
  const disposers: Array<() => void> = []

  for (const plugin of plugins) {
    const disposer = plugin.setup({ api, options })
    if (typeof disposer === 'function') {
      disposers.push(disposer)
    }
  }

  return () => {
    for (const dispose of disposers) {
      dispose()
    }
  }
}
