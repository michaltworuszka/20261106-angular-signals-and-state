import { TestBed } from '@angular/core/testing';
import { C08SignalLinkedPrevious } from './c08-signal-linked-previous';

describe('C08SignalLinkedPrevious', () => {
  describe('when the product list changes', () => {
    it('keeps the selection while it is listed, else falls back to the first, and keeps it by id after refetch', async () => {
      // given
      const fixture = TestBed.createComponent(C08SignalLinkedPrevious);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const click = async (text: string) => {
        [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!.click();
        await fixture.whenStable();
      };
      const details = () => el.querySelector('.card-body h6')?.textContent?.trim();
      const price = () => el.querySelector('.card-body .fs-5')?.textContent?.trim();
      expect(details()).toBe('Klawiatura'); // first computation: list[0]

      // when – filter still contains the manual selection
      await click('Mysz'); // manual set()
      await click('peryferia');
      // then
      expect(details()).toBe('Mysz'); // still visible → kept

      // when – filter removes it
      await click('monitory');
      // then
      expect(details()).toBe('Monitor 24"'); // gone → first

      // when – refetch returns fresh objects
      await click('wszystkie');
      await click('Monitor 27"');
      const before = price();
      let after = before;
      for (let i = 0; i < 20 && after === before; i++) {
        await click('odśwież');
        after = price();
      }
      // then
      expect(details()).toBe('Monitor 27"'); // kept by id
      expect(after).not.toBe(before); // fresh object → new price
    });
  });
});
