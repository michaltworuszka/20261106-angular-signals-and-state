import { Component } from '@angular/core';
import { Shop } from './e05-event-driven/shop';

@Component({
  selector: 'app-e05-event-driven-page',
  imports: [Shop],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E05 – event-driven</header>

    <p class="lead">
      Trzy domeny pilnowane przez Sheriff: <code>products</code>, <code>cart</code>,
      <code>orders</code>. <strong>Żadna nie importuje drugiej</strong>. Rozmawiają tylko przez
      zdarzenia w <code>shared/events</code> (pub-sub).
    </p>

    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa! Kliknij „Do koszyka”, „Usuń”, „Zamów” i patrz na log</span>
        <code class="small">src/app/e-state/e05-event-driven/</code>
      </div>
      <div class="card-body"><app-e05-shop /></div>
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Struktura</p>
        <pre class="small"><code>{{ tree }}</code></pre>
      </div>
      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Przepływ zdarzeń</p>
        <pre class="small"><code>{{ flow }}</code></pre>
      </div>
    </div>

    <h2 class="h6 mt-3">1. Kontrakt: unia zdarzeń + typowany bus</h2>
    <pre class="small"><code>{{ contract }}</code></pre>

    <h2 class="h6 mt-3">2. Publikuj i słuchaj w warstwie <code>state</code></h2>
    <pre class="small"><code>{{ store }}</code></pre>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>3. Reguły jako kod</span>
        <code class="small">live-theory/sheriff.config.ts</code>
      </div>
      <div class="card-body">
        <pre class="small mb-0"><code>{{ config }}</code></pre>
      </div>
    </div>

    <div class="card border-danger mt-4">
      <div class="card-header text-bg-danger">Spróbuj na żywo</div>
      <div class="card-body small">
        <ol class="mb-2">
          <li>Otwórz <code>e05-event-driven/features/cart/state/sheriff-demo.ts</code>.</li>
          <li>
            Odkomentuj import <code>Stock</code> → <code>pnpm lint</code> = błąd. W A4 kierunek
            <code>products → cart</code> był dozwolony, tu nie ma żadnego.
          </li>
        </ol>
        <pre class="mb-0 text-danger-emphasis"><code>{{ errors }}</code></pre>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 4: event-driven (pub-sub)</p>
      <ul>
        <li>
          <strong>Cykl bez cyklu:</strong> products → cart (<code>Reserved</code>) i cart → products
          (<code>Items Released</code>). Importami to byłby zakazany cykl. Przez bus obie domeny
          zależą tylko od <code>shared/events</code>.
        </li>
        <li>
          <strong>Nowy słuchacz = zero zmian u nadawcy.</strong> <code>orders</code> doszło bez
          dotykania <code>cart</code>. Tak samo doszłaby analityka, toast czy zapis do API.
        </li>
        <li>
          <strong>Zdarzenie = fakt w czasie przeszłym</strong> (<code>Checked Out</code>), nie
          polecenie (<code>clearCart</code>). Nadawca nie wie, kto i jak zareaguje.
        </li>
        <li>
          <strong>Payload to kontrakt</strong>, nie model domeny. <code>cart</code> ma własny
          <code>CartLine</code> i mapuje <code>ProductRef</code>. Zmiana modelu w products nie psuje
          koszyka.
        </li>
        <li>
          <strong>Tylko <code>type:state</code> zna bus</strong> (depRules). UI i komponenty
          feature'u wołają metody store'a, nie publikują zdarzeń same.
        </li>
        <li>
          <strong>Testy w izolacji:</strong> <code>cart.spec.ts</code> publikuje
          <code>Reserved</code> na bus i sprawdza, co cart opublikował. Bez products i orders.
        </li>
      </ul>
      <p class="fw-semibold mb-1">Koszty:</p>
      <ul class="mb-0">
        <li>
          <strong>Trudniej śledzić:</strong> „kto reaguje na <code>Checked Out</code>?” to
          wyszukiwanie po stringu, nie „Go to definition”. Pomaga log / devtools (jak tutaj).
        </li>
        <li>
          <strong>Fire-and-forget:</strong> Subject nie pamięta. Słuchacz, który jeszcze nie
          istnieje (leniwy serwis, nieodwiedzona trasa z <code>providers</code>), zdarzenie traci.
        </li>
        <li>
          <strong>Brak odpowiedzi:</strong> nadawca nie wie, czy ktoś obsłużył zdarzenie. Gdy
          potrzebujesz wyniku (np. „czy jest na stanie?”), lepsze jest zwykłe wywołanie API domeny.
        </li>
        <li>
          <strong>Centralna unia: </strong>
          <code>AppEvent</code> rośnie z każdą domeną. Większe aplikacje: każda domena wystawia
          własne zdarzenia (np. moduł <code>type:events</code> w domenie).
        </li>
        <li>
          Gotowe rozwiązanie:
          <strong>NgRx SignalStore Events</strong> (<code>&#64;ngrx/signals/events</code>:
          <code>eventGroup</code>, <code>withReducer</code>, <code>withEventHandlers</code>,
          <code>Dispatcher</code>). Stabilne od NgRx 21. Ten sam pomysł + devtools i konwencje dla
          zespołu.
        </li>
        <li>Kiedy? Duże zespoły, wiele domen reagujących na te same zdarzenia.</li>
      </ul>
    </blockquote>
  `,
})
export class E05EventDrivenPage {
  protected readonly tree = `e05-event-driven/
  shared/events/        domain:shared  type:events
    app-events.ts       AppEvent union (the contract)
    event-bus.ts        publish() / on(type)
  features/
    products/           e5:products
      data/  state/stock.ts  ui/  products-panel.ts
    cart/               e5:cart
      data/  state/cart.ts  cart-panel.ts
    orders/             e5:orders
      data/  state/orders.ts  orders-panel.ts
  shop.ts               root – composes the 3 panels`;

  protected readonly flow = `[Products] Reserved      Stock  ──▶ Cart     (add line)
[Cart] Items Released    Cart   ──▶ Stock    (restock)
[Cart] Checked Out       Cart   ──▶ Orders   (new order)
                                ──▶ Shop log (all events)`;

  protected readonly contract = `export type AppEvent =
  | { type: '[Products] Reserved'; product: ProductRef }
  | { type: '[Cart] Items Released'; items: { productId: number; qty: number }[] }
  | { type: '[Cart] Checked Out'; lines: SoldLine[]; total: number };

@Service()
export class EventBus {
  readonly #events = new Subject<AppEvent>();
  readonly events$ = this.#events.asObservable();

  publish(event: AppEvent) { this.#events.next(event); }

  on<T extends AppEvent['type']>(type: T): Observable<Extract<AppEvent, { type: T }>> {
    return this.events$.pipe(filter((e) => e.type === type));   // + type guard
  }
}`;

  protected readonly store = `// features/cart/state/cart.ts – imports ONLY shared/events + own data
@Service()
export class Cart {
  readonly #bus = inject(EventBus);

  constructor() {
    this.#bus.on('[Products] Reserved')               // payload typed: { product }
      .pipe(takeUntilDestroyed())
      .subscribe(({ product }) => this.#add(product));
  }

  checkout() {
    …; this.#lines.set([]);                            // state first
    this.#bus.publish({ type: '[Cart] Checked Out', lines, total });  // then the fact
  }
}`;

  protected readonly config = `const E5 = 'src/app/e-state/e05-event-driven';
modules: {
  [\`\${E5}/features/<domain>\`]:       ['e5:<domain>', 'type:feature'],
  [\`\${E5}/features/<domain>/data\`]:  ['e5:<domain>', 'type:data'],
  [\`\${E5}/features/<domain>/state\`]: ['e5:<domain>', 'type:state'],
  [\`\${E5}/features/<domain>/ui\`]:    ['e5:<domain>', 'type:ui'],
  [\`\${E5}/shared/<type>\`]:           ['domain:shared', 'type:<type>'],   // → type:events
},
depRules: {
  'e5:*': [sameTag, 'domain:shared'],      // NO domain → domain rule at all
  'type:state': ['type:state', 'type:data', 'type:events'],   // only state touches the bus
  'type:events': [],
}`;

  protected readonly errors = `@softarc/sheriff/dependency-rule
  module …/cart/state cannot access …/products/state.
  Tag e5:cart has no clearance for tags e5:products, type:state`;
}
