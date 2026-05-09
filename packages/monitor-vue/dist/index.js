"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createVueMonitor: () => createVueMonitor,
  createVueMonitorPlugin: () => createVueMonitorPlugin,
  useMonitor: () => useMonitor
});
module.exports = __toCommonJS(index_exports);

// src/createVueMonitor.ts
var import_monitor_core = require("@company/monitor-core");
var import_monitor_plugin_blank_screen = require("@company/monitor-plugin-blank-screen");
var import_monitor_plugin_error = require("@company/monitor-plugin-error");
var import_monitor_plugin_network = require("@company/monitor-plugin-network");

// src/symbols.ts
var monitorInjectionKey = /* @__PURE__ */ Symbol("monitor");

// src/plugin.ts
function createVueMonitorPlugin(monitor) {
  return {
    install(app) {
      app.provide(monitorInjectionKey, monitor);
      const previousErrorHandler = app.config.errorHandler;
      app.config.errorHandler = (error, instance, info) => {
        monitor.captureException(error, {
          vueInfo: info
        });
        previousErrorHandler == null ? void 0 : previousErrorHandler(error, instance, info);
      };
    }
  };
}

// src/createVueMonitor.ts
function createVueMonitor(options) {
  var _a;
  const monitor = (0, import_monitor_core.initMonitor)({
    ...options,
    plugins: [
      ...getDefaultPlugins(options),
      ...(_a = options.plugins) != null ? _a : []
    ]
  });
  const plugin = createVueMonitorPlugin(monitor);
  return {
    monitor,
    plugin,
    install(app) {
      app.use(plugin);
    }
  };
}
function getDefaultPlugins(options) {
  var _a;
  const disabled = new Set((_a = options.disableDefaultPlugins) != null ? _a : []);
  const plugins = [];
  if (!disabled.has("error")) {
    plugins.push((0, import_monitor_plugin_error.errorPlugin)(options.error));
  }
  if (!disabled.has("network")) {
    plugins.push((0, import_monitor_plugin_network.networkPlugin)(options.network));
  }
  if (!disabled.has("blankScreen")) {
    plugins.push((0, import_monitor_plugin_blank_screen.blankScreenPlugin)(options.blankScreen));
  }
  return plugins;
}

// src/useMonitor.ts
var import_vue = require("vue");
function useMonitor() {
  const monitor = (0, import_vue.inject)(monitorInjectionKey, null);
  if (!monitor) {
    throw new Error("Monitor instance is not provided");
  }
  return monitor;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createVueMonitor,
  createVueMonitorPlugin,
  useMonitor
});
//# sourceMappingURL=index.js.map