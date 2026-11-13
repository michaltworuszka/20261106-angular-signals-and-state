import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';

/** ❌ Plain field mutated by a timer – zoneless Angular does not know it changed. */
@Component({
  selector: 'app-plain-ticker',
  template: `
    <div class="card border-danger h-100">
      <div class="card-header">❌ zwykłe pole <code>ticks++</code></div>
      <div class="card-body">
        <p class="display-6 mb-2">{{ ticks }}</p>
        <button class="btn btn-sm btn-outline-danger" type="button" (click)="refresh()">
          kliknij – wymuś odświeżenie
        </button>
      </div>
    </div>
  `,
})
export class PlainTicker {
  protected ticks = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // afterNextRender: browser only (no timers during SSR / prerender).
    afterNextRender(() => {
      const id = setInterval(() => this.ticks++, 1000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  protected refresh(): void {
    // Nothing to do: any template event marks the view dirty → re-render shows the real value.
  }
}

/** ✅ Same timer, but the state lives in a signal. */
@Component({
  selector: 'app-signal-ticker',
  template: `
    <div class="card border-success h-100">
      <div class="card-header">✅ <code>ticks.update(n =&gt; n + 1)</code></div>
      <div class="card-body">
        <p class="display-6 mb-2">{{ ticks() }}</p>
        <small class="text-body-secondary">odświeża się samo – sygnał planuje render</small>
      </div>
    </div>
  `,
})
export class SignalTicker {
  protected readonly ticks = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const id = setInterval(() => this.ticks.update((n) => n + 1), 1000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }
}

@Component({
  selector: 'app-e01-state-in-component',
  imports: [PlainTicker, SignalTicker],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E01 – state-in-component</header>

    <h2 class="h6">1. Przełącznik – stan UI, który zna tylko ten komponent</h2>
    <div class="card mb-4">
      <div class="card-body">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="details-switch"
            [checked]="showDetails()"
            (change)="toggleDetails()"
          />
          <label class="form-check-label" for="details-switch">
            Szczegóły: {{ showDetails() ? 'widoczne' : 'ukryte' }}
          </label>
        </div>
        @if (showDetails()) {
          <p class="small mt-2 mb-0">
            <code>showDetails</code> żyje tylko tutaj. Nikt poza tym komponentem go nie potrzebuje,
            więc nie ma powodu wynosić go do serwisu.
          </p>
        }
      </div>
    </div>

    <h2 class="h6">2. Stoper – stan zmieniany w czasie (<code>setInterval</code>)</h2>
    <div class="card mb-4">
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <span class="display-6 font-monospace">{{ display() }}</span>
        <div class="btn-group">
          <button class="btn btn-primary" type="button" (click)="toggle()">
            {{ running() ? 'Pauza' : 'Start' }}
          </button>
          <button
            class="btn btn-outline-primary"
            type="button"
            [disabled]="!running()"
            (click)="lap()"
          >
            Okrążenie
          </button>
          <button class="btn btn-outline-secondary" type="button" (click)="reset()">Reset</button>
        </div>
        <ol class="mb-0 small font-monospace">
          @for (l of laps(); track $index) {
            <li>{{ l }}</li>
          }
        </ol>
      </div>
    </div>

    <h2 class="h6">3. Dlaczego sygnał? (zoneless)</h2>
    <div class="row g-3">
      <div class="col-md-6"><app-plain-ticker /></div>
      <div class="col-md-6"><app-signal-ticker /></div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 1: stan lokalny = sygnały w komponencie</p>
      <p>
        Komponent jest <strong>właścicielem</strong> swojego stanu: <code>signal()</code> na fakty
        (<code>running</code>, <code>elapsedMs</code>, <code>laps</code>), a
        <code>computed()</code> na to, co z nich wynika (<code>display</code>). Timer, klik czy
        odpowiedź HTTP to tylko <strong>źródło zmiany</strong>. Zmiana zawsze idzie przez
        <code>set</code> / <code>update</code>.
      </p>
      <ul>
        <li>
          <strong>Zoneless:</strong> nie ma zone.js, który „zgadywałby” po każdym
          <code>setInterval</code>, że coś się zmieniło. Odświeżenie planuje zapis do sygnału.
          Zwykłe pole zmienia się „po cichu” (lewa karta) i widać je dopiero po innym zdarzeniu
          (klik).
        </li>
        <li>
          <strong>Stan UI</strong> (rozwinięte / zwinięte, wybrana zakładka, tryb edycji) to
          klasyczny stan lokalny. Nie wkładaj go do store'a.
        </li>
        <li>
          <strong>Sprzątanie:</strong> timer musi zginąć razem z komponentem →
          <code>DestroyRef.onDestroy</code>. Przy SSR timery uruchamiaj w
          <code>afterNextRender</code> (tylko przeglądarka).
        </li>
        <li>
          <strong>Kiedy to wystarczy?</strong> Gdy stan potrzebuje <em>tylko ten komponent</em> (i
          jego dzieci przez <code>input()</code>). Wybieraj <strong>najwęższy</strong> zakres. Gdy
          potrzebuje go ktoś dalej → E2 / E3.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E01StateInComponent {
  readonly #destroyRef = inject(DestroyRef);

  // --- 2. Stopwatch -------------------------------------------------------
  protected readonly running = signal(false);
  protected readonly elapsedMs = signal(0);
  protected readonly laps = signal<string[]>([]);
  protected readonly display = computed(() => format(this.elapsedMs()));
  #interval?: ReturnType<typeof setInterval>;

  protected toggle(): void {
    if (this.running()) {
      clearInterval(this.#interval);
    } else {
      this.#interval = setInterval(() => this.elapsedMs.update((ms) => ms + 100), 100);
    }
    this.running.update((r) => !r);
  }

  protected lap(): void {
    // Immutable: new array, no push().
    this.laps.update((laps) => [...laps, this.display()]);
  }

  protected reset(): void {
    clearInterval(this.#interval);
    this.running.set(false);
    this.elapsedMs.set(0);
    this.laps.set([]);
  }

  // --- 1. UI toggle ----------------------------------------------------------
  protected readonly showDetails = signal(false);

  protected toggleDetails(): void {
    this.showDetails.update((v) => !v);
  }

  constructor() {
    this.#destroyRef.onDestroy(() => clearInterval(this.#interval));
  }

  protected readonly code = `showDetails = signal(false);                               // UI-only state
toggleDetails() { this.showDetails.update((v) => !v); }

running   = signal(false);
elapsedMs = signal(0);
display   = computed(() => format(this.elapsedMs()));    // derived

toggle() {
  this.#interval = setInterval(() => this.elapsedMs.update((ms) => ms + 100), 100);
}

ticks = 0; setInterval(() => this.ticks++, 1000);          // ❌ zoneless: view not refreshed`;
}

function format(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`;
}
