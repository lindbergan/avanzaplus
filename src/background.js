if (isAvanzaActive()) {
  if (isOnAboutStockView()) {
    addTotalColumn();
  } else if (isOnAccountView()) {
    enableSortingInAccount();
  }
}

function addTotalColumn() {
  const rows = document.getElementsByClassName('latest_trades')[0].children[1].children[0].children[1];
  if (rows) createTotalColumn(); rows.addEventListener("transitionend", () => updateListOfLastTrades());
}

var sortIncreasingChange = true;
var sortIncreasingProfit = true;

function enableSortingInAccount() {
  const positionsElement = document.getElementsByClassName('positions')[0];
  const changePercentElement = document.getElementsByClassName('changePercent')[0];
  const profitPercentElement = document.getElementsByClassName('profitPercent')[0];

  if (!positionsElement || !changePercentElement || !profitPercentElement) return;

  changePercentElement.addEventListener('click', () => { 
    sortPositions(positionsElement, 4, sortIncreasingChange);
    sortIncreasingChange = !sortIncreasingChange;
  });
  profitPercentElement.addEventListener('click', () => {
    sortPositions(positionsElement, 9, sortIncreasingProfit);
    sortIncreasingProfit = !sortIncreasingProfit;
  });
}

function isAvanzaActive() {
  return document.location.origin.includes('www.avanza.se'); 
 }
 
 function isOnAboutStockView() {
   return document.getElementsByClassName('latest_trades')[0] !== undefined;
 }
 
 function isOnAccountView() {
   return document.getElementsByClassName('positions')[0] !== undefined;
 }

 /*
  * Sorting by either increasing or decreasing percentage.
  * @param positionsElement: HTML Element, is the HTML element for the positions list.
  * @param indexOfColumn: int, is either the column index for % today or % returns since purchase.
  * @param sortIncreasingOrder: bool, decides whether to sort increasing or decreasing. 
  */
function sortPositions(positionsElement, indexOfColumn, sortIncreasingOrder) {
  const positions = positionsElement.children[0].children[0].children[3];
  const list = Array.from(positions.children);
  const sorted = list.sort((a, b) => {
    var i1 = parseFloat(a.children[indexOfColumn].innerText.replace(/,/, '.'));
    var i2 = parseFloat(b.children[indexOfColumn].innerText.replace(/,/, '.'));
    return sortIncreasingOrder ? i2 - i1 : i1 - i2;
  });
  list.forEach(s => positions.removeChild(s));
  sorted.forEach(s => positions.appendChild(s));
}

/*
 * Parses an amount in text formatting to an actual amount.
 */
function parseAmount(amtInText) {
  return parseFloat(amtInText.replace(" ", ""));
}

/*
 * Parses a price in text formatting to an actual price.
 */
function parsePrice(priceInText) {
  return parseFloat(priceInText.replace(" ", "").replace(/[,]/, "."));
}

function parseTotal(amt, price) {
  return parseInt(amt * price, 10);
}

/*
 * Creates a table cell with a total value of a transaction.
 */
function createTableCell(totalValue) {
  const tableCell = document.createElement('td');
  tableCell.innerText = showAsReadable(totalValue);
  return tableCell;
}

/*
 * Updates the list of last trades column with the transaction values.
 * Calculates the total value and adds it under the total column.
 */
function updateListOfLastTrades() {
  const latestTradesTable = document.getElementsByClassName('latest_trades')[0].children[1].children[0];
  const latestTradesRowsElement = latestTradesTable.children[1];
  
  const rows = latestTradesRowsElement.children;
  if (rows) {
    for (var j = 0; j < rows.length; j++) {
      const amtColumnText = rows[j].children[2].textContent;
      const priceColumnText = rows[j].children[3].textContent;
  
      const amt = parseAmount(amtColumnText);
      const price = parsePrice(priceColumnText);
      const result = parseTotal(amt, price);
      
      if (rows[j].children.length == 5) {
        const tableCell = createTableCell(result);
        rows[j].appendChild(tableCell);
      }
    }
  }
}

/*
 * Creates a table header with a text.
 */
function createTableHeaderCell(text) {
  const tableHeader = document.createElement("th");
  tableHeader.innerText = text;
  return tableHeader;
}

function createTotalColumn() {
  const latestTradesTable = document.getElementsByClassName('latest_trades')[0].children[1].children[0];
  const latestTradesHeaderRow = latestTradesTable.children[0].children[0];
  
  const tableHeaderCell = createTableHeaderCell('Total');
  latestTradesHeaderRow.append(tableHeaderCell);
  
  updateListOfLastTrades();
}

/*
 * Formats numbers to spacing after 3 digits. Ex: 1 000 000.
 */
function showAsReadable(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}