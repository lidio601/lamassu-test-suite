const spawner = require('../lib/spawner')

exports.command = function (opts) {
  this.perform(() => spawner.run(opts || {}))
  return this
}
