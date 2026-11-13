import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartWidget } from '@shop/cart/feature';

// The app is thin: it only composes libs.
@Component({
  selector: 'app-a5-shop',
  imports: [RouterOutlet, CartWidget],
  template: `
    <div class="row g-3">
      <div class="col-md-7"><router-outlet /></div>
      <div class="col-md-5"><app-a5-cart-widget /></div>
    </div>
  `,
})
export class Shop {}
