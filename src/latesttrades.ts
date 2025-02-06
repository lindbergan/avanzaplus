import {
  TradeHistory
} from "./types"

import {
  LatestTradesDomManipulator
} from "./dommanipulator"

class TradeManipulator {
  private history: TradeHistory[] = []

  constructor() {
    this.history = []
  }

  getHistory(): TradeHistory[] {
    return this.history
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
}

export const initListOfLastTrades = (debug = false) => {
  const tradeManipulator = new TradeManipulator()

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
    window.tradeManipulator = tradeManipulator
    // @ts-ignore
    window.domManipulator = domManipulator
  }
}