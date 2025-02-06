export interface TradeHistory {
  amount: number,
  price: number,
  total: number,
  time: Date,
  seller: string,
  buyer: string,
  id: string,
}

export type Unset = undefined | null
export type Defined<T> = T extends Unset ? never : T

export type ToggleOptionMenu = {
  text: string,
  value: number,
}