/**
 * Hashmap is a data structure that maps keys to objects, like an ordinary JS Map.
 * 
 * The difference is that the Hashmap supports deep value semantics for the keys.
 * 
 */
import * as mHash from './hash.js'
import { methodFor } from './index.js'

function HashMap () {
  this.entryByHash = new Map()
}

function entryFor (self, key, hash) {
  const entry = self.entryByHash.get(hash) ?? null

  while (entry !== null && !mHash.equal(entry.key, key)) {
    entry = entry.next
  }

  return entry
}

methodFor(Hashmap, function has (key) {
  const hash = mHash.hash(key)
  const entry = entryFor(this, key, hash)

  return entry !== null
})

/**
 * Add (key, val) association. Throw if 'key' already exists in the hashmap.
 */
methodFor(Hashmap, function add (key, val) {
  const hash = mHash.hash(key)
  const entry = entryFor(this, key, hash)

  if (entry !== null) {
    throw new Error(`Key already present`)
  }

  this.entryByHash.set(hash, {key, val, next: this.entryByHash.get(hash) ?? null})
})
