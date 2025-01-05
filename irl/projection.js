import * as dbg from './util/debug.js'
import { methodFor } from './util/index.js'
import { datumHasHash } from './hash.js'
import { unbound } from './datum.js'

export function Projection (predicate, section, observer) {
  dbg.check(datumHasHash(section))

  this.predicate = predicate
  this.section = section
  this.suppliers = new Set()
  // this.observers = new Set()
  this.observer = observer
}

methodFor(Projection, function supplyFact (datum) {
  for (const dim of this.predicate.shape) {
    if (this.section[dim] === unbound) {
      continue
    }

    if (datum[dim] !== this.section[dim]) {
      return  // not applicable
    }
  }

  // Applicable
  this.suppliers.add(datum)

  if (this.observer) {
    this.observer.onAdded(datum)
  }
})
