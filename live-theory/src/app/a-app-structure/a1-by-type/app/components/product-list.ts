import { Component, inject } from '@angular/core';
import { Cart } from '../services/cart';
import { Catalog } from '../services/catalog';
import { formatPrice } from '../utils/format-price';

// Naive: every component injects whatever service it needs (no smart/presentational split).
@Component({
  selector: 'app-a1-product-list',
  template: `
    <ul class="list-group">
      @for (product of catalog.products(); track product.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            {{ product.name }}
            <small class="text-body-secondary ms-2">{{ formatPrice(product.price) }}</small>
          </span>
          <button class="btn btn-sm btn-outline-success" type="button" (click)="cart.add(product)">
            do koszyka
          </button>
        </li>
      }
    </ul>
  `,
})
export class ProductList {
  protected readonly catalog = inject(Catalog);
  protected readonly cart = inject(Cart);
  protected readonly formatPrice = formatPrice;
}
