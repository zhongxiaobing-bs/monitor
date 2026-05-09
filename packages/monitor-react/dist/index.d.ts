import React, { ReactNode, ComponentType, Component, ErrorInfo } from 'react';
import { BlankScreenPluginOptions } from '@company/monitor-plugin-blank-screen';
import { ErrorPluginOptions } from '@company/monitor-plugin-error';
import { NetworkPluginOptions } from '@company/monitor-plugin-network';
import { MonitorInitOptions, MonitorPlugin, MonitorApi } from '@company/monitor-types';

type DefaultReactMonitorPluginName = 'error' | 'network' | 'blankScreen';
interface CreateReactMonitorOptions extends Omit<MonitorInitOptions, 'plugins'> {
    plugins?: MonitorPlugin[];
    disableDefaultPlugins?: DefaultReactMonitorPluginName[];
    error?: ErrorPluginOptions;
    network?: NetworkPluginOptions;
    blankScreen?: BlankScreenPluginOptions;
    fallback?: ReactNode;
}
interface MonitorRootProps {
    children: ReactNode;
    fallback?: ReactNode;
}
interface ReactMonitorInstance {
    monitor: MonitorApi;
    MonitorRoot: (props: MonitorRootProps) => ReactNode;
    withMonitor: <TProps extends object>(Component: ComponentType<TProps>) => ComponentType<TProps>;
}
declare function createReactMonitor(options: CreateReactMonitorOptions): ReactMonitorInstance;
declare function useMonitor(): MonitorApi;

interface MonitorErrorBoundaryProps {
    monitor: MonitorApi;
    fallback?: ReactNode;
    children: ReactNode;
}

interface MonitorErrorBoundaryState {
    hasError: boolean;
}
declare class MonitorErrorBoundary extends Component<MonitorErrorBoundaryProps, MonitorErrorBoundaryState> {
    state: MonitorErrorBoundaryState;
    static getDerivedStateFromError(): {
        hasError: boolean;
    };
    componentDidCatch(error: Error, info: ErrorInfo): void;
    render(): React.ReactNode;
}

export { type CreateReactMonitorOptions, type DefaultReactMonitorPluginName, MonitorErrorBoundary, type MonitorErrorBoundaryProps, type MonitorRootProps, type ReactMonitorInstance, createReactMonitor, useMonitor };
