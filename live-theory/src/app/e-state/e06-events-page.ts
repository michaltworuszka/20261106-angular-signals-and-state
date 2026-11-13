import { Component } from '@angular/core';
import { Shop } from './e06-events/shop';

@Component({
  selector: 'app-e06-events-page',
  imports: [Shop],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E06 – ngrx-events</header>

    <p class="lead">
      E5 bez własnego busa: <code>&#64;ngrx/signals/events</code>. Komponenty tylko
      <strong>ogłaszają</strong>, co zrobił użytkownik. Store'y same decydują, co z tego wynika.
    </p>

    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa tak samo jak E5. Patrz na log: zdarzenia „Page” + domenowe</span>
        <code class="small">src/app/e-state/e06-events/</code>
      </div>
      <div class="card-body"><app-e06-events-shop /></div>
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Przepływ (Flux)</p>
        <pre class="small"><code>{{ flow }}</code></pre>
      </div>
      <div class="col-lg-6">
        <p class="fw-semibold mb-1">E5 → E6 Events</p>
        <pre class="small"><code>{{ mapping }}</code></pre>
      </div>
    </div>

    <h2 class="h6 mt-3">1. Kontrakt: <code>eventGroup</code> (zamiast unii + busa)</h2>
    <pre class="small"><code>{{ contract }}</code></pre>

    <h2 class="h6 mt-3">2. Komponent: <code>injectDispatch</code></h2>
    <pre class="small"><code>{{ component }}</code></pre>

    <h2 class="h6 mt-3">3. Store: <code>withReducer</code> + <code>withEventHandlers</code></h2>
    <pre class="small"><code>{{ store }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 4 w wersji NgRx</p>
      <ul>
        <li>
          <strong><code>withReducer</code></strong> – czyste przejścia stanu:
          <code>(event, state) =&gt; partial / updater / [updaters]</code>. Bez wstrzykiwania, bez
          efektów ubocznych. Wiele store'ów może mieć reducer na <strong>to samo</strong> zdarzenie
          (<code>reserved</code> → stock −1 i koszyk +1).
        </li>
        <li>
          <strong><code>withEventHandlers</code></strong> – decyzje i efekty (HTTP, sprawdzenie
          stanu). Zwrócone zdarzenie jest <strong>automatycznie</strong> dispatchowane.
        </li>
        <li>
          <strong>Kolejność:</strong> najpierw wszystkie reducery, potem handlery. Dlatego
          <code>checkoutClicked</code> nie ma reducera: handler czyta linie, emituje
          <code>checkedOut</code>, a dopiero jego reducer czyści koszyk.
        </li>
        <li>
          <strong>Store bez metod publicznych</strong> = jedno wejście (zdarzenia), stan tylko do
          odczytu. Komponent nie wie, kto reaguje (Sheriff: <code>type:feature</code> może
          importować <code>shared/events</code>).
        </li>
        <li>
          <strong>Testy:</strong> <code>Dispatcher.dispatch(event)</code> na wejściu, stan i
          <code>Events.on(...)</code> na wyjściu (<code>cart-store.spec.ts</code>).
        </li>
        <li>
          <strong>Status:</strong> stabilne od NgRx 21 (tu: 22.0.1). W v20 handlery nazywały się
          <code>withEffects</code> – stare artykuły.
        </li>
      </ul>
      <p class="fw-semibold mb-1">Koszt vs E6 Entities</p>
      <ul class="mb-0">
        <li>
          Więcej zdarzeń (6 zamiast 3) i więcej pośrednich kroków – „co się stanie po kliknięciu?”
          wymaga przejścia po reducerach i handlerach.
        </li>
        <li>
          W zamian: pełny log intencji użytkownika, łatwe dokładanie słuchaczy, konwencja dla dużych
          zespołów. Bez tych potrzeb → E6 Entities / E2 w zupełności wystarczą.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E06EventsPage {
  protected readonly flow = `click "Do koszyka"
  └─ [Products Page] addToCartClicked(1)           component
       └─ StockStore handler: stock > 0?
            └─ [Products] reserved({ id, name, price })
                 ├─ StockStore reducer   stock − 1
                 └─ CartStore reducer    line + 1

click "Zamów"
  └─ [Cart Page] checkoutClicked
       └─ CartStore handler
            └─ [Cart] checkedOut({ lines, total })
                 ├─ CartStore reducer    removeAllEntities
                 └─ OrdersStore reducer  prependEntity`;

  protected readonly mapping = `E5                                 E6 Events
AppEvent union                 →   eventGroup({ source, events })
EventBus.publish(event)        →   Dispatcher / injectDispatch
EventBus.on(type).subscribe    →   withReducer(on(event, …))     state
  + rxMethod / subscribe       →   withEventHandlers(…)          effects
store.reserve(id) (method)     →   dispatch.addToCartClicked(id)
EventBus.events$ (log)         →   inject(Events).on()`;

  protected readonly contract = `export const productsPageEvents = eventGroup({
  source: 'Products Page',                       // who: the user on a page
  events: { addToCartClicked: type<number>() },
});

export const cartEvents = eventGroup({
  source: 'Cart',                                // who: the domain
  events: {
    itemsReleased: type<{ productId: number; qty: number }[]>(),
    checkedOut: type<{ lines: SoldLine[]; total: number }>(),
  },
});
// type: '[Cart] checkedOut'`;

  protected readonly component = `export class ProductsPanel {
  protected readonly stock = inject(StockStore);                      // read only
  protected readonly dispatch = injectDispatch(productsPageEvents);
}

<app-product-list [products]="stock.entities()"
                  (reserve)="dispatch.addToCartClicked($event)" />`;

  protected readonly store = `export const CartStore = signalStore(
  { providedIn: 'root' },
  withEntities(lineConfig),
  withComputed(…count, total…),
  withReducer(
    on(productsEvents.reserved, ({ payload }, state) =>
      state.entityMap[payload.id] ? updateEntity(…) : addEntity(…)),
    on(cartEvents.checkedOut, () => removeAllEntities()),
  ),
  withEventHandlers((store, events = inject(Events)) => ({
    checkout$: events.on(cartPageEvents.checkoutClicked).pipe(
      filter(() => store.count() > 0),
      map(() => cartEvents.checkedOut({ lines: store.entities(), total: store.total() })),
    ),
  })),
);`;
}
