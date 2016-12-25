module.exports = {
  'Cash-out test': browser => {
    browser
      .url(browser.globals.startUrl)
      .waitForElementVisible('#cash-in', 10000)
      .click('#want_cash')
      .waitForElementVisible('.choose_fiat_state', 10000)
      .end()
  }
}
