import { Component, inject } from '@angular/core';
import { injectDispatch } from '@ngrx/signals/events';
import { productsPageEvents } from '../../shared/events';
import { StockStore } from './state';
import { ProductList } from './ui';

@Component({
  selector: 'app-e06-events-products-panel',
  imports: [ProductList],
  template: `
    <div class="card h-100 border-primary">
      <div class="card-header text-bg-primary">products</div>
      <app-e06-events-product-list
        [products]="stock.entities()"
        (reserve)="dispatch.addToCartClicked($event)"
      />
    </div>
  `,
})
export class ProductsPanel {
  protected readonly stock = inject(StockStore); // read only
  // Self-dispatching: dispatch.addToCartClicked(id) → '[Products Page] addToCartClicked'
  protected readonly dispatch = injectDispatch(productsPageEvents);
}
