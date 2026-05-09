export function registerRouteChangeListener(onRouteChange: () => void) {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  const handleRouteChange = () => {
    onRouteChange()
  }

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    handleRouteChange()
    return result
  }

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    handleRouteChange()
    return result
  }

  window.addEventListener('popstate', handleRouteChange)
  window.addEventListener('hashchange', handleRouteChange)

  return () => {
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
    window.removeEventListener('popstate', handleRouteChange)
    window.removeEventListener('hashchange', handleRouteChange)
  }
}
