var sortIncreasingChange = true;
var sortIncreasingProfit = true;

if (document.location.origin.includes('www.avanza.se')) {
  if (document.getElementsByClassName('latest_trades')[0]) {
    var rows = document.getElementsByClassName('latest_trades')[0].children[1].children[0].children[1];
    if (rows) createTotal(); rows.addEventListener("transitionend", () => updateList());
  } else if (document.getElementsByClassName('positions')[0]) {
    var positions = document.getElementsByClassName('positions')[0];
    var changePercent = document.getElementsByClassName('changePercent')[0];
    var profitPercent = document.getElementsByClassName('profitPercent')[0];
    changePercent.addEventListener('click', () => { 
      sortPositions(positions, 4, sortIncreasingChange);
      sortIncreasingChange = !sortIncreasingChange;
    });
    profitPercent.addEventListener('click', () => {
      sortPositions(positions, 9, sortIncreasingProfit);
      sortIncreasingProfit = !sortIncreasingProfit;
    });
  }
}


function sortPositions(positionsEl, index, increasing) {
  var positions = positionsEl.children[0].children[0].children[3];
  var rows = positions.children;
  var list = Array.from(rows);
  var sorted = list.sort((a, b) => {
    var i1 = parseFloat(a.children[index].innerText.replace(/,/, '.'));
    var i2 = parseFloat(b.children[index].innerText.replace(/,/, '.'));
    return increasing ? i2 - i1 : i1 - i2;
  });
  list.forEach(s => positions.removeChild(s));
  sorted.forEach(s => positions.appendChild(s));
}

function updateList() {
  var rows = document.getElementsByClassName('latest_trades')[0].children[1].children[0].children[1];
  if (rows) {
    for (var j = 0; j < rows.children.length; j++) {
      var col1 = rows.children[j].children[2].textContent;
      var col2 = rows.children[j].children[3].textContent;
  
      var amnt = parseFloat(col1.replace(/[/s]/, ""));
      var price = parseFloat(col2.replace(/[,]/, "."));
      var result = parseInt(amnt * price, 10);
      if (rows.children[j].children.length == 5) {
        var node1 = document.createElement('td');
        node1.innerText = showAsReadable(result);
        if (rows.children[j].children[5] != undefined) {
          rows.children[j].removeChild(rows.children[j].children[rows.children[j].length - 1]);
        }
        rows.children[j].appendChild(node1);
      }
    }
  }
}

function createTotal() {
  var node = document.createElement("th");
  node.innerText = "Total";
  document.getElementsByClassName('latest_trades')[0].children[1].children[0].children[0].children[0].append(node);
  var rows = document.getElementsByClassName('latest_trades')[0].children[1].children[0].children[1];
  if (rows) {
    for (var j = 0; j < rows.children.length; j++) {
      var col1 = rows.children[j].children[2].textContent;
  
      var col2 = rows.children[j].children[3].textContent;
  
      var amnt = parseFloat(col1.replace(/[/s]/, ""));
      var price = parseFloat(col2.replace(/[,]/, "."));
      var result = parseInt(amnt * price, 10);
  
      var node1 = document.createElement('td');
      node1.innerText = showAsReadable(result);
      rows.children[j].appendChild(node1);
    }
  }
}

function showAsReadable(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}