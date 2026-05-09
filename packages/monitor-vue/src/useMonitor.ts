import { inject } from 'vue'
import type { MonitorApi } from '@company/monitor-types'
import { monitorInjectionKey } from './symbols'

export function useMonitor() {
  const monitor = inject<MonitorApi | null>(monitorInjectionKey, null)

  if (!monitor) {
    throw new Error('Monitor instance is not provided')
  }

  return monitor
}
