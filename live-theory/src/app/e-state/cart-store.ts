import { computed, Service, signal } from '@angular/core';

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
}

export interface CartLine {
  item: CatalogItem;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  coupon: string | null;
}

const COUPONS: Record<string, number> = { SIGNALS10: 0.1, ANGULAR22: 0.22 };

/**
 * Signal store = plain service:
 * private writable state → public readonly signals + computed → methods (the only way to change).
 *
 * `@Service()` – auto-provided in root (one instance for the whole app), like
 * `@Injectable({ providedIn: 'root' })`.
 */
@Service()
export class CartStore {
  // One private source of truth (could also be several signals).
  readonly #state = signal<CartState>({ lines: [], coupon: null });

  // --- read: selectors -----------------------------------------------------
  readonly lines = computed(() => this.#state().lines);
  readonly coupon = computed(() => this.#state().coupon);
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.item.price * l.qty, 0));
  readonly discount = computed(() => this.subtotal() * (COUPONS[this.coupon() ?? ''] ?? 0));
  readonly total = computed(() => this.subtotal() - this.discount());
  readonly isEmpty = computed(() => this.lines().length === 0);

  // --- write: methods (intent-named, immutable updates) --------------------
  add(item: CatalogItem): void {
    this.#state.update((s) => {
      const existing = s.lines.find((l) => l.item.id === item.id);
      const lines = existing
        ? s.lines.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
        : [...s.lines, { item, qty: 1 }];
      return { ...s, lines };
    });
  }

  changeQty(id: number, delta: number): void {
    this.#state.update((s) => ({
      ...s,
      lines: s.lines
        .map((l) => (l.item.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    }));
  }

  /** Returns false for unknown code – the component decides how to show it. */
  applyCoupon(code: string): boolean {
    const normalized = code.trim().toUpperCase();
    if (!(normalized in COUPONS)) {
      return false;
    }
    this.#state.update((s) => ({ ...s, coupon: normalized }));
    return true;
  }

  clear(): void {
    this.#state.set({ lines: [], coupon: null });
  }
}
