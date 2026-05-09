import type { MonitorPlugin } from '@company/monitor-types'
import { patchFetch } from './patch-fetch'
import type { NetworkPluginOptions } from './types'

export function networkPlugin(
  options: NetworkPluginOptions = {}
): MonitorPlugin {
  return {
    name: 'network-plugin',
    setup({ api, options: sdkOptions }) {
      const disposeFetch = patchFetch(api, sdkOptions, options)

      return () => {
        disposeFetch()
      }
    }
  }
}

export type { NetworkPluginOptions } from './types'
