const path = require('path')
const userConfig = require('./user-config.json')

const lamassuMachinePath = userConfig.lamassuMachinePath

module.exports = {
  startUrl: 'file://' + path.resolve(lamassuMachinePath, 'ui', 'start-test.html')
}
