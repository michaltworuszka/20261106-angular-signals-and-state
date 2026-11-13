import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const FREE_SHIPPING_FROM = 200;
const SHIPPING_COST = 15;

@Component({
  selector: 'app-c06-signal-computed-cart',
  imports: [DecimalPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C06 – signal-computed-cart</header>

    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Produkt</th>
            <th class="text-end">Cena</th>
            <th class="text-center">Ilość</th>
            <th class="text-end">Wartość</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr>
              <td>{{ item.name }}</td>
              <td class="text-end">{{ item.price | number: '1.2-2' }} zł</td>
              <td class="text-center text-nowrap">
                <button
                  class="btn btn-sm btn-outline-warning"
                  type="button"
                  [disabled]="item.quantity === 0"
                  (click)="changeQuantity(item.id, -1)"
                >
                  -
                </button>
                <code class="mx-2">{{ item.quantity }}</code>
                <button
                  class="btn btn-sm btn-outline-success"
                  type="button"
                  (click)="changeQuantity(item.id, 1)"
                >
                  +
                </button>
              </td>
              <td class="text-end">{{ item.price * item.quantity | number: '1.2-2' }} zł</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <dl class="row mb-0 ms-auto" style="max-width: 24rem">
      <dt class="col-7">Liczba sztuk</dt>
      <dd class="col-5 text-end">
        <code>{{ itemsCount() }}</code>
      </dd>
      <dt class="col-7">Suma</dt>
      <dd class="col-5 text-end">
        <code>{{ subtotal() | number: '1.2-2' }} zł</code>
      </dd>
      <dt class="col-7">Dostawa</dt>
      <dd class="col-5 text-end">
        @if (shipping() === 0) {
          <span class="badge text-bg-success">gratis</span>
        } @else {
          <code>{{ shipping() | number: '1.2-2' }} zł</code>
        }
      </dd>
      <dt class="col-7 border-top pt-2">Do zapłaty</dt>
      <dd class="col-5 text-end border-top pt-2 fw-bold">
        <code>{{ total() | number: '1.2-2' }} zł</code>
      </dd>
    </dl>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p class="mb-0">
        Jedno źródło prawdy: <code>items</code>. Wszystko inne (<code>itemsCount</code>,
        <code>subtotal</code>, <code>shipping</code>, <code>total</code>) to
        <code>computed()</code> – liczone leniwie, zapamiętywane (memo) i przeliczane tylko gdy
        zmieni się zależność. Zero ręcznej synchronizacji.
      </p>
    </blockquote>
  `,
})
export class C06SignalComputedCart {
  // Single source of truth (writable).
  protected readonly items = signal<CartItem[]>([
    { id: 1, name: 'Klawiatura', price: 129.99, quantity: 1 },
    { id: 2, name: 'Mysz', price: 49.5, quantity: 1 },
    { id: 3, name: 'Podkładka', price: 19, quantity: 0 },
  ]);

  // Derived state – chain of computed (computed can depend on computed).
  protected readonly itemsCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  protected readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  protected readonly shipping = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST,
  );
  protected readonly total = computed(() => this.subtotal() + this.shipping());

  protected changeQuantity(id: number, delta: number): void {
    // Immutable update: new array + new object for the changed item.
    this.items.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
      ),
    );
  }
}
