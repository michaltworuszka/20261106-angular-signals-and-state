import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OrdersStore } from './state';

@Component({
  selector: 'app-e06-events-orders-panel',
  imports: [DecimalPipe],
  template: `
    <div class="card h-100 border-warning">
      <div class="card-header text-bg-warning">orders</div>
      <ul class="list-group list-group-flush small">
        @for (order of orders.entities(); track order.id) {
          <li class="list-group-item d-flex justify-content-between">
            #{{ order.id }} · {{ order.items }} szt.
            <strong>{{ order.total | number: '1.2-2' }} zł</strong>
          </li>
        } @empty {
          <li class="list-group-item text-body-secondary">brak zamówień</li>
        }
      </ul>
    </div>
  `,
})
export class OrdersPanel {
  protected readonly orders = inject(OrdersStore);
}
