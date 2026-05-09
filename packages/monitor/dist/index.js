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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  MonitorErrorBoundary: () => import_monitor_react.MonitorErrorBoundary,
  createReactMonitor: () => import_monitor_react.createReactMonitor,
  createVueMonitor: () => import_monitor_vue.createVueMonitor,
  useReactMonitor: () => import_monitor_react.useMonitor,
  useVueMonitor: () => import_monitor_vue.useMonitor
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("@company/monitor-core"), module.exports);
__reExport(index_exports, require("@company/monitor-plugin-error"), module.exports);
__reExport(index_exports, require("@company/monitor-plugin-network"), module.exports);
__reExport(index_exports, require("@company/monitor-plugin-blank-screen"), module.exports);
var import_monitor_react = require("@company/monitor-react");
var import_monitor_vue = require("@company/monitor-vue");
__reExport(index_exports, require("@company/monitor-types"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MonitorErrorBoundary,
  createReactMonitor,
  createVueMonitor,
  useReactMonitor,
  useVueMonitor,
  ...require("@company/monitor-core"),
  ...require("@company/monitor-plugin-error"),
  ...require("@company/monitor-plugin-network"),
  ...require("@company/monitor-plugin-blank-screen"),
  ...require("@company/monitor-types")
});
//# sourceMappingURL=index.js.map