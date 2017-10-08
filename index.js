'use strict'
const fl = require('fantasy-land')
const { pull, flatten, map, values } = require('pull-stream')

function of (x) {
  return values([].concat(x))
}

function ap (m) {
  return p => pull(m, chain(f => pull(p, map(f))))
}

function chain (f) {
  return p => pull(p, map(f), flatten())
}

module.exports = {
  of,
  ap,
  map,
  chain,
  [fl.of]: of,
  [fl.ap]: ap,
  [fl.map]: map,
  [fl.chain]: chain
}
