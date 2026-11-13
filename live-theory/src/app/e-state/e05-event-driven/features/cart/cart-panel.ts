import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Cart } from './state';

@Component({
  selector: 'app-e05-cart-panel',
  imports: [DecimalPipe],
  template: `
    <div class="card h-100 border-success">
      <div class="card-header text-bg-success">cart ({{ cart.count() }})</div>
      <ul class="list-group list-group-flush small">
        @for (line of cart.lines(); track line.productId) {
          <li class="list-group-item d-flex justify-content-between align-items-center">
            {{ line.name }} × {{ line.qty }}
            <button
              class="btn btn-sm btn-outline-danger"
              type="button"
              (click)="cart.remove(line.productId)"
            >
              Usuń
            </button>
          </li>
        } @empty {
          <li class="list-group-item text-body-secondary">koszyk pusty</li>
        }
      </ul>
      <div class="card-body d-flex justify-content-between align-items-center">
        <strong>{{ cart.total() | number: '1.2-2' }} zł</strong>
        <button
          class="btn btn-sm btn-success"
          type="button"
          [disabled]="!cart.count()"
          (click)="cart.checkout()"
        >
          Zamów
        </button>
      </div>
    </div>
  `,
})
export class CartPanel {
  protected readonly cart = inject(Cart);
}
