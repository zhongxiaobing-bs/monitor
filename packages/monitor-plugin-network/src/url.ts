export function resolveUrlObject(url: string) {
  return new URL(url, window.location.origin)
}

export function isMonitorRequest(requestUrl: string, dsn: string) {
  try {
    const request = resolveUrlObject(requestUrl)
    const target = resolveUrlObject(dsn)

    return (
      request.origin === target.origin &&
      request.pathname === target.pathname
    )
  } catch {
    return requestUrl === dsn
  }
}
