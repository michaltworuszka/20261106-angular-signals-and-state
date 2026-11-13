import { computed, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus, ProductRef } from '../../../shared/events';
import { CartLine } from '../data';

/** Cart domain. Reacts to "Reserved", publishes "Items Released" + "Checked Out". */
@Service()
export class Cart {
  readonly #bus = inject(EventBus);

  readonly #lines = signal<CartLine[]>([]);
  readonly lines = this.#lines.asReadonly();
  readonly count = computed(() => this.#lines().reduce((n, l) => n + l.qty, 0));
  readonly total = computed(() => this.#lines().reduce((s, l) => s + l.price * l.qty, 0));

  constructor() {
    this.#bus
      .on('[Products] Reserved')
      .pipe(takeUntilDestroyed())
      .subscribe(({ product }) => this.#add(product));
  }

  remove(productId: number): void {
    const line = this.#lines().find((l) => l.productId === productId);
    if (!line) {
      return;
    }
    this.#lines.update((lines) => lines.filter((l) => l !== line));
    this.#bus.publish({ type: '[Cart] Items Released', items: [{ productId, qty: line.qty }] });
  }

  checkout(): void {
    const lines = this.#lines();
    if (!lines.length) {
      return;
    }
    const total = this.total();
    this.#lines.set([]);
    this.#bus.publish({ type: '[Cart] Checked Out', lines, total });
  }

  #add({ id, name, price }: ProductRef): void {
    this.#lines.update((lines) =>
      lines.some((l) => l.productId === id)
        ? lines.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
        : [...lines, { productId: id, name, price, qty: 1 }],
    );
  }
}
