/** Cart's OWN model – not imported from products. */
export interface CartLine {
  productId: number;
  name: string;
  price: number;
  qty: number;
}
