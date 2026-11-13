import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartWidget } from './features/cart';

// Root of the mini app – composes features (root depends on features, never vice versa).
@Component({
  selector: 'app-a4-shop',
  imports: [RouterOutlet, CartWidget],
  template: `
    <div class="row g-3">
      <div class="col-md-7"><router-outlet /></div>
      <div class="col-md-5"><app-a4-cart-widget /></div>
    </div>
  `,
})
export class Shop {}
