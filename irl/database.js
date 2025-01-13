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
import { makeOpenLink, invertClosedLink } from './db-link.js'
import { Predicate } from './predicate.js'
import { asDatum, datumShape, ensureDatum } from './datum.js'

export function Database () {
  this.predicates = Object.create(null)

  return new Proxy(this, databaseProxyHandler)
}

Database.prototype.prev = null   // Needed for link traversals

const databaseProxyHandler = {
  get (database, prop, receiver) {
    return makeOpenLink({ dim: prop, prev: database })
  }
}

/**
 * 1) assert(DB.dim1(val1).dim2(val2)...)
 * 2) assert(DB, {dim1: val1, dim2: val2, ...})
 */
export function assert () {
  const { db, datum } = getDbAndDatum(arguments)
  const pred = internPredicate(db, datumShape(datum))

  pred.addClause(datum)
}

/**
 * 1) retract(DB.dim1(val1).dim2(val2)...)
 * 2) retract(DB, {dim1: val1, dim2: val2, ...})
 */
export function retract () {
  const { db, datum } = getDbAndDatum(arguments)
  const pred = internPredicate(db, datumShape(datum))

  pred.removeClause(datum)
}

function getDbAndDatum (args) {
  let db, datum

  if (args.length === 1) {
    const [linkProxy] = args
    // NOTE: no vars so far
    ;({ database: db, datum } = invertClosedLink(linkProxy))
  }
  else if (args.length === 2) {
    let dbProxy

    [dbProxy, datum] = args
    db = proxyTarget(dbProxy, databaseProxyHandler)
  }
  else {
    throw new Error('assert() misuse')
  }

  ensureDatum(datum)

  return { db, datum }
}

function internPredicate (db, shape) {
  const signature = shape.join('-')
  let pred = db.predicates[signature]

  if (pred === undefined) {
    pred = db.predicates[signature] = new Predicate(db, shape)
  }

  return pred
}

export function dumpDB (dbProxy) {
  const db = proxyTarget(dbProxy, databaseProxyHandler)

  console.dir(db.predicates, { depth: 4 })
}

export function monitor (dbProxy, section, observer) {
  section = asDatum(section)

  const db = proxyTarget(dbProxy, databaseProxyHandler)
  const pred = internPredicate(db, datumShape(section))
  const proj = pred.internProjection(section)

  proj.resetObserver(observer)
}

export function unmonitor (dbProxy, section) {
  section = asDatum(section)

  const db = proxyTarget(dbProxy, databaseProxyHandler)
  const pred = internPredicate(db, datumShape(section))

  pred.uninternProjection(section)
}
