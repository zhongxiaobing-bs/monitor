import { MonitorPlugin } from '@company/monitor-types';

interface BlankScreenPluginOptions {
    rootSelector?: string;
    delayMs?: number;
    scoreThreshold?: number;
    samplePoints?: Array<[number, number]>;
    ignoreSelectors?: string[];
    detectOnRouteChange?: boolean;
    routeChangeDelayMs?: number;
    dedupeWindowMs?: number;
}

declare function blankScreenPlugin(options?: BlankScreenPluginOptions): MonitorPlugin;

export { type BlankScreenPluginOptions, blankScreenPlugin };
