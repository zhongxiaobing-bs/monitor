import type { App } from 'vue'
import type { MonitorApi } from '@company/monitor-types'
import { monitorInjectionKey } from './symbols'

export function createVueMonitorPlugin(monitor: MonitorApi) {
  return {
    install(app: App) {
      app.provide(monitorInjectionKey, monitor)

      const previousErrorHandler = app.config.errorHandler

      app.config.errorHandler = (error, instance, info) => {
        monitor.captureException(error, {
          vueInfo: info
        })

        previousErrorHandler?.(error, instance, info)
      }
    }
  }
}
