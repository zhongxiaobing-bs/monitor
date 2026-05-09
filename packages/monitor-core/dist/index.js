"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Monitor: () => Monitor,
  initMonitor: () => initMonitor
});
module.exports = __toCommonJS(index_exports);

// src/monitor.ts
var import_monitor_shared2 = require("@company/monitor-shared");
var import_monitor_transport = require("@company/monitor-transport");

// src/context.ts
var import_monitor_shared = require("@company/monitor-shared");
function createBaseContext(options) {
  const locationInfo = (0, import_monitor_shared.getLocationInfo)();
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
    __publicField(this, "queue", new import_monitor_transport.EventQueue());
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
      eventId: event.eventId || (0, import_monitor_shared2.createEventId)(),
      timestamp: event.timestamp || Date.now()
    };
    const finalEvent = this.options.beforeSend ? this.options.beforeSend(mergedEvent) : mergedEvent;
    if (!finalEvent) return;
    this.queue.add(finalEvent);
    void this.flush();
  }
  captureException(error, extra) {
    const normalized = (0, import_monitor_shared2.normalizeError)(error);
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
    await (0, import_monitor_transport.sendEvents)(this.options.dsn, events);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Monitor,
  initMonitor
});
//# sourceMappingURL=index.js.map