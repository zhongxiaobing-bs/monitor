import { MonitorEvent } from '@company/monitor-types';

declare class EventQueue {
    private events;
    add(event: MonitorEvent): void;
    drain(): MonitorEvent[];
    size(): number;
}

declare function sendEvents(dsn: string, events: MonitorEvent[]): Promise<void>;

export { EventQueue, sendEvents };
