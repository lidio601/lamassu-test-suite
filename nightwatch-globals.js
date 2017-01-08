const chromedriver = require('chromedriver')
const userGlobals = require('./user-globals')

module.exports = {
  before: function (done) {
    chromedriver.start(['--verbose', '--log-path=chrome.log'])
    done()
  },
  after: function (done) {
    chromedriver.stop()
    done()
    process.exit(0)
  },
  startUrl: userGlobals.startUrl,
  waitForConditionTimeout: 5000
}
