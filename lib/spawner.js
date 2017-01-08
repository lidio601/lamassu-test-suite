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

function process (data, opts) {
  bvOut.write(data)

  if (!loaded) {
    const ttyString = data.toString().trim()
    loaded = true

    const args = [
      'node',
      lamassuMachineBinPath,
      '--port',
      '8081',
      '--mockBv',
      ttyString,
      '--mockBillDispenser',
      '--mockCam',
      '--mockBTC',
      '1Lop3EGdaY6nmBr7LqvXgmMwjN961mjWib',
      '--pollTime',
      '500',
      '--cryptoIn',
      '1Lop3EGdaY6nmBr7LqvXgmMwjN961mjWib',
      '--fiat',
      'USD'
    ]

    if (!opts.live) args.push('--mockTrader')

    lm = cp.spawn('/usr/bin/env', args, {stdio: ['pipe', lmOut, lmOut]})

    lm.on('error', console.error)
  }
}

function insertBill (bill) {
  bv.stdin.write(bill + '\n')
}

function start (opts) {
  loaded = false

  bv = cp.spawn('/usr/bin/env', ['ruby', lamassuMachineBvPath], {
    stdio: ['pipe', 'pipe', bvOut]
  })

  bv.on('error', error => {
    console.error(error)
  })
  bv.stdout.on('data', data => process(data, opts))
}

function run (opts) {
  return kill().then(() => start(opts))
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
