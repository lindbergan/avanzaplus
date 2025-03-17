import {
  StockTickHistory,
  TradeHistory
} from "./types"

import {
  LatestTradesDomManipulator
} from "./latesttrades"

import {
  StockTickGraphDomManipulator
} from "./stocktickgraph"

import {
  getTime,
} from "./utils"

interface AvanzaInstrumentInfoFeatureSupport {
  fillAndOrKill: boolean,
  marketTrades: boolean,
  marketTradesSummary: boolean,
  nordicAtMid: boolean,
  openVolume: boolean,
  routingStrategies: boolean,
  stopLoss: boolean,
  stopLossMarketMakerQuote: boolean,
}

interface AvanzaInstrumentInfoTicketSizeList {
  tickSizeEntries: AvanzaInstrumentInfoTicketSizeListTicketSizeEntry[],
}

interface AvanzaInstrumentInfoTicketSizeListTicketSizeEntry {
  max: number,
  min: number,
  tick: number,
}

interface AvanzaInstrumentInfo {
  collateralValue: number,
  countryCode: string,
  currency: string,
  featureSupport: AvanzaInstrumentInfoFeatureSupport,
  id: string,
  instrumentId: string,
  instrumentType: string,
  isin: string,
  marketplace: string,
  maxValidUntil: string,
  minValidUntil: string,
  name: string,
  orderbookStatus: string,
  priceType: string,
  ticketSizeList: AvanzaInstrumentInfoTicketSizeList,
  tickerSymbol: string,
  tradingUnit: number,
  underlyingCountryCode: string,
  underlyingOrderbook: string,
  volumeFactor: number,
}

export interface InstrumentInfo {
  marketMaker: string | undefined,
  instrumentId: string,
}

class TradeManipulator {
  private history: TradeHistory[] = []
  private stockTickHistory: StockTickHistory[] = []
  private instrumentInfo: AvanzaInstrumentInfo | undefined = undefined

  constructor() {
    this.history = []
    this.stockTickHistory = []
    this.instrumentInfo = undefined
  }

  setInstrumentInfo(instrumentInfo: AvanzaInstrumentInfo) {
    this.instrumentInfo = instrumentInfo
  }

  getInstrumentInfo(): AvanzaInstrumentInfo | undefined {
    return this.instrumentInfo
  }

  getHistory(): TradeHistory[] {
    return this.history
  }

  getStockTickHistory(): StockTickHistory[] {
    return this.stockTickHistory
  }

  filterReRenderedHistory(newHistory: TradeHistory[]): TradeHistory[] {
    const compare = (a: TradeHistory, b: TradeHistory): boolean => {
      const checks: boolean[] = [
        a.amount === b.amount,
        a.price === b.price,
        getTime(a.time) === getTime(b.time),
        a.buyer === b.buyer,
        a.seller === b.seller
      ]

      return checks.every(c => c)
    }

    return newHistory
      .filter(history => {
        const foundThis = this.getHistory().find(h => compare(history, h))

        return !foundThis
      })
  }

  pushHistory(newHistory: TradeHistory[]): void {
    const nonPreviouslyAdded = this.filterReRenderedHistory(newHistory)

    if (nonPreviouslyAdded.length > 0) {
      this.history.push(...nonPreviouslyAdded)

      // Sort todo-make better
      this.history.sort((a, b) => getTime(b.time) - getTime(a.time))
    }
  }

  pushStockTickHistory(newHistory: StockTickHistory): void {
    const latestBuyPrice = this.latestBuyPrice()
    const latestSellPrice = this.latestSellPrice()
    const latestTime = this.latestTickTime()

    const sameChecks = [
      newHistory.buyPrice === latestBuyPrice,
      newHistory.sellPrice === latestSellPrice
    ]

    if (sameChecks.every(c => c) || newHistory.time === latestTime) {
      return
    }
    else {
      this.stockTickHistory.push(newHistory)
    }
  }

  latestTick(): StockTickHistory | undefined {
    if (this.stockTickHistory.length > 0) {
      return this.stockTickHistory[this.stockTickHistory.length - 1]
    }

    return undefined
  }

  latestTickTime(): number | undefined {
    return this.latestTick()?.time
  }

  latestBuyPrice(): number | undefined {
    return this.latestTick()?.buyPrice
  }

  latestSellPrice(): number | undefined {
    return this.latestTick()?.sellPrice
  }
}

const initListOfLastTrades = (
  tradeManipulator: TradeManipulator,
  debug = false) => {
  const handleTradeUpdate = (newTrades: TradeHistory[]) => {
    // Add new trades
    tradeManipulator.pushHistory(newTrades)

    // Do stuff
  }

  const getMarketmaker = (tickerSymbol: string): string | undefined => {
    if (tickerSymbol.includes(" AVA ")) return "MSN"
    if (tickerSymbol.includes(" NORDNET ")) return "NRD"
    if (tickerSymbol.includes("BNP")) return "BNP"
    if (tickerSymbol.includes("SHB")) return "SHB"
    if (tickerSymbol.includes(" VT")) return "VON"
    if (tickerSymbol.includes(" SG")) return "SGP"

    return undefined
  }

  const getInstrumentInfo = (): InstrumentInfo | undefined => {
    const info = tradeManipulator.getInstrumentInfo()

    if (info) {
      return {
        instrumentId: info.instrumentId,
        marketMaker: getMarketmaker(info.tickerSymbol)
      }
    }
    else {
      return undefined
    }
  }

  const domManipulator = new LatestTradesDomManipulator(
    () => tradeManipulator.getHistory(),
    handleTradeUpdate,
    getInstrumentInfo,
  )

  if (debug) {
    // @ts-ignore
    window.domManipulator = domManipulator
  }
}

const initMarketMakerTickGraph = (
  tradeManipulator: TradeManipulator,
  debug = false
) => {
  const handleTradeUpdate = (newHistory: StockTickHistory) => {
    // Add new trades
    tradeManipulator.pushStockTickHistory(newHistory)

    // Do stuff
  }

  const stockTickMan = new StockTickGraphDomManipulator(
    handleTradeUpdate
  )

  if (debug) {
    // @ts-ignore
    window.tradeManipulator = tradeManipulator
  }
}

const getInstrumentInfo = (
  tradeManipulator: TradeManipulator,
  debug: boolean = false) => {
  const getId = (): string | undefined => {
    if (window.location.href.includes("/kop/")) {
      return window.location.href.split("/kop/")[1]
    }
    else if (window.location.href.includes("/salj/")) {
      return window.location.href.split("/salj/")[1]
    }
    else if (window.location.href.includes("/andra/")) {
      const parts = window.location.href.split("/andra/")?.[1]?.split("/") || []

      return parts.filter(s => s !== "")[0]
    }

    return undefined
  }
  const instrumentId = getId()
  if (instrumentId !== undefined) {
    fetch(`https://www.avanza.se/_api/trading-critical/rest/orderbook/${instrumentId}`)
      .then(res => res.json())
      .then(res => {
        tradeManipulator.setInstrumentInfo((res as AvanzaInstrumentInfo))
      })
      .catch(err => console.log(err))
  }
}

export const init = (debug = false) => {
  const tradeManipulator = new TradeManipulator()

  getInstrumentInfo(tradeManipulator, debug)
  initListOfLastTrades(tradeManipulator, debug)
  initMarketMakerTickGraph(tradeManipulator, debug)

  if (debug) {
    // @ts-ignore
    window.tradeManipulator = tradeManipulator
  }
}
