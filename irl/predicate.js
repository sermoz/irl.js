import { methodFor, check, arraysEqual } from './util/index.js'

export function Predicate (database, dimensions) {
  this.database = database
  this.dimensions = dimensions
  this.signature = dimensions.join('-')
  this.clauses = []
  // this.projections = new Hashmap()
}

// We only support facts for now (i.e. no free vars)
methodFor(Predicate, function addClause (headArgs) {
  dbg: check(arraysEqual(Object.keys(headArgs), this.dimensions))

  this.clauses.push(headArgs)
})

methodFor(Predicate, function internProjection (args) {

})
