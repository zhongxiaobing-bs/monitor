// src/createVueMonitor.ts
import { initMonitor } from "@company/monitor-core";
import { blankScreenPlugin } from "@company/monitor-plugin-blank-screen";
import { errorPlugin } from "@company/monitor-plugin-error";
import { networkPlugin } from "@company/monitor-plugin-network";

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
  const monitor = initMonitor({
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

// src/useMonitor.ts
import { inject } from "vue";
function useMonitor() {
  const monitor = inject(monitorInjectionKey, null);
  if (!monitor) {
    throw new Error("Monitor instance is not provided");
  }
  return monitor;
}
export {
  createVueMonitor,
  createVueMonitorPlugin,
  useMonitor
};
//# sourceMappingURL=index.mjs.map