import { Component, inject } from '@angular/core';
import { Cart } from '@shop/cart/data-access';
import { CartSummary } from '@shop/cart/ui';

@Component({
  selector: 'app-a5-cart-widget',
  imports: [CartSummary],
  template: `
    <app-a5-cart-summary [count]="cart.count()" [total]="cart.total()" (clear)="clearCart()" />
  `,
})
export class CartWidget {
  protected readonly cart = inject(Cart);

  protected clearCart(): void {
    this.cart.clear();
  }
}
