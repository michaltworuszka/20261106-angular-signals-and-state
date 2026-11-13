import { Component, inject } from '@angular/core';
import { Stock } from './state';
import { ProductList } from './ui';

@Component({
  selector: 'app-e05-products-panel',
  imports: [ProductList],
  template: `
    <div class="card h-100 border-primary">
      <div class="card-header text-bg-primary">products</div>
      <app-e05-product-list [products]="stock.products()" (reserve)="stock.reserve($event)" />
    </div>
  `,
})
export class ProductsPanel {
  protected readonly stock = inject(Stock);
}
