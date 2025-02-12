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

class TradeManipulator {
  private history: TradeHistory[] = []
  private stockTickHistory: StockTickHistory[] = []

  constructor() {
    this.history = []
    this.stockTickHistory = []
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
        a.time.getTime() === b.time.getTime(),
        a.buyer === b.buyer,
        a.seller === b.seller
      ]

      return !checks.every(c => c)
    }

    return newHistory
      .filter(history => !this.getHistory().some(h => compare(history, h)))
  }

  pushHistory(newHistory: TradeHistory[]): void {
    this.history.push(...this.filterReRenderedHistory(newHistory))

    // Sort todo-make better
    this.history.sort((a, b) => b.time.getTime() - a.time.getTime())
  }

  pushStockTickHistory(newHistory: StockTickHistory[]): void {
    this.stockTickHistory.push(...newHistory)

    // Sort todo-make better
    this.stockTickHistory.sort((a, b) => b.time.getTime() - a.time.getTime())
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

  const domManipulator = new LatestTradesDomManipulator(
    () => tradeManipulator.getHistory(),
    handleTradeUpdate
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
  const handleTradeUpdate = (newTrades: StockTickHistory[]) => {
    // Add new trades
    tradeManipulator.pushStockTickHistory(newTrades)

    // Do stuff
  }

  const stockTickMan = new StockTickGraphDomManipulator(
    handleTradeUpdate
  )

  if (debug) {
    // @ts-ignore
    window.domManipulator = domManipulator
  }
}

export const init = (debug = false) => {
  const tradeManipulator = new TradeManipulator()

  initListOfLastTrades(tradeManipulator, debug)
  initMarketMakerTickGraph(tradeManipulator, debug)

  if (debug) {
    // @ts-ignore
    window.tradeManipulator = tradeManipulator
  }
}