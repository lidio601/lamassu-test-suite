const chromedriver = require('chromedriver')
const userGlobals = require('./user-globals')
const spawner = require('./lib/spawner')

module.exports = {
  before: function (done) {
    chromedriver.start()

    done()
  },
  after: function (done) {
    chromedriver.stop()
    spawner.kill()

    done()
  },
  startUrl: userGlobals.startUrl
}
