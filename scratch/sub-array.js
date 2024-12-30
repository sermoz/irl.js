function makeArray () {
  return Reflect.construct(Array, [], fuck)
}

fuck = function fuck () { }

fuck.prototype = {
  __proto__: Array.prototype,
  last () {
    return this[this.length - 1]
  }
}

ar = makeArray()
