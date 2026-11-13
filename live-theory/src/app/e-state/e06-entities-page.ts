import { Component } from '@angular/core';
import { Shop } from './e06-entities/shop';

@Component({
  selector: 'app-e06-entities-page',
  imports: [Shop],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E06 – ngrx-entities</header>

    <p class="lead">
      E5 jeszcze raz: te same domeny, ten sam <code>EventBus</code>, te same reguły Sheriff.
      Zmieniają się tylko store'y: <code>signalStore</code> + <code>withEntities</code> zamiast
      serwisu z tablicą.
    </p>

    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa tak samo jak E5</span>
        <code class="small">src/app/e-state/e06-entities/</code>
      </div>
      <div class="card-body"><app-e06-entities-shop /></div>
    </div>

    <h2 class="h6">1. Co daje <code>withEntities</code></h2>
    <pre class="small"><code>{{ shape }}</code></pre>

    <h2 class="h6 mt-3">2. E5 vs E6 – ten sam koszyk</h2>
    <div class="row g-3">
      <div class="col-lg-6">
        <p class="small fw-semibold mb-1">E5 – tablica + <code>map</code> / <code>filter</code></p>
        <pre class="small h-100"><code>{{ arrayCode }}</code></pre>
      </div>
      <div class="col-lg-6">
        <p class="small fw-semibold mb-1">E6 – encje + updatery</p>
        <pre class="small h-100"><code>{{ entityCode }}</code></pre>
      </div>
    </div>

    <h2 class="h6 mt-4">3. Klucz inny niż <code>id</code> → <code>entityConfig</code></h2>
    <pre class="small"><code>{{ configCode }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Encje = znormalizowana kolekcja</p>
      <ul class="mb-0">
        <li>
          <strong>Stan = <code>ids</code> + <code>entityMap</code></strong
          >. Lista <code>entities()</code> to <code>computed</code> z nich. Odczyt po kluczu:
          <code>entityMap()[id]</code> (O(1)) zamiast <code>find()</code>.
        </li>
        <li>
          <strong>Gotowe updatery</strong> (<code>addEntity</code>, <code>updateEntity</code>,
          <code>removeEntity</code>, <code>prependEntity</code>, <code>upsertEntity</code>,
          <code>setAllEntities</code>…) zamiast ręcznego <code>map</code>/<code>filter</code>.
          Niemutowalnie i bez pomyłek. <code>patchState</code> przyjmuje kilka naraz.
        </li>
        <li>
          <strong>Kiedy?</strong> Kolekcje aktualizowane po id (koszyk, lista zadań, tabela z
          edycją), dzielone przez kilka widoków. Mała lista tylko do wyświetlenia → zwykła tablica.
        </li>
        <li>
          <strong>Kilka kolekcji w jednym store:</strong>
          <code>entityConfig(&#123; …, collection: 'line' &#125;)</code> →
          <code>lineEntities</code>, <code>lineEntityMap</code>, <code>lineIds</code>.
        </li>
        <li>
          <strong>Komunikacja bez zmian</strong> – domeny dalej znają tylko
          <code>shared/events</code>. Subskrypcje: <code>rxMethod</code> w <code>onInit</code>.
          Następny krok: zamiast własnego busa – NgRx Events.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E06EntitiesPage {
  protected readonly shape = `withEntities<Product>()
  state:   ids: EntityId[]                 [1, 2, 3]
           entityMap: Record<id, Product>  { 1: {…}, 2: {…}, 3: {…} }
  props:   entities: Signal<Product[]>     computed from ids + entityMap`;

  protected readonly arrayCode = `readonly #lines = signal<CartLine[]>([]);

#add({ id, name, price }: ProductRef) {
  this.#lines.update((lines) =>
    lines.some((l) => l.productId === id)
      ? lines.map((l) =>
          l.productId === id ? { ...l, qty: l.qty + 1 } : l)
      : [...lines, { productId: id, name, price, qty: 1 }],
  );
}

remove(productId: number) {
  const line = this.#lines().find((l) => l.productId === productId);
  this.#lines.update((lines) => lines.filter((l) => l !== line));
}`;

  protected readonly entityCode = `withEntities(lineConfig),

_add: rxMethod<ProductRef>(tap(({ id, name, price }) =>
  patchState(store,
    store.entityMap()[id]
      ? updateEntity({ id, changes: (l) => ({ qty: l.qty + 1 }) }, lineConfig)
      : addEntity({ productId: id, name, price, qty: 1 }, lineConfig),
  ),
)),

remove(productId: number) {
  const line = store.entityMap()[productId];
  patchState(store, removeEntity(productId));
}`;

  protected readonly configCode = `const lineConfig = entityConfig({
  entity: type<CartLine>(),
  selectId: (line) => line.productId,   // CartLine has no 'id'
});

withEntities(lineConfig)                   // pass the same config to every updater`;
}
