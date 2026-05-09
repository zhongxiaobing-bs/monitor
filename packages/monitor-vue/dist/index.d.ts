import { Plugin, App } from 'vue';
import { BlankScreenPluginOptions } from '@company/monitor-plugin-blank-screen';
import { ErrorPluginOptions } from '@company/monitor-plugin-error';
import { NetworkPluginOptions } from '@company/monitor-plugin-network';
import { MonitorInitOptions, MonitorPlugin, MonitorApi } from '@company/monitor-types';

type DefaultVueMonitorPluginName = 'error' | 'network' | 'blankScreen';
interface CreateVueMonitorOptions extends Omit<MonitorInitOptions, 'plugins'> {
    plugins?: MonitorPlugin[];
    disableDefaultPlugins?: DefaultVueMonitorPluginName[];
    error?: ErrorPluginOptions;
    network?: NetworkPluginOptions;
    blankScreen?: BlankScreenPluginOptions;
}
interface VueMonitorInstance {
    monitor: MonitorApi;
    plugin: Plugin;
    install: (app: App) => void;
}
declare function createVueMonitor(options: CreateVueMonitorOptions): VueMonitorInstance;

declare function createVueMonitorPlugin(monitor: MonitorApi): {
    install(app: App): void;
};

declare function useMonitor(): MonitorApi;

export { type CreateVueMonitorOptions, type DefaultVueMonitorPluginName, type VueMonitorInstance, createVueMonitor, createVueMonitorPlugin, useMonitor };
