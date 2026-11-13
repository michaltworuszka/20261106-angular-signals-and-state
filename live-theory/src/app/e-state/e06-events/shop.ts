import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, scan } from 'rxjs';
import { CartPanel } from './features/cart';
import { OrdersPanel } from './features/orders';
import { ProductsPanel } from './features/products';
import { Events } from '@ngrx/signals/events';

interface LogEntry {
  type: string;
  payload: string;
}

// Root of the mini app – composes features; the only place that sees them all.
@Component({
  selector: 'app-e06-events-shop',
  imports: [ProductsPanel, CartPanel, OrdersPanel],
  template: `
    <div class="row g-3">
      <div class="col-lg-5"><app-e06-events-products-panel /></div>
      <div class="col-lg-4"><app-e06-events-cart-panel /></div>
      <div class="col-lg-3"><app-e06-events-orders-panel /></div>
    </div>

    <div class="card mt-3">
      <div class="card-header">
        NgRx <code>Events.on()</code> – wszystkie zdarzenia (najnowsze u góry)
      </div>
      <ul class="list-group list-group-flush small font-monospace">
        @for (event of log(); track $index) {
          <li class="list-group-item py-1">
            <strong>{{ event.type }}</strong>
            <span class="text-body-secondary">{{ event.payload }}</span>
          </li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">kliknij „Do koszyka”…</li>
        }
      </ul>
    </div>
  `,
})
export class Shop {
  // Devtools-like log: every event on the bus, newest first.
  protected readonly log = toSignal(
    inject(Events)
      .on() // no args = every event (after reducers ran)
      .pipe(
        map((event) => ({ type: event.type, payload: JSON.stringify(event.payload) ?? '' })),
        scan((log: LogEntry[], entry) => [entry, ...log].slice(0, 6), []),
      ),
    { initialValue: [] },
  );
}
