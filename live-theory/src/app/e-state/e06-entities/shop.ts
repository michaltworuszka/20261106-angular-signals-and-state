import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, scan } from 'rxjs';
import { CartPanel } from './features/cart';
import { OrdersPanel } from './features/orders';
import { ProductsPanel } from './features/products';
import { AppEvent, EventBus } from './shared/events';

interface LogEntry {
  type: AppEvent['type'];
  payload: string;
}

/** JSON of the event without its `type`. */
function payloadOf(event: AppEvent): string {
  return JSON.stringify(event, (key, value) => (key === 'type' ? undefined : value));
}

// Root of the mini app – composes features; the only place that sees them all.
@Component({
  selector: 'app-e06-entities-shop',
  imports: [ProductsPanel, CartPanel, OrdersPanel],
  template: `
    <div class="row g-3">
      <div class="col-lg-5"><app-e06-entities-products-panel /></div>
      <div class="col-lg-4"><app-e06-entities-cart-panel /></div>
      <div class="col-lg-3"><app-e06-entities-orders-panel /></div>
    </div>

    <div class="card mt-3">
      <div class="card-header">EventBus – <code>events$</code> (najnowsze u góry)</div>
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
    inject(EventBus).events$.pipe(
      map((event) => ({ type: event.type, payload: payloadOf(event) })),
      scan((log: LogEntry[], entry) => [entry, ...log].slice(0, 6), []),
    ),
    { initialValue: [] },
  );
}
