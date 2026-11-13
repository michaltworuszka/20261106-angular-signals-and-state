import { Component, inject } from '@angular/core';
import { Cart } from '../cart/state/cart'; // ⚠ no public API – any file of another feature is reachable
import { Product } from './data/product';
import { ProductCatalog } from './state/product-catalog';
import { ProductList } from './ui/product-list';

// Smart (container): injects state, wires presentational UI.
@Component({
  selector: 'app-a3-products-page',
  imports: [ProductList],
  template: `<app-a3-product-list [products]="catalog.products()" (add)="addToCart($event)" />`,
})
export class ProductsPage {
  protected readonly catalog = inject(ProductCatalog);
  readonly #cart = inject(Cart);

  protected addToCart(product: Product): void {
    this.#cart.add(product);
  }
}
