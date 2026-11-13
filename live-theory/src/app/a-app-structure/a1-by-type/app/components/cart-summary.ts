import { Component, inject } from '@angular/core';
import { Cart } from '../services/cart';
import { formatPrice } from '../utils/format-price';

@Component({
  selector: 'app-a1-cart-summary',
  template: `
    <div class="card">
      <div class="card-body">
        <div>
          Koszyk: <strong>{{ cart.count() }}</strong> szt.
        </div>
        <div>
          Razem: <strong>{{ formatPrice(cart.total()) }}</strong>
        </div>
        <button
          class="btn btn-sm btn-outline-danger mt-2"
          type="button"
          [disabled]="cart.count() === 0"
          (click)="cart.clear()"
        >
          wyczyść
        </button>
      </div>
    </div>
  `,
})
export class CartSummary {
  protected readonly cart = inject(Cart);
  protected readonly formatPrice = formatPrice;
}
