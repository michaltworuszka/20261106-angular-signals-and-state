import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../data';

/** Presentational – inputs/outputs only. */
@Component({
  selector: 'app-e06-entities-product-list',
  imports: [DecimalPipe],
  template: `
    <ul class="list-group list-group-flush small">
      @for (p of products(); track p.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            {{ p.name }} <span class="text-body-secondary">{{ p.price | number: '1.2-2' }} zł</span>
          </span>
          <span class="d-flex align-items-center gap-2">
            <span class="badge" [class]="p.stock ? 'text-bg-secondary' : 'text-bg-danger'">
              stan: {{ p.stock }}
            </span>
            <button
              class="btn btn-sm btn-primary"
              type="button"
              [disabled]="!p.stock"
              (click)="reserve.emit(p.id)"
            >
              Do koszyka
            </button>
          </span>
        </li>
      }
    </ul>
  `,
})
export class ProductList {
  readonly products = input.required<Product[]>();
  readonly reserve = output<number>();
}
