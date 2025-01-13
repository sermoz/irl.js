import { methodFor, map } from './util/index.js'
import { datumHash, datumsEqual } from './datum.js'

/**
 * DatumMap is a data structure that maps datums to anything. Datums have value semantics
 * as map keys, as opposed to the usual referential semantics, i.e. 2 datums of the same
 * predicate with equal values for respective dimensions are equal.
 *
 * In one DatumMap you can only store datums of the same predicate (i.e. all datums should
 * have the same shape). This is not checked by the DatumMap itself.
 *
 * DatumMap is just a map that maps hash codes to entry objects:
 *
 * {
 *   key: <datum>,
 *   val: <anything>,
 *   next: null | <entry>
 * }
 *
 * The .next property is needed only in case of hash collisions.
 */
export function DatumMap () {
  this.entries = new Map()
}

function entryFor (self, datum) {
  let entry = self.entries.get(datumHash(datum)) ?? null

  while (entry !== null && !datumsEqual(entry.key, datum)) {
    entry = entry.next
  }

  return entry
}

methodFor(DatumMap, function has (datum) {
  const entry = entryFor(this, datum)

  return entry !== null
})

methodFor(DatumMap, function get (datum) {
  const entry = entryFor(this, datum)

  return entry === null ? undefined : entry.val
})

methodFor(DatumMap, function set (datum, val) {
  let entry = entryFor(this, datum)

  if (entry === null) {
    entry = {
      key: datum,
      val,
      next: this.entries.get(datumHash(datum)) ?? null
    }
    this.entries.set(datumHash(datum), entry)
  }
  else {
    entry.val = val
  }
})

methodFor(DatumMap, function del (datum) {
  let prev = null
  let entry = this.entries.get(datumHash(datum)) ?? null

  while (entry !== null && !datumsEqual(entry.key, datum)) {
    prev = entry
    entry = entry.next
  }

  if (entry === null) {
    return false
  }

  if (prev === null) {
    // The entry was the first one in the collision chain
    if (entry.next === null) {
      this.entries.delete(datumHash(datum))
    }
    else {
      this.entries.set(datumHash(datum), entry.next)
    }
  }
  else {
    prev.next = entry.next
  }

  return true
})

methodFor(DatumMap, function keys () {
  return map(entries(this), e => e.key)
})

methodFor(DatumMap, function values () {
  return map(entries(this), e => e.val)
})

function * entries (self) {
  for (let entry of self.entries.values()) {
    yield entry

    while (entry.next !== null) {
      entry = entry.next
      yield entry
    }
  }
}
