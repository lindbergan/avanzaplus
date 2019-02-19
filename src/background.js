if (isAvanzaActive()) {
  if (isOnAboutStockView()) {
    initListOfLastTrades()
  } else if (isOnAccountView()) {
    enableSortingInAccount()
    addTodaysReturn()
  }
}

function isAvanzaActive() {
  return document.location.origin.includes('www.avanza.se')
}

function isOnAccountView() {
  return document.getElementsByClassName('positions')[0] !== undefined
}
