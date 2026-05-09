import { MonitorPlugin } from '@company/monitor-types';

interface NetworkPluginOptions {
    timeoutMs?: number;
    capture5xx?: boolean;
    captureTimeout?: boolean;
    captureNetworkError?: boolean;
}

declare function networkPlugin(options?: NetworkPluginOptions): MonitorPlugin;

export { type NetworkPluginOptions, networkPlugin };
