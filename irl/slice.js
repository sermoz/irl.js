/**
 * Slice is roughly the same as "projection" but used in a different context.
 *
 * A slice is a data structure that refers to a particular predicate with the dimensions
 * bound either to specific fixed values or variables. A slice is simply "take this
 * predicate at these values", where "values" are partially or fully fixed.
 *
 * Projection is the same, but projections have identities: the same values for dimensions
 * should give the same projection object. Also, a projection is a container for data,
 * whereas slices are not associated with any data.
 *
 */
import { dumbFunc, proxyTarget } from './util/index.js'

export function makeOpenLink (props/* {dim, prev} */) {
  return new Proxy(dumbFunc(props), openLinkProxyHandler)
}

const closedLinkProxyHandler = {
  get (closedLink, prop, receiver) {
    return makeOpenLink({ dim: prop, prev: closedLink })
  }
}

const openLinkProxyHandler = {
  apply (openLink, thisArg, args) {
    if (args.length !== 1) {
      throw new Error('Expected just 1 argument')
    }

    return new Proxy(
      {
        dim: openLink.dim,
        val: args[0],
        prev: openLink.prev,
      },
      closedLinkProxyHandler
    )
  }
}

export function reassemble (closedLinkProxy) {
  const closedLink = proxyTarget(closedLinkProxy, closedLinkProxyHandler)

  const args = {}
  let database

  (function rec (link) {
    if (link.prev === null) {
      database = link
      return
    }

    rec(link.prev)
    args[link.dim] = link.val
  })(closedLink)

  return {
    database,
    args
  }
}
