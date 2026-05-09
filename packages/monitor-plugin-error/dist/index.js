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
  errorPlugin: () => errorPlugin
});
module.exports = __toCommonJS(index_exports);

// src/normalize.ts
var import_monitor_shared = require("@company/monitor-shared");
function createExceptionEvent({
  error,
  source
}) {
  const normalized = (0, import_monitor_shared.normalizeError)(error);
  return {
    eventId: "",
    eventType: "exception",
    appId: "",
    env: "",
    url: "",
    pathname: "",
    title: "",
    timestamp: 0,
    userAgent: "",
    error: {
      name: normalized.name,
      message: normalized.message,
      stack: normalized.stack,
      source
    }
  };
}

// src/unhandledrejection.ts
function registerUnhandledRejection(api) {
  const handler = (event) => {
    const exceptionEvent = createExceptionEvent({
      error: event.reason,
      source: "unhandledrejection"
    });
    api.emit(exceptionEvent);
  };
  window.addEventListener("unhandledrejection", handler);
  return () => {
    window.removeEventListener("unhandledrejection", handler);
  };
}

// src/onerror.ts
function registerWindowOnError(api) {
  const handler = (message, _source, _lineno, _colno, error) => {
    const targetError = error != null ? error : message;
    const event = createExceptionEvent({
      error: targetError,
      source: "window.onerror"
    });
    api.emit(event);
    return false;
  };
  window.onerror = handler;
  return () => {
    if (window.onerror === handler) {
      window.onerror = null;
    }
  };
}

// src/index.ts
function errorPlugin(options = {}) {
  const {
    captureOnError = true,
    captureUnhandledRejection = true
  } = options;
  return {
    name: "error-plugin",
    setup({ api }) {
      const disposers = [];
      if (captureOnError) {
        disposers.push(registerWindowOnError(api));
      }
      if (captureUnhandledRejection) {
        disposers.push(registerUnhandledRejection(api));
      }
      return () => {
        for (const dispose of disposers) {
          dispose();
        }
      };
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  errorPlugin
});
//# sourceMappingURL=index.js.map