const spawner = require('../lib/spawner')

exports.command = function () {
  this.perform(spawner.run)
  return this
}
