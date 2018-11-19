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

module.exports = {
  enableSortingInAccount,
  isOnAccountView
};