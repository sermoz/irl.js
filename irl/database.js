/**
 * import { v } from 'irl'
 *
 * const D = new Database()
 *
 * irl.assert(D.person("Vova").isParentOf("Serhii"))
 *
 * irl.assert([
 *   D.person("Serhii").isParentOf("Polina"),
 *   D.person("Katya").isParentOf("Polina"),
 *   D.person("Yura").isParentOf("Katya"),
 *   D.person("Vova").isParentOf("Serhii")
 * ])
 *
 * // Inference:
 * irl.assert(
 *   D.person(v`Child`).isChildOf(v`Parent`),
 *   irl.all(
 *     D.person(v`Parent`).isParentOf(v`Child`)
 *   )
 * )
 *
 */

import { proxyTarget } from './util/index.js'
import * as mSlice from './slice.js'
import { Predicate } from './predicate.js'

export function Database () {
  this.predicates = Object.create(null)

  return new Proxy(this, databaseProxyHandler)
}

Database.prototype.prev = null   // Needed for slice link traversals

const databaseProxyHandler = {
  get (database, prop, receiver) {
    return mSlice.makeOpenLink({ dim: prop, prev: database })
  }
}

export function assert (sliceLinkProxy) {
  // NOTE: no vars so far
  const { database: db, args } = mSlice.reassemble(sliceLinkProxy)
  const dimensions = Object.keys(args)
  const signature = dimensions.join('-')

  let pred = db.predicates[signature]

  if (pred === undefined) {
    pred = db.predicates[signature] = new Predicate(dimensions)
  }

  pred.addClause(args)
}

export function dumbDB (dbProxy) {
  const db = proxyTarget(dbProxy, databaseProxyHandler)

  console.dir(db.predicates, { depth: 4 })
}
