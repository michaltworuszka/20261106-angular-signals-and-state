import { TestBed } from '@angular/core/testing';
import { D08SignalFormsValidators } from './d08-signal-forms-validators';

describe('D08SignalFormsValidators', () => {
  describe('when the password changes after a matching confirm', () => {
    it('re-validates confirm and shows the mismatch error', async () => {
      // given
      const fixture = TestBed.createComponent(D08SignalFormsValidators);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const type = (id: string, value: string) => {
        const input = el.querySelector<HTMLInputElement>('#' + id)!;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
      };
      const errors = () => [...el.querySelectorAll('.invalid-feedback')].map((e) => e.textContent);
      type('password', 'haslo1234');
      type('confirm', 'haslo1234');
      await fixture.whenStable();
      expect(errors()).not.toContain('Hasła się różnią');

      // when
      type('password', 'inne12345');
      await fixture.whenStable();

      // then
      expect(errors()).toContain('Hasła się różnią');
    });
  });
});
