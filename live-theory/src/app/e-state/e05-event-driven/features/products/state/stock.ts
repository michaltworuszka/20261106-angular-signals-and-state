import { inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus } from '../../../shared/events';
import { Product, PRODUCTS } from '../data';

/** Products domain. Publishes "Reserved", reacts to "Items Released". Knows nothing about cart. */
@Service()
export class Stock {
  readonly #bus = inject(EventBus);

  readonly #products = signal<Product[]>(PRODUCTS);
  readonly products = this.#products.asReadonly();

  constructor() {
    this.#bus
      .on('[Cart] Items Released')
      .pipe(takeUntilDestroyed())
      .subscribe(({ items }) =>
        this.#products.update((products) =>
          products.map((p) => {
            const released = items.find((i) => i.productId === p.id);
            return released ? { ...p, stock: p.stock + released.qty } : p;
          }),
        ),
      );
  }

  reserve(id: number): void {
    const product = this.#products().find((p) => p.id === id);
    if (!product || product.stock === 0) {
      return;
    }
    this.#products.update((products) =>
      products.map((p) => (p.id === id ? { ...p, stock: p.stock - 1 } : p)),
    );
    // State first, then the event – listeners see a consistent world.
    const { name, price } = product;
    this.#bus.publish({ type: '[Products] Reserved', product: { id, name, price } });
  }
}
