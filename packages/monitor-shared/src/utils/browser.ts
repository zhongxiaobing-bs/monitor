export function getLocationInfo() {
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    title: document.title,
    userAgent: navigator.userAgent
  }
}
