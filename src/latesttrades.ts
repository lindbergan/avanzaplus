import {
  TradeHistory,
  ToggleOptionMenu
} from "./types"

import {
  formatTime,
  parseInteger,
  parseTime,
  parseNumber,
  isSet,
} from "./utils"

import {
  MAX_TRADE_HISTORY
} from "./config"

import {
  DomManipulator
} from "./dommanipulator"

import {
  InstrumentInfo
} from "./tradeview"

interface AvanzaTrade {
  buyer: string,
  buyerName: string,
  seller: string,
  sellerName: string,
  dealTime: number,
  price: number,
  volume: number,
  matchedOnMarket: boolean,
  cancelled: boolean,
}

interface ParseResult {
  success: boolean,
  error?: unknown,
  tradeHistory?: TradeHistory,
}

interface AvanzaTradesResponse {
  trades: AvanzaTrade[],
}

export class LatestTradesDomManipulator extends DomManipulator {
  inited: boolean = false
  callback: ((newTrades: TradeHistory[]) => void) | undefined = undefined
  getHistory: () => TradeHistory[]
  getInstrumentInfo: () => InstrumentInfo | undefined
  maxTradeHistoryLength: number = MAX_TRADE_HISTORY

  constructor(
    getHistory: () => TradeHistory[],
    callback: (newTrades: TradeHistory[]) => void,
    getInstrumentInfo: () => InstrumentInfo | undefined
  ) {
    const latestTradesTableSelector = "[data-e2e=orderTradesPanel]"
    super(latestTradesTableSelector)

    this.getHistory = getHistory
    this.callback = callback
    this.getInstrumentInfo = getInstrumentInfo

    const preferences = JSON.parse(sessionStorage.getItem("avanzapluspreferences") || "{}")

    if (preferences["max-length"] !== undefined) {
      this.maxTradeHistoryLength = parseInt(preferences["max-length"])
    }

    if (!this.inited) {
      this.initPoller()
    }
  }

  initPoller() {
    const pollingInterval = 1e2
    let interval = setInterval(() => {
      if (this.getContainer() && this.getTable() && (this.getTableBody()?.children || []).length > 0) {
        clearInterval(interval)
        if (!this.inited) {
          this.inited = true

          this.cloneTable()
          this.initListener()
          this.addTotalRowInHeader()
          this.addOlderHistory()
            // Fallback if error
            .catch(() => this.addPreviousHistory())
            .finally(() => this.renderNewTableRows())

          this.waitForTradeSwitchToRender(() => {
            this.addMaxTradesSwitch()
          })
        }
      }
    }, pollingInterval)
  }

  addPreviousHistory() {
    const fakeTbody = this.getFakeTableBody()

    if (fakeTbody) {
      const parseResults: ParseResult[] = Array.of(...fakeTbody.children)
        .map((node: Node) => this.mapNodeToHistory((node as HTMLTableRowElement)))

      const currentRows = parseResults
        .filter(r => r.success)
        .map(r => r.tradeHistory)
        .filter(th => th !== undefined)

      if (this.callback) {
        this.callback(currentRows)
      }
    }
  }

  async addOlderHistory() {
    const parts = window.location.href.split("/")
    const instrumentId = parts[parts.length - 1]

    const response = await fetch(`https://www.avanza.se/_api/market-guide/trades/${instrumentId}?from=100`)
    const data: AvanzaTradesResponse = await response.json()
    const tradeHistory: TradeHistory[] = data.trades.map(t => ({
      amount: t.volume,
      price: t.price,
      total: t.price * t.volume,
      buyer: t.buyer,
      seller: t.seller,
      id: crypto.randomUUID(),
      time: new Date(t.dealTime)
    }))

    if (this.callback) {
      this.callback(tradeHistory)
    }
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

  cloneToggleOption(): HTMLElement | undefined {
    const toggleOption = document.querySelector("aza-toggle-option")

    if (toggleOption) {
      const clone: HTMLElement = (toggleOption.cloneNode(true) as HTMLElement)

      return clone
    }
    return undefined
  }

  cloneSwitchElement(): HTMLElement | undefined {
    const switchElement = document.querySelector("aza-toggle-switch")

    if (switchElement) {
      const clone: HTMLElement = (switchElement.cloneNode(true) as HTMLElement)

      // Add margin
      clone.style.marginTop = "10px"

      return clone
    }
    return undefined
  }

  createToggleOption = (menu: ToggleOptionMenu): HTMLElement | undefined => {
    const clone = this.cloneToggleOption()

    if (clone) {
      const button = clone.querySelector("button")

      if (button) {
        button.addEventListener("click", () => {
          this.handleMaxLengthChange(menu.value)
        })

        const textSpan = button.querySelector("span")

        if (textSpan) {
          textSpan.textContent = menu.text
        }

        return clone
      }
    }
    return undefined
  }

  waitForTradeSwitchToRender(whenReady: () => void) {
    const intervalPollingMs = 1e2
    let checkingInterval = setInterval(() => {
      const switchEl = this.cloneSwitchElement()
      if (isSet(switchEl)) {
        const toggleEl = this.cloneToggleOption()
        if (isSet(toggleEl)) {
          clearInterval(checkingInterval)

          whenReady()
        }
      }
    }, intervalPollingMs)
  }

  addMaxTradesSwitch() {
    const menus: ToggleOptionMenu[] = [
      {
        text: "Normal",
        value: 10,
      },
      {
        text: "100st",
        value: 100,
      },
      {
        text: "Oändligt",
        value: 1e6,
      },
    ]

    const switchElClone = this.cloneSwitchElement()

    if (switchElClone) {
      // @ts-ignore
      switchElClone.replaceChildren([])

      for (const menu of menus) {
        const toggleOption = this.createToggleOption(menu)

        if (toggleOption) {
          switchElClone.appendChild(toggleOption)
        }
      }

      const container = this.getContainer()

      // Add to container
      if (container) {
        container.appendChild(switchElClone)
      }
    }
  }

  handleMaxLengthChange(value: number) {
    this.maxTradeHistoryLength = value
    this.renderNewTableRows()

    this.saveMaxLength(value)
  }

  saveMaxLength(value: number) {
    const preferences = JSON.parse(sessionStorage.getItem("avanzapluspreferences") || "{}")
    preferences["max-length"] = value

    sessionStorage.setItem("avanzapluspreferences", JSON.stringify(preferences))
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
    const parseResults: ParseResult[] = Array.of(...mutation.addedNodes)
      .map((node: Node) => this.mapNodeToHistory((node as HTMLTableRowElement)))

    const newHistory = parseResults
      .filter(r => r.success)
      .map(r => r.tradeHistory)
      .filter(th => th !== undefined)

    if (newHistory.length > 0) {
      if (this.callback) {
        this.callback(newHistory)
      }
    }
  }

  renderNewTableRows() {
    this.emptyTbodyList()

    const history = this.getHistory()
    const tbody = this.getFakeTableBody()

    if (tbody) {
      for (const el of history.slice(0, this.maxTradeHistoryLength)) {
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

    const isMarketMakerBuyer = this.getInstrumentInfo()?.marketMaker === history.buyer
    const isMarketMakerSeller = this.getInstrumentInfo()?.marketMaker === history.seller
    const isMarketMakerInvolved = isMarketMakerBuyer || isMarketMakerSeller

    const buyColor = "#0474ca"
    const sellColor = "#d0184d"

    // Buyer
    newRow.cells[0].innerText = history.buyer
    newRow.cells[0].style.textAlign = "center"

    if (isMarketMakerInvolved) {
      newRow.cells[0].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    // Seller
    newRow.cells[1].innerText = history.seller
    newRow.cells[1].style.textAlign = "center"

    if (isMarketMakerInvolved) {
      newRow.cells[1].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    // Amount
    newRow.cells[2].innerText = history.amount.toFixed(0)
    newRow.cells[2].style.textAlign = "right"

    if (isMarketMakerInvolved) {
      newRow.cells[2].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    // Price
    newRow.cells[3].innerText = history.price.toFixed(2)
    newRow.cells[3].style.textAlign = "right"
    newRow.cells[3].style.paddingLeft = `8px`

    if (isMarketMakerInvolved) {
      newRow.cells[3].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    // Time
    newRow.cells[6].innerText = formatTime(history.time)
    newRow.cells[6].style.paddingLeft = `8px`
    newRow.cells[6].style.textAlign = "right"

    if (isMarketMakerInvolved) {
      newRow.cells[6].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    // Total
    newRow.appendChild(this.createTotalCell(history))

    if (isMarketMakerInvolved) {
      newRow.cells[7].style.color = isMarketMakerBuyer ? sellColor : buyColor
    }

    newRow.setAttribute("data-fake-id", history.id)

    return newRow
  }

  mapNodeToHistory(node: HTMLTableRowElement): ParseResult {
    try {
      const amount = parseInteger(node.cells[2].innerText)
      const price = parseNumber(parseNumber(node.cells[3].innerText).toFixed(2))
      const total = (amount * price).toFixed(2)
      const buyer = node.cells[0].innerText
      const seller = node.cells[1].innerText
      const time = node.cells[6].innerText
      const id = node.getAttribute("data-fake-id") || crypto.randomUUID()

      return {
        success: true,
        tradeHistory: {
          amount: amount,
          price: price,
          total: parseNumber(total),
          buyer: buyer.trim(),
          seller: seller.trim(),
          time: parseTime(time.trim()),
          id: id,
        },
      }
    }
    catch (e) {
      return {
        success: false,
        error: e,
      }
    }
  }
}