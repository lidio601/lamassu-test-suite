module.exports = {
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
    browser.pause(1000)
    main.click('.cash-button:nth-child(2)')

    main.expect.element('.choose_fiat_state .sums .fiat .fiat-amount').text.to.be.equal('25').before()
    main.expect.element('#js-i18n-choose-digital-amount').text.to.be.equal("You'll be sending 26.250 mBTC")

    main.click('#cash-out-button')

    main.expect.element('.register_phone_state').to.be.visible.before()

    main.click('#phone-keypad .key1')
    main.click('#phone-keypad .key2')
    main.click('#phone-keypad .key3')
    main.click('#phone-keypad .enter-plus')

    main.expect.element('.security_code_state').to.be.visible.before()
    browser.pause(1000)

    main.click('#security-keypad .key1')
    main.click('#security-keypad .key2')
    main.click('#security-keypad .key3')
    main.click('#security-keypad .enter')

    main.expect.element('.waiting_state').to.be.visible.before()

    main.expect.element('#qr-code-deposit').to.be.visible.before()
    main.expect.element('.deposit_state .crypto-address').text.to.be.equal("<Fake address, don't send>").before()
    main.expect.element('.deposit_state .digital .amount').text.to.be.equal('26.250 mBTC').before()
    main.expect.element('.deposit_state .sums .fiat .amount').text.to.be.equal('25 USD').before()

    main.expect.element('.redeem_later_state').to.be.visible.before()
    main.click('#redeem-later-ok')

    main.expect.element(twoWay.selector).to.be.visible.before()

    browser.end()
  },

  after: function (browser, done) {
    browser.killMachine()
    done()
  }
}
