import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { scan, skip } from 'rxjs';
import { SessionStore, NotificationsStore, ShoppingCartStore } from './e06-signal-store-stores';

/** Smart widget #1 – talks only to SessionStore. */
@Component({
  selector: 'app-e06-session-bar',
  template: `
    @if (session.user(); as user) {
      <span
        >Zalogowany: <strong>{{ user }}</strong></span
      >
      <button class="btn btn-sm btn-outline-danger" type="button" (click)="session.logout()">
        Wyloguj
      </button>
    } @else {
      <span class="text-body-secondary">niezalogowany</span>
      <button class="btn btn-sm btn-outline-primary" type="button" (click)="session.login('Ala')">
        Zaloguj jako Ala
      </button>
    }
  `,
  host: { class: 'd-flex align-items-center gap-2' },
})
export class E06SessionBar {
  protected readonly session = inject(SessionStore);
}

/** Smart widget #2 – talks only to ShoppingCartStore. */
@Component({
  selector: 'app-e06-cart-panel',
  template: `
    <div class="card h-100">
      <div class="card-header">ShoppingCartStore ({{ cart.items().length }})</div>
      <div class="card-body d-flex flex-wrap gap-2">
        @for (item of products; track item) {
          <button class="btn btn-sm btn-primary" type="button" (click)="cart.add(item)">
            + {{ item }}
          </button>
        }
        <button class="btn btn-sm btn-warning" type="button" (click)="addThreeAtOnce()">
          3× Jabłko w jednej chwili
        </button>
      </div>
      <ul class="list-group list-group-flush small">
        @for (item of cart.items(); track $index) {
          <li class="list-group-item py-1">{{ item }}</li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">koszyk pusty</li>
        }
      </ul>
    </div>
  `,
})
export class E06CartPanel {
  protected readonly cart = inject(ShoppingCartStore);
  protected readonly products = ['Jabłko', 'Banan'];

  protected addThreeAtOnce(): void {
    // Synchronous burst: 3 events in the same tick.
    this.cart.add('Jabłko');
    this.cart.add('Jabłko');
    this.cart.add('Jabłko');
  }
}

/** Smart widget #3 – listens via NotificationsStore, never sees Cart/Session directly. */
@Component({
  selector: 'app-e06-toasts',
  template: `
    <div class="card h-100">
      <div class="card-header">NotificationsStore (słucha 2 serwisów)</div>
      <ul class="list-group list-group-flush small">
        @for (toast of notifications.toasts(); track toast.id) {
          <li class="list-group-item py-1 d-flex justify-content-between align-items-center">
            {{ toast.text }}
            <button
              class="btn-close btn-sm"
              type="button"
              aria-label="Zamknij"
              (click)="notifications.dismiss(toast.id)"
            ></button>
          </li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">brak powiadomień</li>
        }
      </ul>
    </div>
  `,
})
export class E06Toasts {
  protected readonly notifications = inject(NotificationsStore);
}

@Component({
  selector: 'app-e06-signal-store-page',
  imports: [E06SessionBar, E06CartPanel, E06Toasts],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3 d-flex justify-content-between">
      E06 – ngrx-signal-store <app-e06-session-bar />
    </header>

    <h2 class="h6">1. E4 jeszcze raz – trzy <code>signalStore</code> zamiast trzech serwisów</h2>
    <div class="row g-3 mb-3">
      <div class="col-md-6"><app-e06-cart-panel /></div>
      <div class="col-md-6"><app-e06-toasts /></div>
    </div>
    <p class="small">
      Dodaj coś i kliknij <strong>Wyloguj</strong>. <code>SessionStore</code> nie wie, że istnieje
      koszyk ani powiadomienia. Tylko ogłasza <code>loggedOut$</code>, a słuchacze sami reagują.
    </p>
    <div class="row g-3">
      <div class="col-lg-6">
        <p class="small fw-semibold mb-1">E4 – <code>&#64;Service()</code></p>
        <pre class="small h-100"><code>{{ serviceCode }}</code></pre>
      </div>
      <div class="col-lg-6">
        <p class="small fw-semibold mb-1">E6 – <code>signalStore()</code></p>
        <pre class="small h-100"><code>{{ storeCode }}</code></pre>
      </div>
    </div>
    <pre class="small mt-4"><code>{{ mapping }}</code></pre>

    <h2 class="h6 mt-4">2. Dlaczego zdarzenie to nie sygnał?</h2>
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <div class="card border-success h-100">
          <div class="card-header">✅ <code>itemAdded$</code> (Subject)</div>
          <div class="card-body">
            <p class="display-6 mb-0">{{ viaSubject() }}</p>
            <small class="text-body-secondary">liczba usłyszanych zdarzeń</small>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-danger h-100">
          <div class="card-header">❌ <code>lastAdded</code> (sygnał „ostatnio dodany”)</div>
          <div class="card-body">
            <p class="display-6 mb-0">{{ viaSignal() }}</p>
            <small class="text-body-secondary">liczba zauważonych zmian</small>
          </div>
        </div>
      </div>
    </div>
    <p class="small">
      Kliknij 2× <strong>+ Jabłko</strong>, potem <strong>3× Jabłko w jednej chwili</strong>. Wynik
      jak w E4: stan w SignalStore to nadal sygnały, więc gubi zdarzenia tak samo.
    </p>
    <pre><code>{{ compareCode }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 3: NgRx SignalStore – ta sama idea, ustandaryzowana</p>
      <ul>
        <li>
          <strong>Zachowanie identyczne jak w E4</strong> (te same dane, te same liczniki w pkt 2).
          Zmienia się tylko forma: store składamy z
          <strong>features</strong> (<code>withState</code>, <code>withComputed</code>,
          <code>withMethods</code>, <code>withHooks</code>, <code>withProps</code>). Kolejność ma
          znaczenie: każdy feature widzi tylko to, co zdefiniowano przed nim.
        </li>
        <li>
          <strong>Stan chroniony domyślnie:</strong> <code>patchState(store, …)</code> działa tylko
          w środku store'a. Z komponentu: błąd kompilacji. W E4 trzeba było pamiętać o
          <code>#</code> + <code>asReadonly()</code>.
        </li>
        <li>
          <strong>Prywatne członki:</strong> prefiks <code>_</code> (<code>_loggedOut</code>,
          <code>_clearOn</code>) – niewidoczne poza store'em. <code>withProps</code> = wszystko, co
          nie jest stanem (Subject, observable, wstrzyknięte serwisy).
        </li>
        <li>
          <strong><code>rxMethod</code></strong> zamiast ręcznego <code>subscribe</code>: przyjmuje
          wartość, sygnał albo Observable. Odpina się sam, gdy ginie store. Hooki
          (<code>onInit</code>) działają w injection context, więc <code>inject()</code> jest
          dozwolony.
        </li>
        <li>
          <strong>Pułapka bez zmian:</strong> store w root też jest leniwy. Zdarzenie wysłane, zanim
          ktoś wstrzyknie <code>NotificationsStore</code>, przepada.
        </li>
        <li>
          <strong>Testy:</strong> tak samo jak serwis –
          <code>TestBed.inject(ShoppingCartStore)</code>
          (<code>e06-signal-store-stores.spec.ts</code>).
        </li>
        <li>
          Kiedy SignalStore zamiast serwisu? Gdy stan feature'u rośnie: wiele pól, encje, hooki,
          wspólne kawałki (<code>signalStoreFeature</code>), devtools. Mały stan → E2 wystarczy.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E06SignalStorePage {
  readonly #cart = inject(ShoppingCartStore);

  // Both counters built the same way – only the source differs.
  protected readonly viaSubject = toSignal(this.#cart.itemAdded$.pipe(scan((n) => n + 1, 0)), {
    initialValue: 0,
  });
  protected readonly viaSignal = toSignal(
    toObservable(this.#cart.lastAdded).pipe(
      skip(1), // toObservable emits the current value first
      scan((n) => n + 1, 0),
    ),
    { initialValue: 0 },
  );

  protected readonly serviceCode = `@Service()
export class ShoppingCart {
  readonly #items = signal<string[]>([]);
  readonly items = this.#items.asReadonly();

  readonly #itemAdded = new Subject<string>();
  readonly itemAdded$ = this.#itemAdded.asObservable();

  constructor() {
    inject(AuthSession).loggedOut$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.#items.set([]));
  }

  add(item: string) {
    this.#items.update((i) => [...i, item]);
    this.#itemAdded.next(item);
  }
}`;

  protected readonly storeCode = `export const ShoppingCartStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as string[] }),
  withProps(() => ({ _itemAdded: new Subject<string>() })),
  withProps(({ _itemAdded }) => ({
    itemAdded$: _itemAdded.asObservable(),
  })),
  withMethods((store) => ({
    add(item: string) {
      patchState(store, (s) => ({ items: [...s.items, item] }));
      store._itemAdded.next(item);
    },
    _clearOn: rxMethod<unknown>(
      tap(() => patchState(store, { items: [] })),
    ),
  })),
  withHooks({
    onInit(store) {
      store._clearOn(inject(SessionStore).loggedOut$);
    },
  }),
);`;

  protected readonly mapping = `E4 (@Service)                          E6 (signalStore)
private signal + asReadonly()      →   withState         (protected – patchState only inside)
computed()                         →   withComputed
methods                            →   withMethods
private Subject, other non-state   →   withProps         (_name = private)
constructor + subscribe + takeUntil →  withHooks.onInit + rxMethod (auto-unsubscribe)`;

  protected readonly compareCode = `add(item: string) {
  patchState(store, (s) => ({ items: [...s.items, item], lastAdded: item }));  // ❌ as event
  store._itemAdded.next(item);                                                  // ✅ event
}`;
}
