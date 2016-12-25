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
      '--mockTrader',
      '--pollTime',
      '500'
    ])
  }
}

function insertBill (bill) {
  bv.stdin.write(bill + '\n')
}

function start () {
  loaded = false

  bv = cp.spawn('/usr/local/bin/ruby', ['/Users/josh/projects/lamassu-machine/fake_id003.rb'])
  bv.stdout.on('data', process)
}

function run () {
  return kill().then(start)
}

function kill () {
  if (!lm && !bv) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (lm) {
      lm.kill()
      lm.once('close', () => {
        lm = null
        if (!bv) return resolve()
      })
    }

    if (bv) {
      bv.kill()
      bv.once('close', () => {
        bv = null
        if (!lm) return resolve()
      })
    }
  })
}

module.exports = {run, insertBill, kill}
