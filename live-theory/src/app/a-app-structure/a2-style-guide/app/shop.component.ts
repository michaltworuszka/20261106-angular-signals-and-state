import { Component } from '@angular/core';
import { CartSummaryComponent } from './cart/cart-summary.component';
import { ProductListComponent } from './product-catalog/product-list.component';

// Root of the mini app.
@Component({
  selector: 'app-a2-shop',
  imports: [ProductListComponent, CartSummaryComponent],
  template: `
    <div class="row g-3">
      <div class="col-md-7"><app-a2-product-list /></div>
      <div class="col-md-5"><app-a2-cart-summary /></div>
    </div>
  `,
})
export class ShopComponent {}
