function matchesIgnoreSelectors(
  element: Element,
  ignoreSelectors: string[]
) {
  return ignoreSelectors.some((selector) => {
    try {
      return element.matches(selector) || !!element.closest(selector)
    } catch {
      return false
    }
  })
}

function isContainerElement(element: Element, rootElement: Element) {
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'html' || tagName === 'body') {
    return true
  }

  if (element === rootElement) {
    return true
  }

  return false
}

function getElementSummary(element: Element | null) {
  if (!element) return 'null'

  const tagName = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const className =
    typeof element.className === 'string' && element.className.trim()
      ? `.${element.className.trim().split(/\s+/).join('.')}`
      : ''

  return `${tagName}${id}${className}`
}

export function calculateBlankScore(
  sampledElements: Array<{ element: Element | null }>,
  rootElement: Element,
  ignoreSelectors: string[]
) {
  let blankCount = 0

  const domSummary = sampledElements.map(({ element }) => {
    if (!element) {
      blankCount += 1
      return 'null'
    }

    if (matchesIgnoreSelectors(element, ignoreSelectors)) {
      blankCount += 1
      return `${getElementSummary(element)}(ignored)`
    }

    if (isContainerElement(element, rootElement)) {
      blankCount += 1
      return `${getElementSummary(element)}(container)`
    }

    return getElementSummary(element)
  })

  return {
    score: sampledElements.length ? blankCount / sampledElements.length : 0,
    domSummary
  }
}
