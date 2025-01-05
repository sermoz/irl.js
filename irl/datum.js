/**
 * Special value that designates unbound dimension in a section.
 */
export const unbound = Symbol('_')

/**
 * Compare two datums of the same shape.
 *
 * NOTE: this func doesn't check whether the datums are actually of the same shape.
 */
export function datumsEqual (dA, dB) {
  if (dA === dB) {
    return true
  }

  for (const dim in dA) {
    if (dA[dim] !== dB[dim]) {
      return false
    }
  }

  return true
}

export function datumHasShape (datum, shape) {
  let i = 0

  for (const dim in datum) {
    if (i === shape.length || dim !== shape[i]) {
      return false
    }

    i += 1
  }

  return i === shape.length
}
