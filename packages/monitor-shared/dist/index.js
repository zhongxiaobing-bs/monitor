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
  createEventId: () => createEventId,
  getLocationInfo: () => getLocationInfo,
  normalizeError: () => normalizeError
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEventId,
  getLocationInfo,
  normalizeError
});
//# sourceMappingURL=index.js.map