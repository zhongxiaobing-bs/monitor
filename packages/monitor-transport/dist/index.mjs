var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
export {
  EventQueue,
  sendEvents
};
//# sourceMappingURL=index.mjs.map