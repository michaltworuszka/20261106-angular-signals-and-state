import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { PricePipe } from '../../../shared/ui';
import { WishlistProduct } from '../util';

@Component({
  imports: [RouterLink, PricePipe],
  selector: 'app-wishlist-item',
  styles: ``,
  template: `
    <li class="list-group-item d-flex justify-content-between">
      @if (product.isLoading() && !product.hasValue()) {
        <span class="text-body-secondary">Loading</span>
      } @else if (product.error()) {
        <span class="text-danger">Could not load SLUG</span>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="product.reload()">
          Try again
        </button>
      } @else if (product.hasValue()) {
        <a [routerLink]="['/products', slug()]">{{ product.value().name }}</a>
        {{ product.value().priceCents | price }}
      }
    </li>
  `,
})
export class WishlistItem {
  slug = input.required<string>();
  product = httpResource<WishlistProduct>(() => '/api/products/' + this.slug());
}
