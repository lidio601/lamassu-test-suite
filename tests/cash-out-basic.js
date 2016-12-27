module.exports = {
  'Cash-out test': browser => {
    browser
      .url(browser.globals.startUrl)
      .waitForElementVisible('#cash-in', 10000)
      .click('#want_cash')
      .waitForElementVisible('.cash-button:last-child', 10000)
      .click('.cash-button:nth-child(1)')
      .pause(1000)
      .click('.cash-button:nth-child(2)')
      .pause(100)
      .assert.containsText('.choose_fiat_state .sums .fiat .fiat-amount', '15')
      .click('#cash-out-button')
      .waitForElementVisible('#qr-code-deposit', 10000)
      .waitForElementVisible('.pending_deposit_state', 5000)
      .waitForElementVisible('.dispensing_state', 5000)
      .waitForElementVisible('.fiat_complete_state', 5000)
      .click('body')
      .waitForElementVisible('#cash-in', 10000)
      .end()
  }
}
