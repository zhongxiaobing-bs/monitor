var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/createReactMonitor.tsx
import { createContext, useContext } from "react";
import { initMonitor } from "@company/monitor-core";
import { blankScreenPlugin } from "@company/monitor-plugin-blank-screen";
import { errorPlugin } from "@company/monitor-plugin-error";
import { networkPlugin } from "@company/monitor-plugin-network";

// src/MonitorErrorBoundary.tsx
import { Component } from "react";
var MonitorErrorBoundary = class extends Component {
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
import { jsx } from "react/jsx-runtime";
var MonitorContext = createContext(null);
function createReactMonitor(options) {
  var _a;
  const monitor = initMonitor({
    ...options,
    plugins: [
      ...getDefaultPlugins(options),
      ...(_a = options.plugins) != null ? _a : []
    ]
  });
  function MonitorRoot({ children, fallback }) {
    return /* @__PURE__ */ jsx(MonitorContext.Provider, { value: monitor, children: /* @__PURE__ */ jsx(MonitorErrorBoundary, { monitor, fallback: fallback != null ? fallback : options.fallback, children }) });
  }
  function withMonitor(Component2) {
    return function WrappedComponent(props) {
      return /* @__PURE__ */ jsx(MonitorRoot, { children: /* @__PURE__ */ jsx(Component2, { ...props }) });
    };
  }
  return {
    monitor,
    MonitorRoot,
    withMonitor
  };
}
function useMonitor() {
  const monitor = useContext(MonitorContext);
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
    plugins.push(errorPlugin(options.error));
  }
  if (!disabled.has("network")) {
    plugins.push(networkPlugin(options.network));
  }
  if (!disabled.has("blankScreen")) {
    plugins.push(blankScreenPlugin(options.blankScreen));
  }
  return plugins;
}
export {
  MonitorErrorBoundary,
  createReactMonitor,
  useMonitor
};
//# sourceMappingURL=index.mjs.map