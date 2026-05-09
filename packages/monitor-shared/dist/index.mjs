// src/utils/uuid.ts
function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// src/utils/error.ts
function normalizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  if (typeof error === "string") {
    return {
      message: error
    };
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    const maybeError = error;
    return {
      name: typeof maybeError.name === "string" ? maybeError.name : void 0,
      message: maybeError.message,
      stack: typeof maybeError.stack === "string" ? maybeError.stack : void 0
    };
  }
  return {
    message: "Unknown error"
  };
}

// src/utils/browser.ts
function getLocationInfo() {
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    title: document.title,
    userAgent: navigator.userAgent
  };
}
export {
  createEventId,
  getLocationInfo,
  normalizeError
};
//# sourceMappingURL=index.mjs.map