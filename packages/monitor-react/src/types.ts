import type { ReactNode } from 'react'
import type { MonitorApi } from '@company/monitor-types'

export interface MonitorErrorBoundaryProps {
  monitor: MonitorApi
  fallback?: ReactNode
  children: ReactNode
}
