function updateListOfLastTrades() {
  correctLatestTradesSize()
  updateTheTotalColumn()
}

function initListOfLastTrades() {
  addTotalColumn()
  initExtraNumberOfLastTrades()
  initObserver()
}

function initObserver() {
  const root = document.getElementsByClassName('latest_trades')[0].children[1]
    .children[0].children[1]

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mut => {
      updateListOfLastTrades()
    })
  })
  observer.observe(root, {
    childList: true,
  })
}

function correctLatestTradesSize() {
  const children = document.getElementsByClassName('latest_trades')[0]
    .children[1].children[0].children[1].children
  if (children.length >= 25) {
    removeLatestTradesLastChild()
  }
}

function removeLatestTradesLastChild() {
  const children = document.getElementsByClassName('latest_trades')[0]
    .children[1].children[0].children[1].children
  document
    .getElementsByClassName('latest_trades')[0]
    .children[1].children[0].children[1].removeChild(
      children[children.length - 1]
    )
}

/*
 * Adds a column called Total in Latest Trades table and adds an event-listener that listens to new transactions.
 */
function addTotalColumn() {
  const rows = document.getElementsByClassName('latest_trades')[0].children[1]
    .children[0].children[1]
  if (rows) createTotalColumn()
}

function initExtraNumberOfLastTrades() {
  const node = document.createElement('tr')

  document
    .getElementsByClassName('latest_trades')[0]
    .children[1].children[0].children[1].append(node)
}

/*
 * Parses an amount in text formatting to an actual amount.
 */
function parseAmount(amtInText) {
  return parseFloat(amtInText.replace(' ', ''))
}

/*
 * Parses a price in text formatting to an actual price.
 */
function parsePrice(priceInText) {
  return parseFloat(priceInText.replace(' ', '').replace(/[,]/, '.'))
}

function parseTotal(amt, price) {
  return parseInt(amt * price, 10)
}

/*
 * Creates a table cell with a total value of a transaction.
 */
function createTableCell(totalValue) {
  const tableCell = document.createElement('td')
  tableCell.innerText = showAsReadable(totalValue)
  return tableCell
}

/*
 * Updates the list of last trades column with the transaction values.
 * Calculates the total value and adds it under the total column.
 */
function updateTheTotalColumn() {
  const latestTradesTable = document.getElementsByClassName('latest_trades')[0]
    .children[1].children[0]
  const latestTradesRowsElement = latestTradesTable.children[1]

  const rows = latestTradesRowsElement.children
  if (rows) {
    for (var j = 0; j < rows.length; j++) {
      if (
        rows[j].children[2] !== undefined &&
        rows[j].children[3] !== undefined
      ) {
        const amtColumnText = rows[j].children[2].textContent
        const priceColumnText = rows[j].children[3].textContent

        const amt = parseAmount(amtColumnText)
        const price = parsePrice(priceColumnText)
        const result = parseTotal(amt, price)

        if (rows[j].children.length == 5) {
          const tableCell = createTableCell(result)
          rows[j].appendChild(tableCell)
        }
      }
    }
  }
}

/*
 * Creates a table header with a text.
 */
function createTableHeaderCell(text) {
  const tableHeader = document.createElement('th')
  tableHeader.innerText = text
  return tableHeader
}

function createTotalColumn() {
  const latestTradesTable = document.getElementsByClassName('latest_trades')[0]
    .children[1].children[0]
  const latestTradesHeaderRow = latestTradesTable.children[0].children[0]

  const tableHeaderCell = createTableHeaderCell('Total')
  latestTradesHeaderRow.append(tableHeaderCell)

  updateListOfLastTrades()
}

/*
 * Formats numbers to spacing after 3 digits. Ex: 1 000 000.
 */
function showAsReadable(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function isOnAboutStockView() {
  return document.getElementsByClassName('latest_trades')[0] !== undefined
}
