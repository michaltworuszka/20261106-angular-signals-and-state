import { Component, effect, signal, untracked, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

const MAX_LOG_LINES = 8;

@Component({
  selector: 'app-c12-signal-effect-anti-pattern-2',
  imports: [FormsModule],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      C12 – signal-effect – antywzorzec #2
    </header>

    <div class="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-4">
      <button class="btn btn-warning" type="button" (click)="updateCount(-1)">-</button>
      <code class="fs-4">{{ count() }}</code>
      <button class="btn btn-success" type="button" (click)="updateCount(1)">+</button>
      <select class="form-select w-auto ms-3" aria-label="Użytkownik" [(ngModel)]="user">
        <option>Ania</option>
        <option>Bartek</option>
        <option>Celina</option>
      </select>
      <button class="btn btn-outline-secondary" type="button" (click)="clearLogs()">
        Wyczyść logi
      </button>
    </div>

    <p>
      Cel: wyślij zdarzenie analityczne, gdy zmieni się <code>count</code>. Nazwa
      <code>user</code> to tylko kontekst. Zmień użytkownika i porównaj logi.
    </p>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">❌ ukryta zależność</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ badCode }}</code></pre>
            <ol class="list-group list-group-numbered small">
              @for (line of badLog(); track $index) {
                <li class="list-group-item">{{ line }}</li>
              }
            </ol>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-success h-100">
          <div class="card-header text-bg-success">✅ untracked()</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ goodCode }}</code></pre>
            <ol class="list-group list-group-numbered small">
              @for (line of goodLog(); track $index) {
                <li class="list-group-item">{{ line }}</li>
              }
            </ol>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>
        Każdy sygnał <strong>odczytany</strong> w <code>effect()</code> staje się jego zależnością –
        także ten czytany „przy okazji”. Zmiana <code>user</code> uruchamia effect ponownie i wysyła
        fałszywe zdarzenie „count changed”.
      </p>
      <p class="mb-0">
        Poprawnie: czytaj <em>wyzwalacz</em> normalnie, a resztę w <code>untracked()</code>. Effect
        zależy tylko od tego, od czego powinien.
      </p>
    </blockquote>
  `,
})
export class C12SignalEffectAntiPattern2 {
  protected readonly count = signal(0);
  protected readonly user = signal('Ania');

  // Demo only: logs rendered on screen. Real app: analytics/console – not app state.
  protected readonly badLog = signal<string[]>([]);
  protected readonly goodLog = signal<string[]>([]);

  protected readonly badCode = `effect(() => {
  track(\`\${this.user()}: count=\${this.count()}\`);
});`;
  protected readonly goodCode = `effect(() => {
  const count = this.count(); // trigger
  untracked(() => track(\`\${this.user()}: count=\${count}\`));
});`;

  constructor() {
    // ❌ Reads user() too → re-runs on user change.
    effect(() => {
      this.#track(this.badLog, `${this.user()}: count=${this.count()}`);
    });

    // ✅ Only count() is tracked; user() read without dependency.
    effect(() => {
      const count = this.count();
      untracked(() => this.#track(this.goodLog, `${this.user()}: count=${count}`));
    });
  }

  protected updateCount(value: number): void {
    this.count.update((c) => c + value);
  }

  protected clearLogs(): void {
    this.badLog.set([]);
    this.goodLog.set([]);
  }

  // update() does not track the log signal → no self-dependency.
  #track(log: WritableSignal<string[]>, line: string): void {
    log.update((lines) => [...lines, line].slice(-MAX_LOG_LINES));
  }
}
