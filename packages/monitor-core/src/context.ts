import type { MonitorInitOptions } from '@company/monitor-types'
import { getLocationInfo } from '@company/monitor-shared'

export function createBaseContext(options: MonitorInitOptions) {
  const locationInfo = getLocationInfo()

  return {
    appId: options.appId,
    appName: options.appName,
    env: options.env,
    release: options.release,
    ...locationInfo
  }
}
