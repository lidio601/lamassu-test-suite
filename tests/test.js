module.exports = {
  'Demo test': browser => {
    browser
      .url(browser.globals.startUrl)
      .waitForElementVisible('#cash-in', 5000)
      .assert.containsText('#cash-in', 'CASH\nIN')
      .click('#cash-in')
      .waitForElementVisible('#insert-bill', 5000)
      .end()
  }
}
