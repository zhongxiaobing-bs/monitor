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
  EventQueue: () => EventQueue,
  sendEvents: () => sendEvents
});
module.exports = __toCommonJS(index_exports);

// src/queue.ts
var EventQueue = class {
  constructor() {
    __publicField(this, "events", []);
  }
  add(event) {
    this.events.push(event);
  }
  drain() {
    const current = [...this.events];
    this.events = [];
    return current;
  }
  size() {
    return this.events.length;
  }
};

// src/sender.ts
async function sendEvents(dsn, events) {
  if (!events.length) return;
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify({ events })], {
      type: "application/json"
    });
    navigator.sendBeacon(dsn, blob);
    return;
  }
  await fetch(dsn, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ events }),
    keepalive: true
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EventQueue,
  sendEvents
});
//# sourceMappingURL=index.js.map