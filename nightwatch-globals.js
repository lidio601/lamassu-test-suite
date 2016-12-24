const chromedriver = require('chromedriver')
const userGlobals = require('./user-globals')

module.exports = {
  before: function (done) {
    chromedriver.start()

    done()
  },
  after: function (done) {
    chromedriver.stop()

    done()
  },
  startUrl: userGlobals.startUrl
}
