type MonitorEventType = 'exception' | 'resource_error' | 'http_error' | 'blank_screen';
interface Breadcrumb {
    type: string;
    category?: string;
    message?: string;
    timestamp: number;
    data?: Record<string, unknown>;
}
interface BaseEvent {
    eventId: string;
    eventType: MonitorEventType;
    appId: string;
    appName?: string;
    env: string;
    release?: string;
    url: string;
    pathname: string;
    title: string;
    timestamp: number;
    userAgent: string;
    userId?: string;
    deviceId?: string;
    breadcrumbs?: Breadcrumb[];
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
}
interface ExceptionEvent extends BaseEvent {
    eventType: 'exception';
    error: {
        name?: string;
        message: string;
        stack?: string;
        source?: string;
    };
}
interface HttpErrorEvent extends BaseEvent {
    eventType: 'http_error';
    request: {
        url: string;
        method: string;
        status?: number;
        duration?: number;
        success: boolean;
        source?: 'fetch' | 'xhr';
    };
    response?: {
        code?: string | number;
        message?: string;
    };
}
interface BlankScreenEvent extends BaseEvent {
    eventType: 'blank_screen';
    blankScreen: {
        score: number;
        rootSelector?: string;
        domSummary?: string[];
        readyState?: string;
        trigger?: 'initial' | 'route_change' | 'manual';
    };
}
type MonitorEvent = ExceptionEvent | HttpErrorEvent | BlankScreenEvent;

interface MonitorApi {
    emit(event: MonitorEvent): void;
    captureException(error: unknown, extra?: Record<string, unknown>): void;
}
interface PluginSetupContext {
    api: MonitorApi;
    options: MonitorInitOptions;
}
interface MonitorPlugin {
    name: string;
    setup(context: PluginSetupContext): void | (() => void);
}

interface MonitorInitOptions {
    appId: string;
    appName?: string;
    env: string;
    release?: string;
    dsn: string;
    sampleRate?: number;
    plugins?: MonitorPlugin[];
    beforeSend?: (event: MonitorEvent) => MonitorEvent | null;
}

export type { BaseEvent, BlankScreenEvent, Breadcrumb, ExceptionEvent, HttpErrorEvent, MonitorApi, MonitorEvent, MonitorEventType, MonitorInitOptions, MonitorPlugin, PluginSetupContext };
