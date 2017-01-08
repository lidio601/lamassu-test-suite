module.exports = {
  'Cash-in test': browser => {
    const main = browser.page.main()
    const twoWay = main.section.twoWay
    const insertMoreBills = main.section.insertMoreBills

    browser.loadMachine()

    main
    .resize()
    .navigate()
    .expect.element(twoWay.selector).to.be.visible

    twoWay.click('@cashIn')

    main
    .expect.element(main.section.insertBills.selector).to.be.visible.before()

    main
    .insertBill(1)

    main.section.insertBills.expect.element('@processing').to.be.visible
    main.section.insertBills.expect.element('@processing').text.to.equal('Processing $1...')

    insertMoreBills
    .expect.element('@sendEnabled').to.be.visible

    browser.pause(2000)

    insertMoreBills
    .insertBill(5)
    .expect.element('@sendDisabled').to.be.visible.before()

    insertMoreBills.expect.element('@sendEnabled').to.be.visible.before()
    insertMoreBills.expect.element('@processing').to.be.visible.before()

    insertMoreBills.expect.element('@processing').text.to.equal('You inserted a $5 bill')
    insertMoreBills.click('@sendCoins')

    main.expect.element(main.section.completed.selector).to.be.visible.before()
    main.click('body')
    main.expect.element(twoWay.selector).to.be.visible.before()

    browser.killMachine()
    browser.end()
  }
}
