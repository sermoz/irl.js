export function proxyTarget (proxy, handler) {
  const get = handler.get
  handler.get = getTarget
  const target = proxy.a
  handler.get = get

  return target
}

function getTarget (target, prop, receiver) {
  return target
}
