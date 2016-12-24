const cp = require('child_process')

let loaded = false
let bv

function process (data) {
  if (!loaded) {
    const ttyString = data.toString().trim()
    loaded = true

    cp.spawn('/usr/local/bin/node', [
      '/Users/josh/projects/lamassu-machine/bin/lamassu-machine',
      '--mockBv',
      ttyString,
      '--mockBillDispenser',
      '--mockCam',
      '--mockTrader'
    ])

    // lm.stderr.on('data', data => console.log(data.toString().trim()))
  }
}

function insertBill (bill) {
  bv.stdin.write(bill + '\n')
}

function run () {
  bv = cp.spawn('/usr/local/bin/ruby', ['/Users/josh/projects/lamassu-machine/fake_id003.rb'])
  bv.stdout.on('data', process)
}

module.exports = {run, insertBill}
