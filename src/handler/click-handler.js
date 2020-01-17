import isInside from 'src/utils/point-in-polygon'

export function isInArea (point, areas) {
  let i = -1
  while (++i < areas.length) {
    const region = areas[i]
    const polygon = region.area
    const isDrop = isInside(point, polygon)
    if (isDrop) {
      return {
        isDrop,
        ...region
      }
    }
  }
  return {
    isDrop: false
  }
}
