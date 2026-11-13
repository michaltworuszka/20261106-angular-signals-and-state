import { Component, inject } from '@angular/core';
import { Cart } from '../cart'; // ✅ other feature only via its barrel (index.ts)
import { Product } from './data';
import { ProductCatalog } from './state';
import { ProductList } from './ui';

// Smart (container): injects state, wires presentational UI.
@Component({
  selector: 'app-a4-products-page',
  imports: [ProductList],
  template: `<app-a4-product-list [products]="catalog.products()" (add)="addToCart($event)" />`,
})
export class ProductsPage {
  protected readonly catalog = inject(ProductCatalog);
  readonly #cart = inject(Cart);

  protected addToCart(product: Product): void {
    this.#cart.add(product);
  }
}
