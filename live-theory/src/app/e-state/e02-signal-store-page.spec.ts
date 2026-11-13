import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartLine, CartStore } from './cart-store';
import { E02SignalStorePage } from './e02-signal-store-page';

// Component test with a MOCKED store – tests the component only: rendering + wiring.
// Same component, real store + children → e02-signal-store-page.integration.spec.ts

/** Small DOM helpers (same in e02-signal-store-page[.integration].spec.ts). */
function dom(fixture: ComponentFixture<E02SignalStorePage>) {
  const el = fixture.nativeElement as HTMLElement;
  const click = async (button: HTMLButtonElement) => {
    button.click();
    await fixture.whenStable();
  };
  return {
    fixture,
    el,
    click,
    /** "+" of a catalog card, found by product name. */
    addButton: (name: string) =>
      [...el.querySelectorAll('app-catalog-grid .card')]
        .find((card) => card.textContent?.includes(name))!
        .querySelector('button')!,
    cartLines: () =>
      [...el.querySelectorAll('app-cart-lines li')].map((li) => li.textContent?.trim()),
    badge: () => el.querySelector('app-cart-badge')?.textContent?.trim(),
    typeCoupon: async (code: string) => {
      const input = el.querySelector<HTMLInputElement>('input[aria-label="Kupon"]')!;
      input.value = code;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    },
    applyButton: () =>
      [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('Użyj'))!,
  };
}

/**
 * Hand-written fake: plain writable signals (state we control) + vi.fn() (calls we verify).
 * `satisfies` = compile error when CartStore gets a new public member the mock doesn't cover.
 */
function createCartStoreMock() {
  return {
    lines: signal<CartLine[]>([]),
    coupon: signal<string | null>(null),
    count: signal(0),
    subtotal: signal(0),
    discount: signal(0),
    total: signal(0),
    isEmpty: signal(true),
    add: vi.fn<CartStore['add']>(),
    changeQty: vi.fn<CartStore['changeQty']>(),
    applyCoupon: vi.fn<CartStore['applyCoupon']>(() => true),
    clear: vi.fn<CartStore['clear']>(),
  } satisfies Record<keyof CartStore, unknown>;
}

describe('E02SignalStorePage (mocked CartStore)', () => {
  let store: ReturnType<typeof createCartStoreMock>;

  async function setup() {
    store = createCartStoreMock();
    TestBed.configureTestingModule({
      // Root-provided store → replace it for the whole test injector (page + badge get the mock).
      providers: [{ provide: CartStore, useValue: store }],
    });
    const fixture = TestBed.createComponent(E02SignalStorePage);
    await fixture.whenStable();
    return dom(fixture);
  }

  describe('when "+" is clicked on a product', () => {
    it('asks the store to add that product', async () => {
      // given
      const { addButton, click } = await setup();

      // when
      await click(addButton('Banan'));

      // then
      expect(store.add).toHaveBeenCalledExactlyOnceWith({ id: 2, name: 'Banan', price: 4.2 });
    });
  });

  describe('when the store already holds lines', () => {
    it('renders the lines, the badge and the total from store signals', async () => {
      // given
      const { fixture, cartLines, badge, el } = await setup();

      // when – any state in one step, no clicking through the UI
      store.lines.set([{ item: { id: 4, name: 'Ser żółty', price: 29.9 }, qty: 2 }]);
      store.count.set(2);
      store.total.set(59.8);
      store.isEmpty.set(false);
      await fixture.whenStable();

      // then
      expect(cartLines()[0]).toContain('Ser żółty');
      expect(badge()).toContain('2');
      expect(el.textContent).toContain('59.80 zł');
    });
  });

  describe('when the store rejects the coupon', () => {
    it('shows "Nieznany kupon"', async () => {
      // given – force the error branch
      const { typeCoupon, click, applyButton, el } = await setup();
      store.applyCoupon.mockReturnValue(false);

      // when
      await typeCoupon('XYZ');
      await click(applyButton());

      // then
      expect(store.applyCoupon).toHaveBeenCalledWith('XYZ');
      expect(el.textContent).toContain('Nieznany kupon');
    });
  });
});
