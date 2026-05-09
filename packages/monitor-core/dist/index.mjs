var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/monitor.ts
import { createEventId, normalizeError } from "@company/monitor-shared";
import { EventQueue, sendEvents } from "@company/monitor-transport";

// src/context.ts
import { getLocationInfo } from "@company/monitor-shared";
function createBaseContext(options) {
  const locationInfo = getLocationInfo();
  return {
    appId: options.appId,
    appName: options.appName,
    env: options.env,
    release: options.release,
    ...locationInfo
  };
}

// src/plugin-system.ts
function setupPlugins(plugins, api, options) {
  const disposers = [];
  for (const plugin of plugins) {
    const disposer = plugin.setup({ api, options });
    if (typeof disposer === "function") {
      disposers.push(disposer);
    }
  }
  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

// src/monitor.ts
var Monitor = class {
  constructor(options) {
    __publicField(this, "queue", new EventQueue());
    __publicField(this, "options");
    __publicField(this, "context");
    __publicField(this, "disposePlugins", null);
    var _a;
    this.options = options;
    this.context = createBaseContext(options);
    this.disposePlugins = setupPlugins((_a = options.plugins) != null ? _a : [], this, options);
  }
  emit(event) {
    const mergedEvent = {
      ...this.context,
      ...event,
      eventId: event.eventId || createEventId(),
      timestamp: event.timestamp || Date.now()
    };
    const finalEvent = this.options.beforeSend ? this.options.beforeSend(mergedEvent) : mergedEvent;
    if (!finalEvent) return;
    this.queue.add(finalEvent);
    void this.flush();
  }
  captureException(error, extra) {
    const normalized = normalizeError(error);
    const event = {
      eventId: "",
      eventType: "exception",
      appId: "",
      env: "",
      url: "",
      pathname: "",
      title: "",
      timestamp: 0,
      userAgent: "",
      extra,
      error: {
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
        source: "react"
      }
    };
    this.emit(event);
  }
  async flush() {
    const events = this.queue.drain();
    await sendEvents(this.options.dsn, events);
  }
  destroy() {
    var _a;
    (_a = this.disposePlugins) == null ? void 0 : _a.call(this);
    this.disposePlugins = null;
  }
};
function initMonitor(options) {
  return new Monitor(options);
}
export {
  Monitor,
  initMonitor
};
//# sourceMappingURL=index.mjs.map