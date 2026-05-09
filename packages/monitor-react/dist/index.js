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
  MonitorErrorBoundary: () => MonitorErrorBoundary,
  createReactMonitor: () => createReactMonitor,
  useMonitor: () => useMonitor
});
module.exports = __toCommonJS(index_exports);

// src/createReactMonitor.tsx
var import_react2 = require("react");
var import_monitor_core = require("@company/monitor-core");
var import_monitor_plugin_blank_screen = require("@company/monitor-plugin-blank-screen");
var import_monitor_plugin_error = require("@company/monitor-plugin-error");
var import_monitor_plugin_network = require("@company/monitor-plugin-network");

// src/MonitorErrorBoundary.tsx
var import_react = require("react");
var MonitorErrorBoundary = class extends import_react.Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", {
      hasError: false
    });
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    this.props.monitor.captureException(error, {
      componentStack: info.componentStack
    });
  }
  render() {
    var _a;
    if (this.state.hasError) {
      return (_a = this.props.fallback) != null ? _a : null;
    }
    return this.props.children;
  }
};

// src/createReactMonitor.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var MonitorContext = (0, import_react2.createContext)(null);
function createReactMonitor(options) {
  var _a;
  const monitor = (0, import_monitor_core.initMonitor)({
    ...options,
    plugins: [
      ...getDefaultPlugins(options),
      ...(_a = options.plugins) != null ? _a : []
    ]
  });
  function MonitorRoot({ children, fallback }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorContext.Provider, { value: monitor, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorErrorBoundary, { monitor, fallback: fallback != null ? fallback : options.fallback, children }) });
  }
  function withMonitor(Component2) {
    return function WrappedComponent(props) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRoot, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component2, { ...props }) });
    };
  }
  return {
    monitor,
    MonitorRoot,
    withMonitor
  };
}
function useMonitor() {
  const monitor = (0, import_react2.useContext)(MonitorContext);
  if (!monitor) {
    throw new Error("useMonitor must be used within MonitorRoot");
  }
  return monitor;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MonitorErrorBoundary,
  createReactMonitor,
  useMonitor
});
//# sourceMappingURL=index.js.map