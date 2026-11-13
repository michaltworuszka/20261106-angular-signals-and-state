import { TestBed } from '@angular/core/testing';
import { C12SignalEffectAntiPattern2 } from './c12-signal-effect-anti-pattern-2';

describe('C12SignalEffectAntiPattern2', () => {
  describe('when only the user changes', () => {
    it('re-runs the effect without untracked() and skips the one with it', async () => {
      // given
      const fixture = TestBed.createComponent(C12SignalEffectAntiPattern2);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const logLines = () =>
        [...el.querySelectorAll('ol')].map((ol) => ol.querySelectorAll('li').length);
      expect(logLines()).toEqual([1, 1]); // initial run of both effects

      // when
      const select = el.querySelector('select')!;
      select.value = 'Bartek';
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();

      // then
      expect(logLines()).toEqual([2, 1]); // ❌ fired, ✅ not

      // when – the tracked counter changes
      el.querySelectorAll<HTMLButtonElement>('button')[1].click(); // +
      await fixture.whenStable();

      // then – both re-run
      expect(logLines()).toEqual([3, 2]);
    });
  });
});
