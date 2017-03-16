const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const userConfig = require('../user-config.json')

const lamassuMachinePath = userConfig.lamassuMachinePath
const lamassuMachineBinPath = path.resolve(lamassuMachinePath, 'bin', 'lamassu-machine')
const lamassuMachineBvPath = path.resolve(lamassuMachinePath, 'fake_id003.rb')
const lamassuServerPath = userConfig.lamassuServerPath
const lamassuServerBinPath = path.resolve(lamassuServerPath, 'bin', 'lamassu-server')

const SERVER_PORT = 3001

let loaded = false
let bv
let lm
let ls

const lmOut = fs.createWriteStream('/tmp/lamassu-test-lm.log')
const lsOut = fs.createWriteStream('/tmp/lamassu-test-ls.log')
const bvOut = fs.createWriteStream('/tmp/lamassu-test-bv.log')

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
      'USD',
      '--serverPort',
      SERVER_PORT
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
  if (opts.live && !opts.fixture) throw new Error('Need fixture argument')
  if (opts.live && !userConfig.deviceId) throw new Error('Need deviceId argument')

  loaded = false

  bv = cp.spawn('/usr/bin/env', ['ruby', lamassuMachineBvPath], {
    stdio: ['pipe', 'pipe', bvOut]
  })

  const lsArgs = [
    'node',
    lamassuServerBinPath,
    '--fixture',
    opts.fixture,
    '--machine',
    userConfig.deviceId,
    '--port',
    SERVER_PORT,
    '--cassettes',
    '100,100',
    '--mockSms'
  ]

  ls = cp.spawn('/usr/bin/env', lsArgs, {stdio: ['pipe', lsOut, lsOut]})

  bv.on('error', error => {
    console.error(error)
  })
  bv.stdout.on('data', data => process(data, opts))

  ls.on('error', error => {
    console.error(error)
  })
}

function run (opts) {
  return kill().then(() => start(opts))
}

function kill () {
  if (!lm && !bv && !ls) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (lm) {
      lm.kill()
      lm.once('close', () => {
        lm = null
        if (!bv && !ls) return resolve()
      })
    }

    if (bv) {
      bv.kill()
      bv.once('close', () => {
        bv = null
        if (!lm && !ls) return resolve()
      })
    }

    if (ls) {
      ls.kill()
      ls.once('close', () => {
        ls = null
        if (!lm && !bv) return resolve()
      })
    }
  })
}

module.exports = {run, insertBill, kill}
