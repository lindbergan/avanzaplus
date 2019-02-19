if (isAvanzaActive()) {
  if (isOnAboutStockView()) {
    initListOfLastTrades()
  } else if (isOnAccountView()) {
    enableSortingInAccount()
  }
}

function isAvanzaActive() {
  return document.location.origin.includes('www.avanza.se')
}
