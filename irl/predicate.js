import * as dbg from './util/debug.js'
import { methodFor } from './util/index.js'
import { Projection } from './projection.js'
import { DatumMap } from './datum-map.js'
import { datumHasShape } from './datum.js'

export function Predicate (database, shape) {
  this.database = database
  this.shape = shape
  this.encodedShape = shape.join('-')
  // TODO: this is temporary, will be different
  this.clauses = new DatumMap()
  this.projections = new DatumMap()
}

// We only support datums for now, not sections (i.e. no free vars)
methodFor(Predicate, function addClause (datum) {
  dbg.check(datumHasShape(datum, this.shape))

  if (this.clauses.has(datum)) {
    // For now, we support only unique facts/clauses. This is temporary of course.
    return
  }

  this.clauses.set(datum, true)

  for (const proj of this.projections.values()) {
    proj.supplyFact(datum)
  }
})

methodFor(Predicate, function removeClause (datum) {
  dbg.check(datumHasShape(datum, this.shape))

  if (!this.clauses.has(datum)) {
    // console.debug("removeClause(): datum not in clauses")
    return
  }

  this.clauses.del(datum)

  for (const proj of this.projections.values()) {
    proj.unsupplyFact(datum)
  }
})

methodFor(Predicate, function internProjection (section) {
  let proj = this.projections.get(section)

  if (proj === undefined) {
    proj = new Projection(this, section)
    this.projections.set(section, proj)
  }

  return proj
})

/**
 * @returns: whether we deleted such a projection, or it didn't exist.
 */
methodFor(Predicate, function uninternProjection (section) {
  return this.projections.del(section)
})
