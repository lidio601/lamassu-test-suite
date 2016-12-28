module.exports = {
  'Cash-in test': browser => {
    const main = browser.page.main()
    const twoWay = main.section.twoWay
    const insertMoreBills = main.section.insertMoreBills

    main
    .resize()
    .navigate()
    .waitForElementVisible(twoWay.selector, 10000)

    twoWay.click('@cashIn')

    browser
    .waitForElementVisible(main.section.insertBills.selector)
    .insertBill(1)

    main.section.insertBills.waitForElementVisible('@processing')
    .assert.containsText('@processing', 'Processing $1...')

    insertMoreBills
    .waitForElementVisible('@sendEnabled')

    browser.pause(2000)

    insertMoreBills
    .insertBill(5)
    .waitForElementVisible('@sendDisabled')
    .waitForElementVisible('@sendEnabled')
    .waitForElementVisible('@processing')
    .assert.containsText('@processing', 'You inserted a $5 bill')
    .click('@sendCoins')

    browser
    .waitForElementVisible(main.section.completed.selector, 10000)
    .click('body')
    .waitForElementVisible(twoWay.selector, 10000)
    .end()
  }
}
