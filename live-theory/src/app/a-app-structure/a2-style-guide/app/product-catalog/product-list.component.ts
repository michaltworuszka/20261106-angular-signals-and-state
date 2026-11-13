import { Component, inject } from '@angular/core';
import { CartService } from '../cart/cart.service'; // ⚠ reaches into another feature – style guide has no rule (→ A3)
import { formatPrice } from '../format-price';
import { Product } from './product.model';
import { ProductCatalogService } from './product-catalog.service';

@Component({
  selector: 'app-a2-product-list',
  template: `
    <ul class="list-group">
      @for (product of catalog.products(); track product.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            {{ product.name }}
            <small class="text-body-secondary ms-2">{{ formatPrice(product.price) }}</small>
          </span>
          <button class="btn btn-sm btn-outline-success" type="button" (click)="addToCart(product)">
            do koszyka
          </button>
        </li>
      }
    </ul>
  `,
})
export class ProductListComponent {
  // Style guide: Angular-specific members (inject) first, protected for template-only.
  protected readonly catalog = inject(ProductCatalogService);
  readonly #cart = inject(CartService);
  protected readonly formatPrice = formatPrice;

  // Style guide: name handlers by action (addToCart), not by event (handleClick).
  protected addToCart(product: Product): void {
    this.#cart.add(product);
  }
}
