/**
 *  This is based on Immutable.js hash implementation
 *  (see here: https://github.com/immutable-js/immutable-js/blob/main/src/Hash.js)
 */

export function hashCode (obj) {
  if (obj == null) {
    return obj === null ? 0x42108422 : 0x42108423
  }

  switch (typeof obj) {
    case 'boolean':
      return obj ? 0x42108421 : 0x42108420

    case 'number':
      return hashNumber(obj)

    case 'string':
      return hashString(obj)

    case 'symbol':
      return hashSymbol(obj)

    case 'function':
    case 'object':
      return hashOpaqueObject(obj)

    default:
      console.error(`Could not compute hash for an object of type '${typeof obj}'`)
      return 0
  }
}

/** Compress arbitrarily large numbers into smi hashes. */
function hashNumber (n) {
  if (!isFinite(n)) {
    return 0
  }

  let hash = n | 0

  if (hash !== n) {
    hash ^= n * 0xffffffff
  }

  while (n > 0xffffffff) {
    n /= 0xffffffff
    hash ^= n
  }

  return smi(hash)
}

function hashString (string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  let code = 0

  for (let i = 0, len = string.length; i < len; i += 1) {
    code = Math.imul(31, code) + string.charCodeAt(i) | 0
  }

  return smi(code)
}

// TODO: implement caching
function hashSymbol (sym) {
  let code = 0x3418d9  // prime, taken for no particular reason, let's see

  for (let i = 0, len = sym.description.length; i < len; i += 1) {
    code = Math.imul(31, code) + sym.description.charCodeAt(i) | 0
  }

  return smi(code)
}

/**
 * v8 has an optimization for storing 31-bit signed numbers.
 * Values which have either 00 or 11 as the high order bits qualify.
 *
 * This function just copies the sign bit into the next bit (i.e. b31 -> b30).
 */
function smi (i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff)
}

let nextHash = 1

const objectHash = new WeakMap()

function hashOpaqueObject (obj) {
  let hash = objectHash.get(obj)

  if (hash === undefined) {
    objectHash.set(obj, hash = nextHash++)
  }

  return hash
}

/**
 * Combine hashes of some nested components, the order is important.
 */
function orderedHash (hashes) {
  let code = 1

  for (const hash of hashes) {
    code = (Math.imul(31, code) + hash) | 0
  }

  return smi(code)
}

const propHash = Symbol('hash')

export function datumHasHash (datum) {
  return datum[propHash] !== undefined
}

/**
 * Remember: datum hash code is ever used within one shape (predicate).
 * So it doesn't take the shape (dimension names) into account.
 */
function datumComputedHash (datum) {
  return orderedHash(Object.values(datum).map(hashCode))
}

export function datumHash (datum) {
  return datum[propHash] ?? datumComputedHash(datum)
}

export function datumWithHash (datum, hash) {
  if (datum[propHash] !== undefined) {
    return datum
  }

  const copy = { ...datum }

  Object.defineProperty(copy, propHash, {
    configurable: true,
    enumerable: false,
    writable: false,
    value: hash ?? datumComputedHash(datum),
  })

  return copy
}
