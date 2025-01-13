import * as dbg from './util/debug.js'
import { methodFor } from './util/index.js'
import { sectionMatchesDatum } from './datum.js'
import { DatumMap } from './datum-map.js'

export function Projection (predicate, section) {
  this.predicate = predicate
  this.section = section
  this.suppliers = new DatumMap()
  this.observer = null

  // Need to connect it to all matching clauses
  for (const datum of predicate.clauses.keys()) {
    this.supplyFact(datum)
  }
}

methodFor(Projection, function resetObserver (observer) {
  this.observer = observer

  for (const datum of this.suppliers.keys()) {
    this.observer.onAdded(datum)
  }
})

methodFor(Projection, function supplyFact (datum) {
  if (!sectionMatchesDatum(this.section, datum)) {
    return
  }

  this.suppliers.set(datum, true)

  if (this.observer) {
    this.observer.onAdded(datum)
  }
})

methodFor(Projection, function unsupplyFact (datum) {
  if (!sectionMatchesDatum(this.section, datum)) {
    return
  }

  this.suppliers.del(datum)

  if (this.observer) {
    this.observer.onRemoved(datum)
  }
})
