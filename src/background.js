import {addTotalColumn, isOnAboutStockView} from './aboutstock';
import {enableSortingInAccount, isOnAccountView} from './account';

if (isAvanzaActive()) {
  if (isOnAboutStockView()) {
    addTotalColumn();
  } else if (isOnAccountView()) {
    enableSortingInAccount();
  }
}

function isAvanzaActive() {
  return document.location.origin.includes('www.avanza.se'); 
}