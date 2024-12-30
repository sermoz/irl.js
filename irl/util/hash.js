// This is based on Immutable.js hash implementation
// (see here: https://github.com/immutable-js/immutable-js/blob/main/src/Hash.js)

export function hash (obj) {
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

    case 'function':
      return hashOpaqueObject(obj)

    case 'object':
      if (typeof obj[propHash] === 'number') {
        return obj[propHash]
      }
      else if (typeof obj[propHash] === 'function') {
        return (obj[propHash] = smallInt(obj[propHash]()))
      }
      else {
        return hashOpaqueObject(obj)
      }

    default:
      console.error(`Could not compute hash for an object of type ${typeof obj}`)
      return 0
  }
}

const propHash = Symbol('hash')


/** Compress arbitrarily large numbers into smallInt hashes. */
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

  return smallInt(hash)
}

function hashString (string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  let hashed = 0

  for (let i = 0; i < string.length; i += 1) {
    hashed = Math.imul(31, hashed) + string.charCodeAt(i) | 0
  }

  return smallInt(hashed)
}

/**
 * v8 has an optimization for storing 31-bit signed numbers.
 * Values which have either 00 or 11 as the high order bits qualify.
 *
 * This function just copies the sign bit into the next bit (#30).
 */
function smallInt (i32) {
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

export function equal (left, right) {
  if (left === right) {
    return true
  }

  if (left != null && typeof left[propEquals] === 'function') {
    return left[propEquals](right)
  }

  return false
}

const propEquals = Symbol('equals')
