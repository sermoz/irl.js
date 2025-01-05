import * as dbg from './util/debug.js'
import { methodFor } from './util/index.js'
import { Projection } from './projection.js'
import { DatumMap } from './datum-map.js'
import { datumHasShape } from './datum.js'

export function Predicate (database, shape) {
  this.database = database
  this.shape = shape
  this.encodedShape = shape.join('-')
  this.clauses = []
  this.projections = new DatumMap()
}

// We only support datums for now, not sections (i.e. no free vars)
methodFor(Predicate, function addClause (datum) {
  dbg.check(datumHasShape(datum, this.shape))

  this.clauses.push(datum)

  for (const proj of this.projections.values()) {
    proj.supplyFact(datum)
  }
})

methodFor(Predicate, function internProjection (section, observer) {
  return this.projections.intern(section, (section) => {
    const proj = new Projection(this, section, observer)

    // Need to connect it to all matching clauses
    for (const clause of this.clauses) {
      proj.supplyFact(clause)
    }

    return proj
  })
})
