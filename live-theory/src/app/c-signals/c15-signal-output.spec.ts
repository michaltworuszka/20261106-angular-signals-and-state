import { TestBed } from '@angular/core/testing';
import { C15SignalOutput } from './c15-signal-output';

describe('C15SignalOutput', () => {
  describe('when a child stepper emits', () => {
    it('updates the parent state, which flows back to the child via input()', async () => {
      // given
      const fixture = TestBed.createComponent(C15SignalOutput);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const rows = () => [...el.querySelectorAll('app-quantity-stepper')];
      const qty = (row: Element) => row.querySelector('code')?.textContent?.trim();
      const btn = (row: Element, text: string) =>
        [...row.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!;

      // when – quantityChange
      btn(rows()[0], '+').click();
      await fixture.whenStable();
      // then
      expect(qty(rows()[0])).toBe('2');
      expect(el.textContent).toContain('quantityChange(2) ← #1');

      // when – removed
      btn(rows()[1], 'usuń').click();
      await fixture.whenStable();
      // then
      expect(rows().length).toBe(1);
      expect(el.textContent).toContain('removed() ← #2');
    });
  });
});
