const userGlobals = require('../user-globals')

module.exports = {
  url: userGlobals.startUrl,
  sections: {
    twoWay: {
      selector: '.dual_idle_state',
      elements: {
        cashIn: '#cash-in',
        cashOut: '#want-cash',
        redeem: '#redeem-button'
      }
    },
    insertBills: {
      selector: '.insert_bills_state'
    },
    insertMoreBills: {
      selector: '.insert_more_bills_state',
      elements: {
        sendEnabled: '.send-coins .js-send-crypto-enable',
        sendDisabled: '.send-coins .js-send-crypto-disable',
        sendCoins: '#send-coins'
      }
    },
    completed: {
      selector: '#completed_viewport'
    }
  }
}
