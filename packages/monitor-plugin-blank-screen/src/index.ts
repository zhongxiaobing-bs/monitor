import type { MonitorPlugin } from '@company/monitor-types'
import { createBlankScreenDedupe } from './dedupe'
import { runBlankScreenCheck } from './detect'
import { createBlankScreenEvent } from './normalize'
import { registerRouteChangeListener } from './route-change'
import type { BlankScreenPluginOptions } from './types'

export function blankScreenPlugin(
  options: BlankScreenPluginOptions = {}
): MonitorPlugin {
  const {
    delayMs = 3000,
    detectOnRouteChange = true,
    routeChangeDelayMs = 2000,
    dedupeWindowMs = 10000
  } = options

  return {
    name: 'blank-screen-plugin',
    setup({ api }) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return
      }

      const dedupe = createBlankScreenDedupe(dedupeWindowMs)

      const emitIfNeeded = (trigger: 'initial' | 'route_change' | 'manual') => {
        dedupe.cleanup()

        const result = runBlankScreenCheck(options)
        if (!result) {
          return
        }

        const pathname = window.location.pathname
        const shouldReport = dedupe.shouldReport({
          pathname,
          trigger,
          score: result.score
        })

        if (!shouldReport) {
          return
        }

        api.emit(
          createBlankScreenEvent({
            score: result.score,
            rootSelector: result.rootSelector,
            domSummary: result.domSummary,
            trigger
          })
        )
      }

      const initialTimer = window.setTimeout(() => {
        emitIfNeeded('initial')
      }, delayMs)

      let routeTimer: number | null = null

      const disposeRouteChange = detectOnRouteChange
        ? registerRouteChangeListener(() => {
            if (routeTimer !== null) {
              window.clearTimeout(routeTimer)
            }

            routeTimer = window.setTimeout(() => {
              emitIfNeeded('route_change')
            }, routeChangeDelayMs)
          })
        : () => {}

      return () => {
        window.clearTimeout(initialTimer)

        if (routeTimer !== null) {
          window.clearTimeout(routeTimer)
        }

        disposeRouteChange()
      }
    }
  }
}

export type { BlankScreenPluginOptions } from './types'
