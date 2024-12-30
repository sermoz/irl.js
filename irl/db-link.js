/**
 * A link is what you get by referring to the database object directly:
 * 
 *    const openLink = D.person("Joe").isParentOf
 *    const closedLink = D.person("Joe").isParentOf(v`Jane`)
 *
 * Normally only "closed links" are being manipulated with.
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

export function invertClosedLink (closedLinkProxy) {
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
