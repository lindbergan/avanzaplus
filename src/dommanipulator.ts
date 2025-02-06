import {
  TradeHistory
} from "./types"

import {
  formatTime,
  parseInteger,
  parseTime,
  parseNumber,
} from "./utils"

import {
  MAX_TRADE_HISTORY
} from "./config"

class DomManipulator {
  selector: string

  constructor(selector: string) {
    this.selector = selector
  }

  getContainer(): HTMLElement | null {
    return document.querySelector(this.selector)
  }

  getTable(prefix: string = "", suffix: string = ""): HTMLTableElement | undefined | null {
    return this.getContainer()?.querySelector(`${prefix}table${suffix}`)
  }

  getTableHead(prefix: string = "", suffix: string = ""): HTMLTableSectionElement | undefined | null {
    return this.getTable()?.querySelector(`${prefix}thead${suffix}`)
  }

  getTableBody(prefix: string = "", suffix: string = ""): HTMLTableSectionElement | undefined | null {
    return this.getTable()?.querySelector(`${prefix}tbody${suffix}`)
  }
}

export class LatestTradesDomManipulator extends DomManipulator {
  inited: boolean = false
  callback: ((newTrades: TradeHistory[]) => void) | undefined = undefined
  getHistory: () => TradeHistory[]

  constructor(
    getHistory: () => TradeHistory[],
    callback: (newTrades: TradeHistory[]) => void
  ) {
    const latestTradesTableSelector = "[data-e2e=orderTradesPanel]"
    super(latestTradesTableSelector)

    this.getHistory = getHistory
    this.callback = callback

    this.initPoller()
  }

  initPoller() {
    const pollingInterval = 1e2
    let interval = setInterval(() => {
      if (this.getContainer() && this.getTable()) {
        clearInterval(interval)
        this.inited = true

        this.cloneTable()
        this.initListener()
        this.addTotalRowInHeader()
      }
      else {
        console.log("Not found, rechecking soon...")
      }
    }, pollingInterval)
  }

  cloneTable() {
    const tableContainer = this.getContainer()
    const currentTable = this.getTable()

    if (tableContainer && currentTable) {
      const clone = (currentTable.cloneNode(true) as HTMLTableElement)

      // Hide real table
      currentTable.style.display = "none"
      currentTable.setAttribute("data-real", "true")

      // Show fake table
      clone.style.display = "table"
      clone.setAttribute("data-real", "false")

      // Add fake table
      tableContainer.appendChild(clone)
    }
  }

  mutationToCallback(mutationList: MutationRecord[]): void {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        this.handleNewTrades(mutation)
      }
    }

    this.renderNewTableRows()
  }

  handleNewTrades(mutation: MutationRecord) {
    const newHistory: TradeHistory[] = Array.of(...mutation.addedNodes)
      .map((node: Node) => this.mapNodeToHistory((node as HTMLTableRowElement)))

    if (newHistory.length > 0) {
      if (this.callback) {
        this.callback(newHistory)
      }
    }
  }

  renderNewTableRows() {
    this.emptyTbodyList()

    const history = this.getHistory()

    const startIndex = history.length < MAX_TRADE_HISTORY ? 0 : history.length - MAX_TRADE_HISTORY
    const endIndex = history.length

    const tbody = this.getFakeTableBody()

    if (tbody) {
      for (const el of history.slice(startIndex, endIndex)) {
        tbody.appendChild(this.createRow(el))
      }
    }
  }

  initListener() {
    const realTbody = this.getRealTableBody()
    if (realTbody) {
      const observer = new MutationObserver(this.mutationToCallback.bind(this))

      observer.observe(realTbody, {
        childList: true,
      })
    }
  }

  getRealTable(): HTMLTableElement | null | undefined {
    return this.getTable("", `[data-real=true]`)
  }

  getRealTableBody(): HTMLTableSectionElement | null | undefined {
    return this.getRealTable()?.querySelector("tbody")
  }

  getFakeTable(): HTMLTableElement | null | undefined {
    return this.getTable("", `[data-real=false]`)
  }

  getFakeTableBody(): HTMLTableSectionElement | null | undefined {
    return this.getFakeTable()?.querySelector("tbody")
  }

  getFakeTableHead(): HTMLTableSectionElement | null | undefined {
    return this.getFakeTable()?.querySelector("thead")
  }

  emptyTbodyList() {
    const tbody = this.getFakeTableBody()
    if (tbody) {
      // @ts-ignore
      tbody.replaceChildren([])
    }
  }

  createTotalHeaderCell(): HTMLTableCellElement {
    const headerCell = document.createElement("th")

    headerCell.innerText = "Total"
    headerCell.style.minWidth = `100px`

    return headerCell
  }

  createTotalCell(history: TradeHistory): HTMLTableCellElement {
    const totalCell = document.createElement("td")
    totalCell.style.paddingLeft = `8px`
    totalCell.style.textAlign = "right"

    totalCell.innerText = Intl.NumberFormat("sv-SE", {
      currency: "SEK",
      style: "currency"
    })
      .format(history.total)

    return totalCell
  }

  addTotalRowInHeader() {
    const head = this.getFakeTableHead()
    if (head) {
      const firstRow = (head.children[0] as HTMLTableRowElement)

      if (firstRow && firstRow.cells.length === 7) {
        // Seller
        firstRow.cells[1].style.paddingLeft = "8px"

        // Amount
        firstRow.cells[2].style.paddingLeft = `8px`

        firstRow.appendChild(this.createTotalHeaderCell())
      }
    }
  }

  createRow(history: TradeHistory): HTMLTableRowElement {
    const newRow = document.createElement("tr")
    for (let i = 0;i < 7;i++) {
      newRow.appendChild(document.createElement("td"))
    }

    // Buyer
    newRow.cells[0].innerText = history.buyer
    newRow.cells[0].style.textAlign = "center"

    // Seller
    newRow.cells[1].innerText = history.seller
    newRow.cells[1].style.textAlign = "center"

    // Amount
    newRow.cells[2].innerText = history.amount.toFixed(0)
    newRow.cells[2].style.textAlign = "right"

    // Price
    newRow.cells[3].innerText = history.price.toFixed(2)
    newRow.cells[3].style.textAlign = "right"
    newRow.cells[3].style.paddingLeft = `8px`

    // Time
    newRow.cells[6].innerText = formatTime(history.time)
    newRow.cells[6].style.paddingLeft = `8px`
    newRow.cells[6].style.textAlign = "right"

    // Total
    newRow.appendChild(this.createTotalCell(history))

    return newRow
  }

  mapNodeToHistory(node: HTMLTableRowElement): TradeHistory {
    const amount = parseInteger(node.cells[2].innerText)
    const price = parseNumber(parseNumber(node.cells[3].innerText).toFixed(2))
    const total = (amount * price).toFixed(2)
    const buyer = node.cells[0].innerText
    const seller = node.cells[1].innerText
    const time = node.cells[6].innerText

    return {
      amount: amount,
      price: price,
      total: parseNumber(total),
      buyer: buyer.trim(),
      seller: seller.trim(),
      time: parseTime(time.trim()),
    }
  }
}