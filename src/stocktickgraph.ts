import { DomManipulator } from "./dommanipulator"
import {
  StockTickHistory
} from "./types"
import { parseNumber } from "./utils"

export class StockTickGraphDomManipulator extends DomManipulator {
  inited: boolean = false
  callback: ((newHistory: StockTickHistory) => void) | undefined = undefined

  constructor(callback: ((newHistory: StockTickHistory) => void) | undefined) {
    const orderDepthPanel = `[data-e2e=orderOrderDepthPanel]`
    super(orderDepthPanel)

    this.callback = callback

    if (!this.inited) {
      this.initPoller()
    }
  }

  initPoller() {
    const pollingInterval = 1e2
    let interval = setInterval(() => {
      if (this.getContainer()) {
        clearInterval(interval)
        if (!this.inited) {
          this.inited = true

          this.initListener()
        }
      }
    }, pollingInterval)
  }

  initListener() {
    const cont = this.getContainer()

    if (cont) {
      const el = cont.querySelector(".level-row button")

      if (el) {
        const observer = new MutationObserver(this.mutationToCallback.bind(this))

        observer.observe(el, {
          attributes: true,
        })
      }
    }
  }

  mutationToCallback(mutationList: MutationRecord[]): void {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        this.handleNewTrades(mutation)
      }
    }
  }

  handleNewTrades(mutation: MutationRecord) {
    const cont = this.getContainer()

    if (cont) {
      const rows = cont.querySelectorAll("div[role=\"table\"] div[role=\"row\"].level")

      for (let row of rows) {
        const getVolume = (volumeEl: HTMLDivElement): number => {
          const volume = parseNumber(volumeEl.innerText)

          return volume
        }

        const getPrice = (priceEl: HTMLButtonElement): number => {
          const price = parseNumber(priceEl.innerText.replace("*", ""))

          return price
        }

        const isMarketMaker = (el: HTMLButtonElement): boolean => {
          return el.innerText.includes("*")
        }

        const buyVolumeEl = (row.querySelector("div[role=\"cell\"].volume.buy") as HTMLDivElement)
        const sellVolumeEl = (row.querySelector("div[role=\"cell\"].volume.sell") as HTMLDivElement)

        const buyPriceEl = (row.querySelector("div[role=\"cell\"].price.buy button") as HTMLButtonElement)
        const sellPriceEl = (row.querySelector("div[role=\"cell\"].price.sell button") as HTMLButtonElement)

        if (buyVolumeEl && sellVolumeEl && buyPriceEl && sellPriceEl) {
          const buyVolume = getVolume(buyVolumeEl)
          const buyPrice = getPrice(buyPriceEl)

          const sellVolume = getVolume(sellVolumeEl)
          const sellPrice = getPrice(sellPriceEl)

          if (isMarketMaker(buyPriceEl) && isMarketMaker(sellPriceEl)) {
            const history: StockTickHistory = {
              buyVolume,
              buyPrice,
              sellPrice,
              sellVolume,
              time: Date.now(),
            }

            if (this.callback) {
              this.callback(history)
            }
          }
        }
      }
    }
  }
}