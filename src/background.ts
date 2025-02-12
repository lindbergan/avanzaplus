import {
  init
} from "./tradeview"

const isAvanzaActive = () => document.location.origin.includes('www.avanza.se')
const isOnAboutStockView = () => document.location.href.includes("/handla/order.html")

let inited = false

if (isAvanzaActive()) {
  let interval = setInterval(() => {
    if (isOnAboutStockView() && !inited) {
      inited = true
      clearInterval(interval)

      init(true)
    }
  }, 1e2)
}
