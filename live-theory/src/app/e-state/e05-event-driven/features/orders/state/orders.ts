import { inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus } from '../../../shared/events';
import { Order } from '../data';

/** Orders domain. Only listens – added later without touching cart. */
@Service()
export class Orders {
  readonly #orders = signal<Order[]>([]);
  readonly orders = this.#orders.asReadonly();

  constructor() {
    inject(EventBus)
      .on('[Cart] Checked Out')
      .pipe(takeUntilDestroyed())
      .subscribe(({ lines, total }) =>
        this.#orders.update((orders) => [
          { id: orders.length + 1, items: lines.reduce((n, l) => n + l.qty, 0), total },
          ...orders,
        ]),
      );
  }
}
