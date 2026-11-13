import { Component, inject } from '@angular/core';
import { Cart } from '@shop/cart/data-access'; // scope:products → scope:cart (allowed direction)
import { ProductCatalog } from '@shop/products/data-access';
import { ProductList } from '@shop/products/ui';
import { Product } from '@shop/products/util';

@Component({
  selector: 'app-a5-products-page',
  imports: [ProductList],
  template: `<app-a5-product-list [products]="catalog.products()" (add)="addToCart($event)" />`,
})
export class ProductsPage {
  protected readonly catalog = inject(ProductCatalog);
  readonly #cart = inject(Cart);

  protected addToCart(product: Product): void {
    this.#cart.add(product);
  }
}
