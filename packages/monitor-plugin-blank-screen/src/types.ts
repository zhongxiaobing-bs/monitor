export interface BlankScreenPluginOptions {
  rootSelector?: string
  delayMs?: number
  scoreThreshold?: number
  samplePoints?: Array<[number, number]>
  ignoreSelectors?: string[]
  detectOnRouteChange?: boolean
  routeChangeDelayMs?: number
  dedupeWindowMs?: number
}
