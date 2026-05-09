const DEFAULT_SAMPLE_POINTS: Array<[number, number]> = [
  [0.5, 0.5],
  [0.2, 0.2],
  [0.5, 0.2],
  [0.8, 0.2],
  [0.2, 0.5],
  [0.8, 0.5],
  [0.2, 0.8],
  [0.5, 0.8],
  [0.8, 0.8]
]

export function getSamplePoints(samplePoints?: Array<[number, number]>) {
  return samplePoints?.length ? samplePoints : DEFAULT_SAMPLE_POINTS
}

export function sampleElements(points: Array<[number, number]>) {
  const width = window.innerWidth
  const height = window.innerHeight

  return points.map(([xRatio, yRatio]) => {
    const x = Math.floor(width * xRatio)
    const y = Math.floor(height * yRatio)
    const element = document.elementFromPoint(x, y)

    return {
      x,
      y,
      element
    }
  })
}
