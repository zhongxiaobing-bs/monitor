// src/normalize.ts
import { normalizeError } from "@company/monitor-shared";
function createExceptionEvent({
  error,
  source
}) {
  const normalized = normalizeError(error);
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
export {
  errorPlugin
};
//# sourceMappingURL=index.mjs.map