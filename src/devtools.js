/* eslint-disable */
function renameStocks() {
  var positions = document.getElementsByClassName('positions')[0];
  var pos = positions.children[0].children[0].children[3];
  for (var i = 0; i < pos.length; i++) {
      pos.children[i].children[1].children[0].children[1].innerText = `Aktie ${i + 1}`;
  }
}