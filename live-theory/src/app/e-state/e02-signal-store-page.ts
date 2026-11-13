import { Component, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartLine, CartStore, CatalogItem } from './cart-store';

const CATALOG: CatalogItem[] = [
  { id: 1, name: 'Jabłko', price: 2.5 },
  { id: 2, name: 'Banan', price: 4.2 },
  { id: 3, name: 'Mleko', price: 3.6 },
  { id: 4, name: 'Ser żółty', price: 29.9 },
];

/** Presentational: inputs/outputs only, knows nothing about the store. */
@Component({
  selector: 'app-catalog-grid',
  imports: [DecimalPipe],
  template: `
    <div class="row g-2">
      @for (item of items(); track item.id) {
        <div class="col-6">
          <div class="card h-100">
            <div class="card-body p-2 d-flex justify-content-between align-items-center">
              <span>
                {{ item.name }}<br /><small>{{ item.price | number: '1.2-2' }} zł</small>
              </span>
              <button class="btn btn-sm btn-primary" type="button" (click)="added.emit(item)">
                +
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogGrid {
  readonly items = input.required<CatalogItem[]>();
  readonly added = output<CatalogItem>();
}

/** Presentational. */
@Component({
  selector: 'app-cart-lines',
  imports: [DecimalPipe],
  template: `
    <ul class="list-group list-group-flush">
      @for (line of lines(); track line.item.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          {{ line.item.name }}
          <span class="d-flex align-items-center gap-2">
            <button
              class="btn btn-sm btn-outline-secondary"
              type="button"
              (click)="qtyChanged.emit({ id: line.item.id, delta: -1 })"
            >
              −
            </button>
            <code>{{ line.qty }}</code>
            <button
              class="btn btn-sm btn-outline-secondary"
              type="button"
              (click)="qtyChanged.emit({ id: line.item.id, delta: 1 })"
            >
              +
            </button>
            <span class="text-end" style="width: 5rem">
              {{ line.item.price * line.qty | number: '1.2-2' }} zł
            </span>
          </span>
        </li>
      } @empty {
        <li class="list-group-item text-body-secondary">koszyk pusty</li>
      }
    </ul>
  `,
})
export class CartLines {
  readonly lines = input.required<CartLine[]>();
  readonly qtyChanged = output<{ id: number; delta: number }>();
}

/** Smart widget elsewhere in the UI – injects the same (root) store directly. */
@Component({
  selector: 'app-cart-badge',
  template: ` <span class="badge rounded-pill text-bg-primary fs-6">🛒 {{ cart.count() }}</span> `,
})
export class CartBadge {
  protected readonly cart = inject(CartStore);
}

/** Smart (container): injects the store, wires presentational components to it. */
@Component({
  selector: 'app-e02-signal-store-page',
  imports: [CatalogGrid, CartLines, CartBadge, DecimalPipe, FormsModule],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3 d-flex justify-content-between">
      E02 – signal-store-page <app-cart-badge />
    </header>

    <div class="row g-3">
      <div class="col-md-6">
        <app-catalog-grid [items]="catalog" (added)="cart.add($event)" />
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between">
            Koszyk ({{ cart.count() }})
            <button
              class="btn btn-sm btn-outline-danger"
              type="button"
              [disabled]="cart.isEmpty()"
              (click)="cart.clear()"
            >
              Wyczyść
            </button>
          </div>
          <app-cart-lines
            [lines]="cart.lines()"
            (qtyChanged)="cart.changeQty($event.id, $event.delta)"
          />
          <div class="card-body border-top small">
            <div class="input-group input-group-sm mb-2">
              <input
                class="form-control"
                placeholder="Kupon: SIGNALS10"
                aria-label="Kupon"
                [(ngModel)]="couponCode"
              />
              <button class="btn btn-outline-primary" type="button" (click)="applyCoupon()">
                Użyj
              </button>
            </div>
            @if (couponError()) {
              <div class="text-danger mb-2">Nieznany kupon</div>
            }
            <div class="d-flex justify-content-between">
              <span>Suma</span><span>{{ cart.subtotal() | number: '1.2-2' }} zł</span>
            </div>
            @if (cart.coupon()) {
              <div class="d-flex justify-content-between text-success">
                <span>Rabat {{ cart.coupon() }}</span>
                <span>−{{ cart.discount() | number: '1.2-2' }} zł</span>
              </div>
            }
            <div class="d-flex justify-content-between fw-bold">
              <span>Do zapłaty</span><span>{{ cart.total() | number: '1.2-2' }} zł</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info small mt-3 mb-0">
      Dodaj coś do koszyka, przejdź na inną stronę menu i wróć. Koszyk zostaje, bo store żyje w root
      injectorze (singleton), a nie w komponencie. F5 czyści koszyk, bo stan jest tylko w pamięci
      (trwałość: <code>effect()</code> + <code>localStorage</code>, patrz C4).
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 2: signal store = serwis z sygnałami</p>
      <p>
        Gdy stan jest potrzebny w <strong>kilku miejscach</strong> (lista, koszyk, badge w
        nagłówku), wynosimy go z komponentu do serwisu. Komponenty go <code>inject()</code>ują, a
        nie przekazują sobie przez 5 poziomów <code>input()</code>.
      </p>
      <ul>
        <li>
          <strong>Hermetyzacja:</strong> zapisywalny <code>#state</code> jest prywatny. Na zewnątrz
          tylko <code>computed</code> (selektory) i <strong>metody</strong> nazwane intencją
          (<code>add</code>, <code>applyCoupon</code>), bez publicznego <code>set()</code>.
        </li>
        <li>
          <strong>Stan pochodny</strong> (<code>count</code>, <code>total</code>,
          <code>discount</code>) liczony w jednym miejscu, a nie powielany w komponentach.
        </li>
        <li>
          <strong>Smart vs prezentacyjne:</strong> tylko kontener (i świadomie badge) zna store.
          <code>CatalogGrid</code> i <code>CartLines</code> mają tylko <code>input</code> /
          <code>output</code>, więc łatwo je testować i używać ponownie.
        </li>
        <li>
          <code>&#64;Service()</code> = krótszy zapis
          <code>&#64;Injectable(&#123; providedIn: 'root' &#125;)</code> (automatycznie w root).
          <code>&#64;Service(&#123; autoProvided: false &#125;)</code> = trzeba go podać w
          <code>providers</code> (patrz E3).
        </li>
        <li>
          Ten wzorzec wystarcza w większości aplikacji. Przy dużym, złożonym stanie feature'u
          następny krok to <strong>NgRx SignalStore</strong> (<code>withState</code>,
          <code>withComputed</code>, <code>withMethods</code>), czyli ta sama idea w
          ustandaryzowanej formie.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E02SignalStorePage {
  protected readonly cart = inject(CartStore);
  protected readonly catalog = CATALOG;

  // UI-only state stays in the component (narrowest scope).
  protected readonly couponCode = signal('');
  protected readonly couponError = signal(false);

  protected applyCoupon(): void {
    this.couponError.set(!this.cart.applyCoupon(this.couponCode()));
  }

  protected readonly code = `@Service()                                   // root singleton
export class CartStore {
  readonly #state = signal<CartState>({ lines: [], coupon: null });   // private, writable

  readonly lines = computed(() => this.#state().lines);              // public, readonly
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly total = computed(() => this.subtotal() - this.discount());

  add(item: CatalogItem) { this.#state.update((s) => ({ ...s, lines: … })); }  // intent
}

// smart component
cart = inject(CartStore);
<app-catalog-grid [items]="catalog" (added)="cart.add($event)" />   // presentational`;
}
