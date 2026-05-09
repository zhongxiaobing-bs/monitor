import { MonitorApi, MonitorInitOptions, MonitorEvent } from '@company/monitor-types';

declare class Monitor implements MonitorApi {
    private queue;
    private options;
    private context;
    private disposePlugins;
    constructor(options: MonitorInitOptions);
    emit(event: MonitorEvent): void;
    captureException(error: unknown, extra?: Record<string, unknown>): void;
    flush(): Promise<void>;
    destroy(): void;
}
declare function initMonitor(options: MonitorInitOptions): Monitor;

export { Monitor, initMonitor };
