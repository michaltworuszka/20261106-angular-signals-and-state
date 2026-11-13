export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

/** Seed data – stands in for an API. */
export const PRODUCTS: Product[] = [
  { id: 1, name: 'Klawiatura', price: 199, stock: 3 },
  { id: 2, name: 'Mysz', price: 49.5, stock: 2 },
  { id: 3, name: 'Monitor', price: 899, stock: 1 },
];
