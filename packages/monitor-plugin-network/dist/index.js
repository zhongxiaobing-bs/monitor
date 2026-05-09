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
  networkPlugin: () => networkPlugin
});
module.exports = __toCommonJS(index_exports);

// src/normalize.ts
function createHttpErrorEvent({
  url,
  method,
  status,
  duration,
  responseMessage
}) {
  return {
    eventId: "",
    eventType: "http_error",
    appId: "",
    env: "",
    url: "",
    pathname: "",
    title: "",
    timestamp: 0,
    userAgent: "",
    request: {
      url,
      method,
      status,
      duration,
      success: false,
      source: "fetch"
    },
    response: {
      message: responseMessage
    }
  };
}

// src/url.ts
function resolveUrlObject(url) {
  return new URL(url, window.location.origin);
}
function isMonitorRequest(requestUrl, dsn) {
  try {
    const request = resolveUrlObject(requestUrl);
    const target = resolveUrlObject(dsn);
    return request.origin === target.origin && request.pathname === target.pathname;
  } catch {
    return requestUrl === dsn;
  }
}

// src/patch-fetch.ts
function patchFetch(api, sdkOptions, options) {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return () => {
    };
  }
  const originalFetch = window.fetch.bind(window);
  const {
    capture5xx = true,
    captureNetworkError = true
  } = options;
  window.fetch = async (input, init) => {
    const method = ((init == null ? void 0 : init.method) || "GET").toUpperCase();
    const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (isMonitorRequest(requestUrl, sdkOptions.dsn)) {
      return originalFetch(input, init);
    }
    const startedAt = Date.now();
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startedAt;
      if (capture5xx && response.status >= 500) {
        api.emit(
          createHttpErrorEvent({
            url: requestUrl,
            method,
            status: response.status,
            duration,
            responseMessage: response.statusText
          })
        );
      }
      return response;
    } catch (error) {
      const duration = Date.now() - startedAt;
      if (captureNetworkError) {
        api.emit(
          createHttpErrorEvent({
            url: requestUrl,
            method,
            duration,
            responseMessage: error instanceof Error ? error.message : "Fetch request failed"
          })
        );
      }
      throw error;
    }
  };
  return () => {
    window.fetch = originalFetch;
  };
}

// src/index.ts
function networkPlugin(options = {}) {
  return {
    name: "network-plugin",
    setup({ api, options: sdkOptions }) {
      const disposeFetch = patchFetch(api, sdkOptions, options);
      return () => {
        disposeFetch();
      };
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  networkPlugin
});
//# sourceMappingURL=index.js.map