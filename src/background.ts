import {
  initListOfLastTrades
} from "./latesttrades"

const isAvanzaActive = () => document.location.origin.includes('www.avanza.se')
const isOnAboutStockView = () => document.location.href.includes("/handla/order.html")

if (isAvanzaActive()) {
  if (isOnAboutStockView()) {
    initListOfLastTrades()
  }
}
