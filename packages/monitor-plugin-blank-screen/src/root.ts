export function getRootElement(rootSelector?: string) {
  if (rootSelector) {
    const customRoot = document.querySelector(rootSelector)
    if (customRoot) {
      return customRoot
    }
  }

  const appRoot = document.querySelector('#app')
  if (appRoot) {
    return appRoot
  }

  const reactRoot = document.querySelector('#root')
  if (reactRoot) {
    return reactRoot
  }

  return document.body
}
