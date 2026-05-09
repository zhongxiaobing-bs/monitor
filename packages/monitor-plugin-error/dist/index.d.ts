import { MonitorPlugin } from '@company/monitor-types';

interface ErrorPluginOptions {
    captureOnError?: boolean;
    captureUnhandledRejection?: boolean;
}

declare function errorPlugin(options?: ErrorPluginOptions): MonitorPlugin;

export { type ErrorPluginOptions, errorPlugin };
