import { Component, input, output } from '@angular/core';
import { PricePipe } from '../../../shared/ui/price-pipe';
import { Product } from '../data/product';

// ui/ = presentational: only input()/output(), no injected state.
@Component({
  selector: 'app-a3-product-list',
  imports: [PricePipe],
  template: `
    <ul class="list-group">
      @for (product of products(); track product.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            {{ product.name }}
            <small class="text-body-secondary ms-2">{{ product.price | price }}</small>
          </span>
          <button class="btn btn-sm btn-outline-success" type="button" (click)="add.emit(product)">
            do koszyka
          </button>
        </li>
      }
    </ul>
  `,
})
export class ProductList {
  readonly products = input.required<Product[]>();
  readonly add = output<Product>();
}
