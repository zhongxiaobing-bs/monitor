import type { MonitorPlugin } from '@company/monitor-types'
import { registerUnhandledRejection } from './unhandledrejection'
import { registerWindowOnError } from './onerror'
import type { ErrorPluginOptions } from './types'

export function errorPlugin(options: ErrorPluginOptions = {}): MonitorPlugin {
  const {
    captureOnError = true,
    captureUnhandledRejection = true
  } = options

  return {
    name: 'error-plugin',
    setup({ api }) {
      const disposers: Array<() => void> = []

      if (captureOnError) {
        disposers.push(registerWindowOnError(api))
      }

      if (captureUnhandledRejection) {
        disposers.push(registerUnhandledRejection(api))
      }

      return () => {
        for (const dispose of disposers) {
          dispose()
        }
      }
    }
  }
}

export type { ErrorPluginOptions } from './types'
