module.exports = {
  'Cash-in test': browser => {
    const main = browser.page.main()
    const twoWay = main.section.twoWay
    const insertMoreBills = main.section.insertMoreBills

    main
    .navigate()
    .waitForElementVisible(twoWay.selector, 10000)

    twoWay.click('@cashIn')

    browser
    .waitForElementVisible(main.section.insertBills.selector, 5000)
    .insertBill(1)

    insertMoreBills
    .waitForElementVisible('@sendEnabled', 5000)

    browser.pause(1000)

    insertMoreBills
    .insertBill(5)
    .waitForElementVisible('@sendDisabled', 5000)
    .waitForElementVisible('@sendEnabled', 5000)
    .click('@sendCoins')

    browser
    .waitForElementVisible(main.section.completed.selector, 10000)
    .click('body')
    .waitForElementVisible(twoWay.selector, 10000)
    .end()
  }
}
