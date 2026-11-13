import { TestBed } from '@angular/core/testing';
import { C09SignalLinkedAntiPattern } from './c09-signal-linked-anti-pattern';

describe('C09SignalLinkedAntiPattern', () => {
  describe('when polling refreshes the server data during an edit', () => {
    it('wipes the naive draft but keeps the dirty one; save and discard make it clean', async () => {
      // given
      const fixture = TestBed.createComponent(C09SignalLinkedAntiPattern);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const bad = el.querySelector<HTMLInputElement>('#bad-name')!;
      const good = el.querySelector<HTMLInputElement>('#good-name')!;
      const click = async (text: string) => {
        [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!.click();
        await fixture.whenStable();
      };
      const type = async (input: HTMLInputElement, value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
      };
      await type(bad, 'Klawiatura PRO');
      await type(good, 'Klawiatura PRO');

      // when
      await click('odświeżenie'); // only stock changes, name stays the same

      // then
      expect(bad.value).toBe('Klawiatura'); // ❌ edit lost
      expect(good.value).toBe('Klawiatura PRO'); // ✅ kept

      // when – save
      await click('zapisz');
      // then
      expect(el.textContent).toContain('serwer: Klawiatura PRO');
      expect(el.querySelector('.badge')).toBeNull();

      // when – edit + discard
      await type(good, 'X');
      await click('odrzuć');
      // then
      expect(good.value).toBe('Klawiatura PRO');
    });
  });
});
