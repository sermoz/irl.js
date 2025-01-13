import { hashSeq } from './hash.js'

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

export const datumShape = Object.keys

/**
 * Section and datum should belong to the same predicate.
 */
export function sectionMatchesDatum (section, datum) {
  for (const dim in section) {
    const val = section[dim]
    if (val !== unbound && val !== datum[dim]) {
      return false
    }
  }

  return true
}

const propHash = Symbol('hash')

export function isObjectDatum (obj) {
  return Object.hasOwn(obj, propHash)
}

export function datumHash (datum) {
  const hash = datum[propHash]

  if (hash === undefined) {
    throw new Error('Datum has no hash')
  }

  return hash
}

export function asDatum (obj) {
  return isObjectDatum(obj) ? obj : freeze({ ...obj })
}

export function ensureDatum (obj) {
  return isObjectDatum(obj) ? obj : freeze(obj)
}

function freeze (datum) {
  Object.defineProperty(datum, propHash, {
    configurable: true,
    enumerable: false,
    writable: false,
    // Datum hash code is ever used within the same shape (i.e. same predicate).
    // So it doesn't take the shape (dimension names) into account.
    value: hashSeq(Object.values(datum)),
  })

  Object.freeze(datum)

  return datum
}
