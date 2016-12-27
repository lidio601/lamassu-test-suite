#!/usr/bin/env node

const fs = require('fs')

const argv = process.argv

const lmPath = argv[2]

if (!lmPath) {
  console.error('config <full path to lamassu-machine>')
  console.error('ex: node bin/config.js /Users/josh/projects/lamassu-machine')
  process.exit(1)
}

if (!fs.existsSync(lmPath)) {
  console.error('Directory does not exist: ' + lmPath)
  process.exit(2)
}

fs.writeFileSync('user-config.json', JSON.stringify({
  lamassuMachinePath: argv[2]
}))

console.log('Success. You can now run nightwatch.')
