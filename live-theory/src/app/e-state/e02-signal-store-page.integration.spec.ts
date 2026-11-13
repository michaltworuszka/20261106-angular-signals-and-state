import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E02SignalStorePage } from './e02-signal-store-page';

// Integration test – the same component as e02-signal-store-page.spec.ts,
// but with the REAL CartStore and real child components (nothing mocked).

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

describe('E02SignalStorePage (integration: real CartStore + children)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(E02SignalStorePage); // nothing mocked
    await fixture.whenStable();
    return dom(fixture);
  }

  describe('when products are added and a valid coupon applied', () => {
    it('updates lines, badge and the discounted total', async () => {
      // given
      const { addButton, click, typeCoupon, applyButton, cartLines, badge, el } = await setup();

      // when
      await click(addButton('Jabłko'));
      await click(addButton('Jabłko'));
      await click(addButton('Ser żółty'));
      await typeCoupon('signals10');
      await click(applyButton());

      // then – 2 × 2.50 + 29.90 = 34.90 → −10% = 31.41
      expect(cartLines()).toHaveLength(2);
      expect(badge()).toContain('3');
      expect(el.textContent).toContain('Rabat SIGNALS10');
      expect(el.textContent).toContain('31.41 zł');
      expect(el.textContent).not.toContain('Nieznany kupon');
    });
  });

  describe('when the quantity of the only line drops to zero', () => {
    it('removes the line and shows the empty cart', async () => {
      // given
      const { addButton, click, cartLines, el } = await setup();
      await click(addButton('Mleko'));

      // when
      const minus = [...el.querySelectorAll<HTMLButtonElement>('app-cart-lines button')].find(
        (b) => b.textContent?.trim() === '−',
      )!;
      await click(minus);

      // then
      expect(cartLines()).toEqual(['koszyk pusty']);
    });
  });
});
