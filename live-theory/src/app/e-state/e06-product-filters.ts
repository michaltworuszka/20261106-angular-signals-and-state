import { computed, Service } from '@angular/core';
import { PartialStateUpdater, patchState, signalState } from '@ngrx/signals';

export type Category = 'all' | 'owoce' | 'nabiał';
export type SortBy = 'name' | 'price';

export interface FilterProduct {
  id: number;
  name: string;
  price: number;
  category: Exclude<Category, 'all'>;
}

interface FiltersState {
  query: string;
  category: Category;
  sort: { by: SortBy; dir: 'asc' | 'desc' };
}

const PRODUCTS: FilterProduct[] = [
  { id: 1, name: 'Jabłko', price: 2.5, category: 'owoce' },
  { id: 2, name: 'Banan', price: 4.2, category: 'owoce' },
  { id: 3, name: 'Mleko', price: 3.6, category: 'nabiał' },
  { id: 4, name: 'Ser żółty', price: 29.9, category: 'nabiał' },
  { id: 5, name: 'Gruszka', price: 3.1, category: 'owoce' },
];

const initialState: FiltersState = { query: '', category: 'all', sort: { by: 'name', dir: 'asc' } };

/** Reusable, testable updater: a plain function (state) → partial state. */
function toggleSort(by: SortBy): PartialStateUpdater<FiltersState> {
  return (s) => ({
    sort: { by, dir: s.sort.by === by && s.sort.dir === 'asc' ? 'desc' : 'asc' },
  });
}

/**
 * Level 1 of @ngrx/signals: `signalState` inside a plain service.
 * Same idea as E2 (private state, public readonly signals, methods), less boilerplate:
 * - every key – also nested – is already a (deep) signal: `#state.sort.dir()`
 * - `patchState` merges a PARTIAL object – no `{ ...s, sort: { ...s.sort } }` spreading
 */
@Service()
export class ProductFilters {
  readonly #state = signalState<FiltersState>(initialState);

  // Deep signals – readonly, created lazily, no computed() per field.
  readonly query = this.#state.query;
  readonly category = this.#state.category;
  readonly sortBy = this.#state.sort.by;
  readonly sortDir = this.#state.sort.dir;

  /** Whole state for the debug view. Not `this.#state` itself – that one is patchable! */
  readonly snapshot = computed(() => this.#state());

  readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const category = this.category();
    const { by, dir } = this.#state.sort();
    const sign = dir === 'asc' ? 1 : -1;
    return PRODUCTS.filter((p) => category === 'all' || p.category === category)
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => sign * (by === 'name' ? a.name.localeCompare(b.name) : a.price - b.price));
  });

  setQuery(query: string): void {
    patchState(this.#state, { query }); // partial: category + sort untouched
  }

  setCategory(category: Category): void {
    patchState(this.#state, { category });
  }

  sort(by: SortBy): void {
    patchState(this.#state, toggleSort(by));
  }

  reset(): void {
    patchState(this.#state, initialState);
  }
}
