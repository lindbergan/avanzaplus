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

  pushHistory(newHistory: TradeHistory[]): void {
    this.history.push(...newHistory)

    // Sort todo-make better
    this.history.sort((a, b) => b.time.getTime() - a.time.getTime())
  }
}

export const initListOfLastTrades = () => {
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
}