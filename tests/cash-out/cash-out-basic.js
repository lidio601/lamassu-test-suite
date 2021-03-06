module.exports = {
  after: browser => {
    browser.killMachine()
    browser.end()
  },
  'Cash-out test': browser => {
    const main = browser.page.main()
    const twoWay = main.section.twoWay

    browser.loadMachine({live: true, fixture: 'two-way-btc'})

    main
    .resize()
    .navigate()
    .expect.element(twoWay.selector).to.be.visible

    main.click('#want_cash')

    main.expect.element('.cash-button:last-child').to.be.visible.before()

    main.click('.cash-button:nth-child(1)')
    browser.pause(1000)
    main.click('.cash-button:nth-child(2)')

    main.expect.element('.choose_fiat_state .sums .fiat .fiat-amount').text.to.be.equal('15').before()
    main.expect.element('#js-i18n-choose-digital-amount').text.to.be.equal("You'll be sending 15.750 mBTC")

    main.click('#cash-out-button')

    main.expect.element('#qr-code-deposit').to.be.visible.before()
    main.expect.element('.deposit_state .crypto-address').text.to.be.equal("<Fake address, don't send>").before()

    main.expect.element('.deposit_state .digital .amount').text.to.be.equal('15.750 mBTC').before()
    main.expect.element('.deposit_state .sums .fiat .amount').text.to.be.equal('15 USD').before()

    main.expect.element('.pending_deposit_state').to.be.visible.before(20000)
    main.expect.element('.dispensing_state').to.be.visible.before()
    main.expect.element('.fiat_complete_state').to.be.visible.before()
    main.click('body')
    main.expect.element(twoWay.selector).to.be.visible.before()
  }
}
