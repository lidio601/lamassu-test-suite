const spawner = require('../lib/spawner')

exports.command = function (bill) {
  this.perform(() => spawner.insertBill(bill))
  return this
}
