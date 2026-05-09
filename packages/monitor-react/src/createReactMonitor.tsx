import { type ComponentType, type ReactNode, createContext, useContext } from 'react'
import { initMonitor } from '@company/monitor-core'
import { blankScreenPlugin, type BlankScreenPluginOptions } from '@company/monitor-plugin-blank-screen'
import { errorPlugin, type ErrorPluginOptions } from '@company/monitor-plugin-error'
import { networkPlugin, type NetworkPluginOptions } from '@company/monitor-plugin-network'
import type { MonitorInitOptions, MonitorApi, MonitorPlugin } from '@company/monitor-types'
import { MonitorErrorBoundary } from './MonitorErrorBoundary'

export type DefaultReactMonitorPluginName =
  | 'error'
  | 'network'
  | 'blankScreen'

export interface CreateReactMonitorOptions
  extends Omit<MonitorInitOptions, 'plugins'> {
  plugins?: MonitorPlugin[]
  disableDefaultPlugins?: DefaultReactMonitorPluginName[]
  error?: ErrorPluginOptions
  network?: NetworkPluginOptions
  blankScreen?: BlankScreenPluginOptions
  fallback?: ReactNode
}

export interface MonitorRootProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ReactMonitorInstance {
  monitor: MonitorApi
  MonitorRoot: (props: MonitorRootProps) => ReactNode
  withMonitor: <TProps extends object>(Component: ComponentType<TProps>) => ComponentType<TProps>
}

const MonitorContext = createContext<MonitorApi | null>(null)

export function createReactMonitor(
  options: CreateReactMonitorOptions
): ReactMonitorInstance {
  const monitor = initMonitor({
    ...options,
    plugins: [
      ...getDefaultPlugins(options),
      ...(options.plugins ?? [])
    ]
  })

  function MonitorRoot({ children, fallback }: MonitorRootProps) {
    return (
      <MonitorContext.Provider value={monitor}>
        <MonitorErrorBoundary monitor={monitor} fallback={fallback ?? options.fallback}>
          {children}
        </MonitorErrorBoundary>
      </MonitorContext.Provider>
    )
  }

  function withMonitor<TProps extends object>(Component: ComponentType<TProps>) {
    return function WrappedComponent(props: TProps) {
      return (
        <MonitorRoot>
          <Component {...props} />
        </MonitorRoot>
      )
    }
  }

  return {
    monitor,
    MonitorRoot,
    withMonitor
  }
}

export function useMonitor() {
  const monitor = useContext(MonitorContext)

  if (!monitor) {
    throw new Error('useMonitor must be used within MonitorRoot')
  }

  return monitor
}

function getDefaultPlugins(options: CreateReactMonitorOptions): MonitorPlugin[] {
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
