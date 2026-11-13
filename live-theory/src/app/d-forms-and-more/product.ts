/** Product as returned by the fake backend (`src/server-fake-api.ts`). */
export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'owoce' | 'warzywa' | 'nabiał';
}
