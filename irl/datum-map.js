/**
 * DatumMap is a data structure that maps datums to anything. Datums have value semantics
 * as map keys, as opposed to the usual referential semantics, i.e. 2 datums with equal
 * dimensions are equal.
 *
 * The keys may also be sections where unbound dimensions have the special value.
 *
 * In one DatumMap you can only store datums of the same predicate (i.e. with same
 * dimensions).
 */
import { methodFor } from './util/index.js'
import { datumHash, datumWithHash } from './hash.js'
import { datumsEqual } from './datum.js'

export function DatumMap () {
  this.entries = new Map()
  // this.dims = dims
}

function entryFor (self, datum, hash) {
  let entry = self.entries.get(hash) ?? null

  while (entry !== null && !datumsEqual(entry.key, datum)) {
    entry = entry.next
  }

  return entry
}

// methodFor(DatumMap, function has (key) {
//   const hash = hashOf(key)
//   const entry = entryFor(this, key, hash)

//   return entry !== null
// })

methodFor(DatumMap, function intern (datum, produceValue) {
  const hash = datumHash(datum)
  let entry = entryFor(this, datum, hash)

  if (entry === null) {
    datum = datumWithHash(datum, hash)
    entry = {
      key: datum,
      val: produceValue(datum),
      next: this.entries.get(hash) ?? null
    }
    this.entries.set(hash, entry)
  }

  return entry.val
})

methodFor(DatumMap, function * values () {
  for (let entry of this.entries.values()) {
    while (entry !== null) {
      yield entry.val
      entry = entry.next
    }
  }
})
