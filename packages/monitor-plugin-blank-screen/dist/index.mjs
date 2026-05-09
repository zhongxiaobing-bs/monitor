// src/dedupe.ts
function normalizeScore(score) {
  return score.toFixed(1);
}
function createDedupeKey(input) {
  return [input.pathname, input.trigger, normalizeScore(input.score)].join("|");
}
function createBlankScreenDedupe(windowMs) {
  const cache = /* @__PURE__ */ new Map();
  function shouldReport(input) {
    const now = Date.now();
    const key = createDedupeKey(input);
    const lastReportedAt = cache.get(key);
    if (!lastReportedAt || now - lastReportedAt > windowMs) {
      cache.set(key, now);
      return true;
    }
    return false;
  }
  function cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of cache.entries()) {
      if (now - timestamp > windowMs) {
        cache.delete(key);
      }
    }
  }
  return {
    shouldReport,
    cleanup
  };
}

// src/root.ts
function getRootElement(rootSelector) {
  if (rootSelector) {
    const customRoot = document.querySelector(rootSelector);
    if (customRoot) {
      return customRoot;
    }
  }
  const appRoot = document.querySelector("#app");
  if (appRoot) {
    return appRoot;
  }
  const reactRoot = document.querySelector("#root");
  if (reactRoot) {
    return reactRoot;
  }
  return document.body;
}

// src/sampler.ts
var DEFAULT_SAMPLE_POINTS = [
  [0.5, 0.5],
  [0.2, 0.2],
  [0.5, 0.2],
  [0.8, 0.2],
  [0.2, 0.5],
  [0.8, 0.5],
  [0.2, 0.8],
  [0.5, 0.8],
  [0.8, 0.8]
];
function getSamplePoints(samplePoints) {
  return (samplePoints == null ? void 0 : samplePoints.length) ? samplePoints : DEFAULT_SAMPLE_POINTS;
}
function sampleElements(points) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return points.map(([xRatio, yRatio]) => {
    const x = Math.floor(width * xRatio);
    const y = Math.floor(height * yRatio);
    const element = document.elementFromPoint(x, y);
    return {
      x,
      y,
      element
    };
  });
}

// src/score.ts
function matchesIgnoreSelectors(element, ignoreSelectors) {
  return ignoreSelectors.some((selector) => {
    try {
      return element.matches(selector) || !!element.closest(selector);
    } catch {
      return false;
    }
  });
}
function isContainerElement(element, rootElement) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "html" || tagName === "body") {
    return true;
  }
  if (element === rootElement) {
    return true;
  }
  return false;
}
function getElementSummary(element) {
  if (!element) return "null";
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const className = typeof element.className === "string" && element.className.trim() ? `.${element.className.trim().split(/\s+/).join(".")}` : "";
  return `${tagName}${id}${className}`;
}
function calculateBlankScore(sampledElements, rootElement, ignoreSelectors) {
  let blankCount = 0;
  const domSummary = sampledElements.map(({ element }) => {
    if (!element) {
      blankCount += 1;
      return "null";
    }
    if (matchesIgnoreSelectors(element, ignoreSelectors)) {
      blankCount += 1;
      return `${getElementSummary(element)}(ignored)`;
    }
    if (isContainerElement(element, rootElement)) {
      blankCount += 1;
      return `${getElementSummary(element)}(container)`;
    }
    return getElementSummary(element);
  });
  return {
    score: sampledElements.length ? blankCount / sampledElements.length : 0,
    domSummary
  };
}

// src/detect.ts
function runBlankScreenCheck(options) {
  const {
    rootSelector,
    scoreThreshold = 0.8,
    samplePoints,
    ignoreSelectors = []
  } = options;
  const rootElement = getRootElement(rootSelector);
  const points = getSamplePoints(samplePoints);
  const sampledElements = sampleElements(points);
  const { score, domSummary } = calculateBlankScore(
    sampledElements,
    rootElement,
    ignoreSelectors
  );
  if (score < scoreThreshold) {
    return null;
  }
  return {
    score,
    rootSelector,
    domSummary
  };
}

// src/normalize.ts
function createBlankScreenEvent({
  score,
  rootSelector,
  domSummary,
  trigger
}) {
  return {
    eventId: "",
    eventType: "blank_screen",
    appId: "",
    env: "",
    url: "",
    pathname: "",
    title: "",
    timestamp: 0,
    userAgent: "",
    blankScreen: {
      score,
      rootSelector,
      domSummary,
      readyState: document.readyState,
      trigger
    }
  };
}

// src/route-change.ts
function registerRouteChangeListener(onRouteChange) {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  const handleRouteChange = () => {
    onRouteChange();
  };
  history.pushState = function(...args) {
    const result = originalPushState.apply(this, args);
    handleRouteChange();
    return result;
  };
  history.replaceState = function(...args) {
    const result = originalReplaceState.apply(this, args);
    handleRouteChange();
    return result;
  };
  window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("hashchange", handleRouteChange);
  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", handleRouteChange);
    window.removeEventListener("hashchange", handleRouteChange);
  };
}

// src/index.ts
function blankScreenPlugin(options = {}) {
  const {
    delayMs = 3e3,
    detectOnRouteChange = true,
    routeChangeDelayMs = 2e3,
    dedupeWindowMs = 1e4
  } = options;
  return {
    name: "blank-screen-plugin",
    setup({ api }) {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      const dedupe = createBlankScreenDedupe(dedupeWindowMs);
      const emitIfNeeded = (trigger) => {
        dedupe.cleanup();
        const result = runBlankScreenCheck(options);
        if (!result) {
          return;
        }
        const pathname = window.location.pathname;
        const shouldReport = dedupe.shouldReport({
          pathname,
          trigger,
          score: result.score
        });
        if (!shouldReport) {
          return;
        }
        api.emit(
          createBlankScreenEvent({
            score: result.score,
            rootSelector: result.rootSelector,
            domSummary: result.domSummary,
            trigger
          })
        );
      };
      const initialTimer = window.setTimeout(() => {
        emitIfNeeded("initial");
      }, delayMs);
      let routeTimer = null;
      const disposeRouteChange = detectOnRouteChange ? registerRouteChangeListener(() => {
        if (routeTimer !== null) {
          window.clearTimeout(routeTimer);
        }
        routeTimer = window.setTimeout(() => {
          emitIfNeeded("route_change");
        }, routeChangeDelayMs);
      }) : () => {
      };
      return () => {
        window.clearTimeout(initialTimer);
        if (routeTimer !== null) {
          window.clearTimeout(routeTimer);
        }
        disposeRouteChange();
      };
    }
  };
}
export {
  blankScreenPlugin
};
//# sourceMappingURL=index.mjs.map