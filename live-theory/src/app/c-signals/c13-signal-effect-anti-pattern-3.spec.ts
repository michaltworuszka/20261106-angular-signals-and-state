import { TestBed } from '@angular/core/testing';
import { C13SignalEffectAntiPattern3 } from './c13-signal-effect-anti-pattern-3';

describe('C13SignalEffectAntiPattern3', () => {
  describe('when the effects run', () => {
    it('logs once per change with the good effect; the bad one loops until the fuse trips', async () => {
      // given
      const fixture = TestBed.createComponent(C13SignalEffectAntiPattern3);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const [, plus, run] = el.querySelectorAll<HTMLButtonElement>('button');

      // when – counter changes
      plus.click();
      await fixture.whenStable();
      // then
      expect(el.textContent).toContain('[0, 1]'); // ✅ one entry per change

      // when – the bad effect is started
      run.click(); // ❌ one click…
      await fixture.whenStable();
      // then
      expect(el.textContent).toContain('50×'); // …50 runs, then fuse
      expect(el.textContent).toContain('bezpiecznik zatrzymał pętlę');
    });
  });
});
