module.exports = {
  'Demo test': browser => {
    browser
      .url(browser.globals.startUrl)
      .loadMachine()
      .waitForElementVisible('#cash-in', 10000)
      .assert.containsText('#cash-in', 'CASH\nIN')
      .click('#cash-in')
      .waitForElementVisible('#insert-bill', 5000)
      .insertBill(1)
      .waitForElementVisible('.send-coins .js-send-crypto-enable', 5000)
      .pause(1000)
      .insertBill(5)
      .waitForElementVisible('.send-coins .js-send-crypto-disable', 5000)
      .waitForElementVisible('.send-coins .js-send-crypto-enable', 5000)
      .click('#send-coins')
      .waitForElementVisible('#completed_viewport', 10000)
      .click('body')
      .waitForElementVisible('#cash-in', 10000)
      .end()
  }
}
