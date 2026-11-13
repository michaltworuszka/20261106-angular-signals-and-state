import { Component, inject } from '@angular/core';
import { Cart } from './state/cart';
import { CartSummary } from './ui/cart-summary';

// Smart: connects Cart state with presentational CartSummary.
@Component({
  selector: 'app-a3-cart-widget',
  imports: [CartSummary],
  template: `
    <app-a3-cart-summary [count]="cart.count()" [total]="cart.total()" (clear)="clearCart()" />
  `,
})
export class CartWidget {
  protected readonly cart = inject(Cart);

  protected clearCart(): void {
    this.cart.clear();
  }
}
