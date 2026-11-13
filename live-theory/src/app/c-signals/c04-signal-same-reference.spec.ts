import { TestBed } from '@angular/core/testing';
import { C04SignalSameReference } from './c04-signal-same-reference';

describe('C04SignalSameReference', () => {
  describe('when the array is mutated and set() with the same reference', () => {
    it('leaves computed stale until update() sets a new array', async () => {
      // given
      const fixture = TestBed.createComponent(C04SignalSameReference);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const [bad, good] = el.querySelectorAll<HTMLButtonElement>('button');
      const values = () => [...el.querySelectorAll('td code')].map((c) => c.textContent?.trim());
      expect(values()).toEqual(['30', '30']);

      // when – mutate + set(same ref)
      bad.click();
      await fixture.whenStable();

      // then
      expect(values()).toEqual(['31', '30']); // direct read sees mutation, computed stale
      expect(el.querySelector('.alert-danger')).not.toBeNull();

      // when – update() with a new array
      good.click();
      await fixture.whenStable();

      // then
      expect(values()).toEqual(['32', '32']);
      expect(el.querySelector('.alert-danger')).toBeNull();
    });
  });
});
