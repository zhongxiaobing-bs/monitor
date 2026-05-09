"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/app.ts
var import_fastify = __toESM(require("fastify"));

// src/formatters/blank-screen-log.ts
function formatBlankScreenLog(event) {
  var _a, _b, _c, _d, _e;
  return {
    eventType: event.eventType,
    appId: event.appId,
    appName: event.appName,
    env: event.env,
    release: event.release,
    pathname: event.pathname,
    score: (_a = event.blankScreen) == null ? void 0 : _a.score,
    trigger: (_b = event.blankScreen) == null ? void 0 : _b.trigger,
    rootSelector: (_c = event.blankScreen) == null ? void 0 : _c.rootSelector,
    readyState: (_d = event.blankScreen) == null ? void 0 : _d.readyState,
    domSummary: (_e = event.blankScreen) == null ? void 0 : _e.domSummary
  };
}

// src/formatters/wecom-message.ts
function formatTime(timestamp) {
  if (!timestamp) return "unknown";
  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false
  });
}
function formatExceptionMarkdown(event) {
  var _a, _b, _c;
  const appName = event.appName || event.appId || "unknown-app";
  const env = event.env || "unknown";
  const page = event.pathname || event.url || "unknown";
  const release = event.release || "unknown";
  const userId = event.userId || "anonymous";
  const errorName = ((_a = event.error) == null ? void 0 : _a.name) || "Error";
  const errorMessage = ((_b = event.error) == null ? void 0 : _b.message) || "Unknown error";
  const source = ((_c = event.error) == null ? void 0 : _c.source) || "unknown";
  const time = formatTime(event.timestamp);
  return [
    "## \u524D\u7AEF\u76D1\u63A7\u544A\u8B66",
    "",
    `> \u5E94\u7528\uFF1A${appName}`,
    `> \u73AF\u5883\uFF1A${env}`,
    `> \u7C7B\u578B\uFF1Aexception`,
    `> \u65F6\u95F4\uFF1A${time}`,
    "",
    `> \u9519\u8BEF\uFF1A${errorName}: ${errorMessage}`,
    `> \u6765\u6E90\uFF1A${source}`,
    `> \u9875\u9762\uFF1A${page}`,
    `> \u7248\u672C\uFF1A${release}`,
    `> \u7528\u6237\uFF1A${userId}`
  ].join("\n");
}

// src/schemas/collect-schema.ts
var import_zod = require("zod");
var baseEventSchema = import_zod.z.object({
  eventId: import_zod.z.string().optional(),
  eventType: import_zod.z.string(),
  appId: import_zod.z.string().optional(),
  appName: import_zod.z.string().optional(),
  env: import_zod.z.string().optional(),
  release: import_zod.z.string().optional(),
  url: import_zod.z.string().optional(),
  pathname: import_zod.z.string().optional(),
  title: import_zod.z.string().optional(),
  timestamp: import_zod.z.number().optional(),
  userAgent: import_zod.z.string().optional(),
  userId: import_zod.z.string().optional()
});
var exceptionEventSchema = baseEventSchema.extend({
  eventType: import_zod.z.literal("exception"),
  error: import_zod.z.object({
    name: import_zod.z.string().optional(),
    message: import_zod.z.string(),
    stack: import_zod.z.string().optional(),
    source: import_zod.z.string().optional()
  })
});
var blankScreenEventSchema = baseEventSchema.extend({
  eventType: import_zod.z.literal("blank_screen"),
  blankScreen: import_zod.z.object({
    score: import_zod.z.number(),
    rootSelector: import_zod.z.string().optional(),
    domSummary: import_zod.z.array(import_zod.z.string()).optional(),
    readyState: import_zod.z.string().optional(),
    trigger: import_zod.z.enum(["initial", "route_change", "manual"]).optional()
  })
});
var httpErrorEventSchema = baseEventSchema.extend({
  eventType: import_zod.z.literal("http_error"),
  request: import_zod.z.object({
    url: import_zod.z.string(),
    method: import_zod.z.string(),
    status: import_zod.z.number().optional(),
    duration: import_zod.z.number().optional(),
    success: import_zod.z.boolean(),
    source: import_zod.z.enum(["fetch", "xhr"]).optional()
  }),
  response: import_zod.z.object({
    code: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional(),
    message: import_zod.z.string().optional()
  }).optional()
});
var collectRequestSchema = import_zod.z.object({
  events: import_zod.z.array(import_zod.z.unknown())
});
function parseMonitorEvent(event) {
  const baseParsed = baseEventSchema.safeParse(event);
  if (!baseParsed.success) {
    return baseParsed;
  }
  const { eventType } = baseParsed.data;
  if (eventType === "exception") {
    return exceptionEventSchema.safeParse(event);
  }
  if (eventType === "blank_screen") {
    return blankScreenEventSchema.safeParse(event);
  }
  if (eventType === "http_error") {
    return httpErrorEventSchema.safeParse(event);
  }
  return baseEventSchema.safeParse(event);
}

// src/services/dedupe-service.ts
var DEFAULT_WINDOW_MS = 5 * 60 * 1e3;
var DedupeService = class {
  constructor(windowMs = DEFAULT_WINDOW_MS) {
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "windowMs");
    this.windowMs = windowMs;
  }
  shouldNotify(key) {
    const now = Date.now();
    const lastSentAt = this.cache.get(key);
    if (!lastSentAt) {
      this.cache.set(key, now);
      return true;
    }
    if (now - lastSentAt > this.windowMs) {
      this.cache.set(key, now);
      return true;
    }
    return false;
  }
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > this.windowMs) {
        this.cache.delete(key);
      }
    }
  }
};

// src/services/wecom-service.ts
async function sendWecomMarkdown(markdown) {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("WECOM_WEBHOOK_URL is not configured");
  }
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: {
        content: markdown
      }
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send wecom message: ${response.status} ${text}`);
  }
  const result = await response.json();
  if (result.errcode && result.errcode !== 0) {
    throw new Error(
      `Wecom webhook returned error: ${result.errcode} ${result.errmsg || ""}`
    );
  }
}

// src/utils/fingerprint.ts
function normalizeText(value) {
  return (value || "").trim().toLowerCase();
}
function createEventFingerprint(event) {
  var _a, _b;
  if (event.eventType === "exception") {
    const exceptionEvent = event;
    return [
      normalizeText(event.appId),
      normalizeText(event.env),
      normalizeText(event.eventType),
      normalizeText((_a = exceptionEvent.error) == null ? void 0 : _a.name),
      normalizeText((_b = exceptionEvent.error) == null ? void 0 : _b.message),
      normalizeText(event.pathname || event.url)
    ].join("|");
  }
  return [
    normalizeText(event.appId),
    normalizeText(event.env),
    normalizeText(event.eventType),
    normalizeText(event.pathname || event.url)
  ].join("|");
}

// src/utils/format-zod-error.ts
function formatZodError(error, prefix) {
  return error.issues.map((issue) => ({
    path: [prefix, ...issue.path].filter((value) => value !== void 0).join("."),
    message: issue.message
  }));
}

// src/app.ts
var app = (0, import_fastify.default)({
  logger: true
});
var dedupeService = new DedupeService();
app.get("/health", async () => {
  return { ok: true };
});
app.get("/api/mock-500", async (_, reply) => {
  reply.code(500).send({
    success: false,
    message: "mock internal server error"
  });
});
app.post("/api/collect", async (request, reply) => {
  const topLevelParsed = collectRequestSchema.safeParse(request.body);
  if (!topLevelParsed.success) {
    const details = formatZodError(topLevelParsed.error);
    app.log.warn(
      {
        details,
        body: request.body
      },
      "invalid monitor collect payload"
    );
    reply.code(400).send({
      success: false,
      code: "INVALID_PAYLOAD",
      details
    });
    return;
  }
  const validatedEvents = [];
  const validationErrors = [];
  for (const [index, event] of topLevelParsed.data.events.entries()) {
    const parsedEvent = parseMonitorEvent(event);
    if (!parsedEvent.success) {
      validationErrors.push(
        ...formatZodError(parsedEvent.error, `events.${index}`)
      );
      continue;
    }
    validatedEvents.push(parsedEvent.data);
  }
  if (validationErrors.length > 0) {
    app.log.warn(
      {
        details: validationErrors,
        body: request.body
      },
      "invalid monitor event payload"
    );
    reply.code(400).send({
      success: false,
      code: "INVALID_EVENT",
      details: validationErrors
    });
    return;
  }
  dedupeService.cleanup();
  app.log.info(
    {
      count: validatedEvents.length
    },
    "received monitor events"
  );
  const exceptionEvents = validatedEvents.filter(
    (event) => event.eventType === "exception"
  );
  const blankScreenEvents = validatedEvents.filter(
    (event) => event.eventType === "blank_screen"
  );
  for (const event of blankScreenEvents) {
    app.log.info(
      {
        blankScreen: formatBlankScreenLog(event)
      },
      "received blank screen event"
    );
  }
  let notifiedCount = 0;
  let skippedNonProdCount = 0;
  let skippedDedupeCount = 0;
  for (const event of exceptionEvents) {
    if (event.env !== "prod") {
      skippedNonProdCount += 1;
      continue;
    }
    const fingerprint = createEventFingerprint(event);
    const shouldNotify = dedupeService.shouldNotify(fingerprint);
    if (!shouldNotify) {
      skippedDedupeCount += 1;
      continue;
    }
    try {
      const markdown = formatExceptionMarkdown(event);
      await sendWecomMarkdown(markdown);
      notifiedCount += 1;
    } catch (error) {
      app.log.error(
        {
          error,
          event
        },
        "failed to send wecom notification"
      );
    }
  }
  reply.send({
    success: true,
    received: validatedEvents.length,
    exceptionCount: exceptionEvents.length,
    blankScreenCount: blankScreenEvents.length,
    notified: notifiedCount,
    skippedNonProd: skippedNonProdCount,
    skippedDedupe: skippedDedupeCount
  });
});
var start = async () => {
  try {
    await app.listen({
      port: 3e3,
      host: "0.0.0.0"
    });
    app.log.info("collector server started at http://localhost:3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};
void start();
//# sourceMappingURL=app.js.map