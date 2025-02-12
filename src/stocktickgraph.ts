import { DomManipulator } from "./dommanipulator"
import {
  StockTickHistory
} from "./types"

export class StockTickGraphDomManipulator extends DomManipulator {
  inited: boolean = false
  callback: ((newTrades: StockTickHistory[]) => void) | undefined = undefined

  constructor(callback: ((newTrades: StockTickHistory[]) => void) | undefined) {
    const orderDepthPanel = `data-e2e=orderOrderDepthPanel`
    super(orderDepthPanel)

    this.callback = callback
  }
}