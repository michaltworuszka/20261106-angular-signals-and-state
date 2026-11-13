import { Component, effect, EffectRef, inject, Injector, signal, untracked } from '@angular/core';

/** Fuse for the demo – without it the tab freezes (Angular does not detect this loop). */
const MAX_RUNS = 50;

@Component({
  selector: 'app-c13-signal-effect-anti-pattern-3',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      C13 – signal-effect – antywzorzec #3
    </header>

    <div class="d-flex justify-content-center align-items-center gap-2 mb-4">
      <button class="btn btn-warning" type="button" (click)="updateCount(-1)">-</button>
      <code class="fs-4">{{ count() }}</code>
      <button class="btn btn-success" type="button" (click)="updateCount(1)">+</button>
    </div>

    <p>Cel: zapisuj historię zmian <code>count</code> w sygnale <code>history</code>.</p>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">❌ odczyt + zapis tego samego sygnału</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ badCode }}</code></pre>
            <button class="btn btn-sm btn-danger mb-3" type="button" (click)="startBadEffect()">
              ▶ Uruchom (z bezpiecznikiem {{ maxRuns }}×)
            </button>
            @if (badRuns() > 0) {
              <div class="alert alert-danger mb-2 py-2">
                effect wykonał się <strong>{{ badRuns() }}×</strong> po jednym kliknięciu
                @if (fuseTripped()) {
                  – bezpiecznik zatrzymał pętlę 🔥
                }
              </div>
              <small class="text-body-secondary">
                history.length = {{ badHistory().length }}
              </small>
            }
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-success h-100">
          <div class="card-header text-bg-success">✅ update() – bez śledzenia history</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ goodCode }}</code></pre>
            <small class="text-body-secondary">history:</small>
            <code class="d-block">[{{ goodHistory().join(', ') }}]</code>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>
        <code>this.history()</code> wewnątrz effect = zależność. Effect zapisuje
        <code>history</code> → zależność się zmieniła → effect uruchamia się ponownie → …
        <strong>nieskończona pętla</strong>. Angular jej nie wykrywa – karta po prostu się zawiesza.
      </p>
      <p>
        Poprawnie: <code>update(fn)</code> czyta bieżącą wartość <em>bez śledzenia</em> (albo
        <code>untracked(() =&gt; this.history())</code>). Effect zależy tylko od <code>count</code>.
      </p>
      <p class="mb-0">
        Jeszcze lepiej: dopisz do historii tam, gdzie zmieniasz <code>count</code> (w metodzie /
        handlerze) – wtedy effect w ogóle nie jest potrzebny.
      </p>
    </blockquote>
  `,
})
export class C13SignalEffectAntiPattern3 {
  readonly #injector = inject(Injector);
  #badEffect?: EffectRef;

  protected readonly maxRuns = MAX_RUNS;
  protected readonly count = signal(0);

  protected readonly badHistory = signal<number[]>([]);
  protected readonly badRuns = signal(0);
  protected readonly fuseTripped = signal(false);

  protected readonly goodHistory = signal<number[]>([]);

  protected readonly badCode = `effect(() => {
  this.history.set([...this.history(), this.count()]);
});`;
  protected readonly goodCode = `effect(() => {
  const count = this.count();
  this.history.update((h) => [...h, count]);
});`;

  constructor() {
    // ✅ Tracks only count(); update() reads history without dependency.
    effect(() => {
      const count = this.count();
      this.goodHistory.update((h) => [...h, count].slice(-15));
    });
  }

  /** ❌ Created on demand (not in constructor), so the page itself never freezes. */
  protected startBadEffect(): void {
    this.#badEffect?.destroy();
    this.badHistory.set([]);
    this.badRuns.set(0);
    this.fuseTripped.set(false);

    let runs = 0;
    this.#badEffect = effect(
      () => {
        // Fuse – NOT part of the anti-pattern, only keeps the demo alive.
        if (++runs > MAX_RUNS) {
          this.#badEffect?.destroy();
          untracked(() => this.fuseTripped.set(true));
          return;
        }
        this.badRuns.set(runs);
        // ❌ The anti-pattern: read + write the same signal.
        this.badHistory.set([...this.badHistory(), this.count()]);
      },
      { injector: this.#injector },
    );
  }

  protected updateCount(value: number): void {
    this.count.update((c) => c + value);
  }
}
