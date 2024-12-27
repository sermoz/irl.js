import { methodFor, check, arraysEqual } from './util/index.js'

export function Predicate (dimensions) {
  this.dimensions = dimensions
  this.clauses = []
}

// We only support facts for now, with no free vars.
methodFor(Predicate, function addClause (headArgs) {
  dbg: check(arraysEqual(Object.keys(headArgs), this.dimensions))

  this.clauses.push(headArgs)
})
