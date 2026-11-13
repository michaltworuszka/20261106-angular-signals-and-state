import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY = 'live-theory:draft';

@Component({
  selector: 'app-c10-signal-effect',
  imports: [FormsModule],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C10 – signal-effect</header>

    <label class="form-label" for="draft">Szkic wiadomości (autozapis)</label>
    <textarea id="draft" class="form-control mb-2" rows="4" [(ngModel)]="draft"></textarea>
    <div class="d-flex justify-content-between align-items-center">
      <small class="text-body-secondary">Znaków: {{ length() }}</small>
      <button class="btn btn-sm btn-outline-danger" type="button" (click)="draft.set('')">
        Wyczyść
      </button>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>
        Wpisz coś i odśwież stronę (F5) – tekst zostaje. <code>effect()</code> synchronizuje sygnał
        ze <strong>światem zewnętrznym</strong> (tu: <code>localStorage</code>).
      </p>
      <p class="mb-0">
        <code>length</code> to <code>computed()</code> – stan wyliczany. <code>effect()</code> nie
        zwraca wartości i nie powinien ustawiać innych sygnałów.
      </p>
    </blockquote>
  `,
})
export class C10SignalEffect {
  // SSR: no localStorage on the server → touch it only in the browser.
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly draft = signal(
    this.#isBrowser ? (localStorage.getItem(STORAGE_KEY) ?? '') : '',
  );
  // Derived state → computed, not effect.
  protected readonly length = computed(() => this.draft().length);

  constructor() {
    if (this.#isBrowser) {
      // Side effect: runs on init and whenever draft() changes.
      effect(() => localStorage.setItem(STORAGE_KEY, this.draft()));
    }
  }
}
