import { Component, inject } from '@angular/core';
import { StockStore } from './state';
import { ProductList } from './ui';

@Component({
  selector: 'app-e06-entities-products-panel',
  imports: [ProductList],
  template: `
    <div class="card h-100 border-primary">
      <div class="card-header text-bg-primary">products</div>
      <app-e06-entities-product-list
        [products]="stock.entities()"
        (reserve)="stock.reserve($event)"
      />
    </div>
  `,
})
export class ProductsPanel {
  protected readonly stock = inject(StockStore);
}
