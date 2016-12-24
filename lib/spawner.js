const cp = require('child_process')

let loaded = false
let bv
let lm

function process (data) {
  if (!loaded) {
    const ttyString = data.toString().trim()
    loaded = true

    lm = cp.spawn('/usr/local/bin/node', [
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

function start () {
  bv = cp.spawn('/usr/local/bin/ruby', ['/Users/josh/projects/lamassu-machine/fake_id003.rb'])
  bv.stdout.on('data', process)
}

function run () {
  if (lm && bv) {
    lm.kill()
    bv.kill()
    lm.on('close', run)

    return
  }

  start()
}

function kill () {
  if (lm && bv) {
    lm.kill()
    bv.kill()
  }
}

module.exports = {run, insertBill, kill}
