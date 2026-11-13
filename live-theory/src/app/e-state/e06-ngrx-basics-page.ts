import { Component, inject } from '@angular/core';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { Category, ProductFilters, SortBy } from './e06-product-filters';

@Component({
  selector: 'app-e06-ngrx-basics-page',
  imports: [DecimalPipe, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E06 – ngrx-basics</header>

    <h2 class="h6">1. <code>signalState</code> w serwisie – filtry listy produktów</h2>
    <div class="row g-3">
      <div class="col-md-7">
        <div class="card">
          <div class="card-body d-flex flex-wrap gap-2">
            <input
              class="form-control form-control-sm w-auto"
              placeholder="Szukaj…"
              aria-label="Szukaj"
              #q
              [value]="filters.query()"
              (input)="filters.setQuery(q.value)"
            />
            <select
              class="form-select form-select-sm w-auto"
              aria-label="Kategoria"
              #cat
              [value]="filters.category()"
              (change)="setCategory(cat.value)"
            >
              @for (c of categories; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
            <div class="btn-group btn-group-sm">
              @for (by of sorts; track by) {
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  [class.active]="filters.sortBy() === by"
                  (click)="filters.sort(by)"
                >
                  {{ by }}
                  @if (filters.sortBy() === by) {
                    {{ filters.sortDir() === 'asc' ? '↑' : '↓' }}
                  }
                </button>
              }
            </div>
            <button
              class="btn btn-sm btn-outline-secondary"
              type="button"
              (click)="filters.reset()"
            >
              Reset
            </button>
          </div>
          <ul class="list-group list-group-flush small">
            @for (p of filters.visible(); track p.id) {
              <li class="list-group-item d-flex justify-content-between">
                {{ p.name }} <span>{{ p.category }} · {{ p.price | number: '1.2-2' }} zł</span>
              </li>
            } @empty {
              <li class="list-group-item text-body-secondary">brak wyników</li>
            }
          </ul>
        </div>
      </div>
      <div class="col-md-5">
        <p class="small fw-semibold mb-1"><code>filters.snapshot()</code></p>
        <pre class="small"><code>{{ filters.snapshot() | json }}</code></pre>
      </div>
    </div>

    <h2 class="h6 mt-4">
      2. Ten sam serwis: <code>signal()</code> (E2) vs <code>signalState()</code>
    </h2>
    <div class="row g-3">
      <div class="col-lg-6">
        <pre class="small h-100"><code>{{ plainCode }}</code></pre>
      </div>
      <div class="col-lg-6">
        <pre class="small h-100"><code>{{ ngrxCode }}</code></pre>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1"><code>&#64;ngrx/signals</code> – najmniejszy krok</p>
      <ul class="mb-0">
        <li>
          <code>pnpm add &#64;ngrx/signals</code>. Bez <code>provideStore</code>, bez akcji, bez
          reducerów. <code>signalState</code> działa w <strong>dowolnym</strong> serwisie lub
          komponencie.
        </li>
        <li>
          <strong>Deep signals:</strong> <code>#state.sort.dir()</code> – każde pole (też
          zagnieżdżone) to sygnał tylko do odczytu. Nie trzeba pisać <code>computed()</code> per
          pole.
        </li>
        <li>
          <strong><code>patchState</code> = częściowy merge</strong> (płytki, na 1. poziomie):
          <code>&#123; query &#125;</code> zostawia resztę stanu. Zamiast obiektu – funkcja
          <code>(state) =&gt; partial</code> (<code>toggleSort</code>): czysta, łatwa do testu i
          ponownego użycia.
        </li>
        <li>
          <strong>Hermetyzacja jak w E2:</strong> <code>#state</code> prywatny. Uwaga:
          <code>signalState</code> można patchować z zewnątrz, więc nie wystawiaj go samego, tylko
          deep signals / <code>computed</code>.
        </li>
        <li>
          Wciąż niemutowalnie: <code>patchState</code> nie klonuje głęboko. Nie mutuj obiektów ze
          stanu (w dev mode NgRx zamraża stan – <code>Object.freeze</code>).
        </li>
        <li>
          Więcej struktury (computed, metody, hooki, DI) w jednym miejscu →
          <code>signalStore</code> (następna strona).
        </li>
      </ul>
    </blockquote>
  `,
})
export class E06NgrxBasicsPage {
  protected readonly filters = inject(ProductFilters);
  protected readonly categories: Category[] = ['all', 'owoce', 'nabiał'];
  protected readonly sorts: SortBy[] = ['name', 'price'];

  protected setCategory(value: string): void {
    // <select> gives a string; options come from `categories`, so the cast is safe.
    this.filters.setCategory(value as Category);
  }

  protected readonly plainCode = `// E2 style – plain signal
readonly #state = signal<FiltersState>(initial);
readonly query  = computed(() => this.#state().query);
readonly sortBy = computed(() => this.#state().sort.by);

setQuery(query: string) {
  this.#state.update((s) => ({ ...s, query }));
}
sort(by: SortBy) {
  this.#state.update((s) => ({
    ...s,
    sort: { ...s.sort, by, dir: … },
  }));
}`;

  protected readonly ngrxCode = `// @ngrx/signals – signalState
readonly #state = signalState<FiltersState>(initial);
readonly query  = this.#state.query;       // deep signal
readonly sortBy = this.#state.sort.by;     // nested too

setQuery(query: string) {
  patchState(this.#state, { query });       // partial merge
}
sort(by: SortBy) {
  patchState(this.#state, toggleSort(by));  // reusable updater
}

const toggleSort = (by): PartialStateUpdater<FiltersState> =>
  (s) => ({ sort: { by, dir: … } });`;
}
