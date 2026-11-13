import { Component, inject } from '@angular/core';
import { formatPrice } from '../format-price';
import { CartService } from './cart.service';

@Component({
  selector: 'app-a2-cart-summary',
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
          (click)="clearCart()"
        >
          wyczyść
        </button>
      </div>
    </div>
  `,
})
export class CartSummaryComponent {
  protected readonly cart = inject(CartService);
  protected readonly formatPrice = formatPrice;

  protected clearCart(): void {
    this.cart.clear();
  }
}
