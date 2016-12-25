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
    done()
    // process.exit(0)
  },
  beforeEach: done => {
    spawner.run()
    done()
  },
  afterEach: done => {
    spawner.kill().then(done)
  },
  startUrl: userGlobals.startUrl
}
