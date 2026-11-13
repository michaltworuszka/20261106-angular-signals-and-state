import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the brand in the navbar', async () => {
    // given
    const fixture = TestBed.createComponent(App);

    // when
    await fixture.whenStable();

    // then
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Angular Live Theory');
  });

  describe('when the menu toggler is clicked', () => {
    it('shows the hidden mobile menu', async () => {
      // given
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      const menu = compiled.querySelector('#app-menu')!;
      expect(menu.classList).toContain('d-none');

      // when
      compiled.querySelector<HTMLButtonElement>('.navbar-toggler')!.click();
      await fixture.whenStable();

      // then
      expect(menu.classList).not.toContain('d-none');
    });
  });
});
