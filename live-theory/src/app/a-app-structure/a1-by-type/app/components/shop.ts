import { Component } from '@angular/core';
import { CartSummary } from './cart-summary';
import { ProductList } from './product-list';

// Root of the mini app.
@Component({
  selector: 'app-a1-shop',
  imports: [ProductList, CartSummary],
  template: `
    <div class="row g-3">
      <div class="col-md-7"><app-a1-product-list /></div>
      <div class="col-md-5"><app-a1-cart-summary /></div>
    </div>
  `,
})
export class Shop {}
