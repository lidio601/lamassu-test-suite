const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const userConfig = require('../user-config.json')

const lamassuMachinePath = userConfig.lamassuMachinePath
const lamassuMachineBinPath = path.resolve(lamassuMachinePath, 'bin', 'lamassu-machine')
const lamassuMachineBvPath = path.resolve(lamassuMachinePath, 'fake_id003.rb')

let loaded = false
let bv
let lm

const lmOut = fs.createWriteStream('/tmp/lamassu-test.log', {flags: 'a'})
const bvOut = fs.createWriteStream('/tmp/lamassu-test-bv.log', {flags: 'a'})

function process (data) {
  if (!loaded) {
    const ttyString = data.toString().trim()
    loaded = true

    lm = cp.spawn('/usr/bin/env', [
      'node',
      lamassuMachineBinPath,
      '--mockBv',
      ttyString,
      '--mockBillDispenser',
      '--mockCam',
      '--mockTrader',
      '--pollTime',
      '500',
      '--crytpoIn',
      '1Lop3EGdaY6nmBr7LqvXgmMwjN961mjWib',
      '--fiat',
      'USD'
    ], {stdio: ['pipe', lmOut, lmOut]})
  }
}

function insertBill (bill) {
  bv.stdin.write(bill + '\n')
}

function start () {
  loaded = false

  bv = cp.spawn('/usr/bin/env', ['ruby', lamassuMachineBvPath], {
    stdio: ['pipe', 'pipe', bvOut]
  })
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
