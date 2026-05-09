import { getRootElement } from './root'
import { getSamplePoints, sampleElements } from './sampler'
import { calculateBlankScore } from './score'
import type { BlankScreenPluginOptions } from './types'

export interface BlankScreenDetectionResult {
  score: number
  rootSelector?: string
  domSummary: string[]
}

export function runBlankScreenCheck(options: BlankScreenPluginOptions) {
  const {
    rootSelector,
    scoreThreshold = 0.8,
    samplePoints,
    ignoreSelectors = []
  } = options

  const rootElement = getRootElement(rootSelector)
  const points = getSamplePoints(samplePoints)
  const sampledElements = sampleElements(points)
  const { score, domSummary } = calculateBlankScore(
    sampledElements,
    rootElement,
    ignoreSelectors
  )

  if (score < scoreThreshold) {
    return null
  }

  return {
    score,
    rootSelector,
    domSummary
  } satisfies BlankScreenDetectionResult
}
