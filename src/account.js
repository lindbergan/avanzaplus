var sortIncreasingChange = true
var sortIncreasingProfit = true

const changePercentIndex = 4
const profitPercentIndex = 9

/*
* Adds two event listeners to the column headers: [+/- %] and [Avkastn. %] 
  that sort them by increasing/decreasing order.
*/
function enableSortingInAccount() {
  const positionsElement = document.getElementsByClassName('positions')[0]
  const changePercentElement = document.getElementsByClassName(
    'changePercent'
  )[0]
  const profitPercentElement = document.getElementsByClassName(
    'profitPercent'
  )[0]

  if (!positionsElement || !changePercentElement || !profitPercentElement)
    return

  changePercentElement.addEventListener('click', () => {
    sortPositions(positionsElement, changePercentIndex, sortIncreasingChange)
    sortIncreasingChange = !sortIncreasingChange
  })
  profitPercentElement.addEventListener('click', () => {
    sortPositions(positionsElement, profitPercentIndex, sortIncreasingProfit)
    sortIncreasingProfit = !sortIncreasingProfit
  })
}

/*
 * Sorting by either increasing or decreasing percentage.
 * @param positionsElement: HTML Element, is the HTML element for the positions list.
 * @param indexOfColumn: int, is either the column index for % today or % returns since purchase.
 * @param sortIncreasingOrder: bool, decides whether to sort increasing or decreasing.
 */
function sortPositions(positionsElement, indexOfColumn, sortIncreasingOrder) {
  const positions = positionsElement.children[0].children[0].children[3]
  const list = Array.from(positions.children)
  const sorted = list.sort((a, b) => {
    var firstStockValue = parseFloat(
      a.children[indexOfColumn].innerText.replace(/,/, '.')
    )
    var secondStockValue = parseFloat(
      b.children[indexOfColumn].innerText.replace(/,/, '.')
    )
    return sortIncreasingOrder
      ? secondStockValue - firstStockValue
      : firstStockValue - secondStockValue
  })
  list.forEach(s => positions.removeChild(s))
  sorted.forEach(s => positions.appendChild(s))
}

function addTodaysReturn() {
  var todaysTradesTable = document.querySelector(
    '.avanzabank_deals > .content > table > tbody'
  )
  const observer = new MutationObserver(mutations => {
    const buyTrades = new Map()
    const sellTrades = new Map()
    todaysTradesTable = document.querySelector(
      '.avanzabank_deals > .content > table > tbody'
    )
    if (todaysTradesTable) {
      const clone = todaysTradesTable.cloneNode(true)
      const sortedChildren = Array.from(clone.children).sort(
        (a, b) =>
          b.attributes[1].value.split('|')[3] -
          a.attributes[1].value.split('|')[3]
      )

      var totalReturn = 0

      for (var el of sortedChildren) {
        const id = el.attributes[1].value.split('|')[2]
        const buy = el.attributes[1].value.split('|')[3] === 'BUY'
        const price = parseFloat(
          document
            .querySelector('.avanzabank_deals > .content > table > tbody > tr')
            .children[6].textContent.replace(',', '.')
        )
        const amount = parseFloat(
          document
            .querySelector('.avanzabank_deals > .content > table > tbody > tr')
            .children[6].textContent.replace(',', '.')
        )
        if (buy) {
          const previousTrade = buyTrades.get(id)
          const previousAmount =
            previousTrade !== undefined ? previousTrade.amount : 0
          const previousPrice =
            previousTrade !== undefined ? previousTrade.price : 0
          buyTrades.set(id, {
            amount: amount + previousAmount,
            price:
              price * amount +
              (previousPrice * previousAmount) / (amount + previousAmount),
          })
        } else {
          const previousTrade = sellTrades.get(id)
          const previousAmount =
            previousTrade !== undefined ? previousTrade.amount : 0
          const previousPrice =
            previousTrade !== undefined ? previousTrade.price : 0
          sellTrades.set(id, {
            amount: Math.abs(previousAmount) - Math.abs(amount),
            price:
              price * amount +
              (previousPrice * previousAmount) / (amount + previousAmount),
          })
        }
      }
      for (var [id, value] of sellTrades) {
        const buyTrade = buyTrades.get(id)
        if (buyTrade) {
          totalReturn +=
            value.price * value.amount - (buyTrade.price - buyTrade.amount)
        }
      }

      const childClone = todaysTradesTable.children[
        todaysTradesTable.children.length - 1
      ].cloneNode(true)
      for (child of childClone.children) {
        child.innerText = ''
      }
      childClone.children[3].innerText = 'Total return: '
      childClone.children[4].innerText = totalReturn
      todaysTradesTable.appendChild(childClone)
      observer.disconnect()
    }
  })
  const colGrid = document.querySelector('#surface')
  if (colGrid) {
    observer.observe(colGrid, {
      childList: true,
      subtree: true,
    })
  }
}
