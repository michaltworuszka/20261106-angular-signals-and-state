import { Component, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { Product } from './product';
import { IntervalDemo } from './interval-demo';

@Component({
  selector: 'app-d04-rxjs-interop',
  imports: [FormsModule, DecimalPipe, IntervalDemo],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D04 – rxjs-interop</header>

    <h2 class="h6">
      1. Jeden gorący strumień (<code>interval</code> + <code>share()</code>): <code>async</code> vs
      <code>toSignal()</code>
    </h2>
    <app-interval-demo />
    <pre class="mt-3"><code>{{ intervalCode }}</code></pre>
    <ul class="small mb-4">
      <li>
        <strong>Deklaratywnie:</strong> zero <code>.subscribe()</code> w komponencie. Subskrypcją
        zarządza <code>async</code> (A) albo <code>toSignal()</code> (B).
      </li>
      <li>
        <strong>Bez wycieku:</strong> zniszczenie komponentu → <code>async</code> /
        <code>toSignal</code> (przez <code>DestroyRef</code>) odsubskrybowują się. Gdy znika
        <em>ostatni</em> subskrybent, <code>share()</code> odpina się od źródła i
        <code>interval</code> staje (log: STOP). Wyłącz A i B przełącznikami.
      </li>
      <li>
        <strong>Gorący:</strong> A i B pokazują tę samą liczbę, bo jest <em>jeden</em> interval. Bez
        <code>share()</code> każdy subskrybent dostałby własny timer (2× START). Spóźniony
        subskrybent nie startuje od 0, tylko czeka na następną emisję („–”). Chcesz od razu ostatnią
        wartość → <code>shareReplay(&#123; bufferSize: 1, refCount: true &#125;)</code>.
      </li>
      <li>
        Ręczne <code>.subscribe()</code> w komponencie? Wtedy
        <code>.pipe(takeUntilDestroyed())</code>, inaczej timer żyje po zniszczeniu komponentu.
      </li>
      <li>
        B jest wygodniejsze: sygnał łączy się z <code>computed()</code> i nie trzeba obsługiwać
        <code>null</code> z <code>async</code> w każdym miejscu szablonu.
      </li>
    </ul>

    <h2 class="h6">
      2. Wyszukiwarka: <code>toObservable</code> → debounce → <code>switchMap</code> → sygnał
    </h2>
    <input
      class="form-control mb-2"
      placeholder="Pisz szybko… (np. „marchew”)"
      aria-label="Szukaj"
      [ngModel]="query()"
      (ngModelChange)="onType($event)"
    />
    <div class="d-flex gap-3 small mb-3">
      <span
        >zmiany sygnału: <span class="badge text-bg-secondary">{{ keystrokes() }}</span></span
      >
      <span
        >requesty ① (po debounce + distinct):
        <span class="badge text-bg-primary">{{ requests() }}</span></span
      >
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">① <code>toObservable</code> → RxJS → <code>toSignal</code></div>
          <div class="list-group list-group-flush">
            @for (p of results(); track p.id) {
              <div class="list-group-item d-flex justify-content-between">
                {{ p.name }} <span>{{ p.price | number: '1.2-2' }} zł</span>
              </div>
            } @empty {
              <div class="list-group-item text-body-secondary">brak wyników</div>
            }
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between">
            <span>② <code>rxResource</code> (Observable jako zasób)</span>
            @if (resource.isLoading()) {
              <span class="spinner-border spinner-border-sm"></span>
            }
          </div>
          <div class="list-group list-group-flush">
            @for (p of resource.value(); track p.id) {
              <div class="list-group-item d-flex justify-content-between">
                {{ p.name }} <span>{{ p.price | number: '1.2-2' }} zł</span>
              </div>
            } @empty {
              <div class="list-group-item text-body-secondary">brak wyników</div>
            }
          </div>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">
        Zasada: <strong>RxJS do zdarzeń i czasu</strong>, <strong>sygnały do stanu</strong>
      </p>
      <p>
        Sygnał nie zna czasu: nie ma <code>debounce</code>, <code>throttle</code>,
        <code>retry</code>, łączenia strumieni. RxJS to ma. Most
        <code>&#64;angular/core/rxjs-interop</code> pozwala wejść w RxJS tylko na odcinek, który
        tego wymaga, i wrócić do sygnału, który czyta szablon.
      </p>

      <table class="table table-sm small">
        <thead>
          <tr>
            <th>API</th>
            <th>Kierunek / do czego</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>toSignal(obs$, &#123; initialValue &#125;)</code></td>
            <td>Observable → Signal. Subskrybuje sam, odsubskrybuje przy zniszczeniu.</td>
          </tr>
          <tr>
            <td><code>toObservable(sig)</code></td>
            <td>Signal → Observable (emituje asynchronicznie, przez effect).</td>
          </tr>
          <tr>
            <td><code>rxResource(&#123; params, stream &#125;)</code></td>
            <td>Zasób, którego loader zwraca Observable (anuluje poprzedni jak switchMap).</td>
          </tr>
          <tr>
            <td><code>takeUntilDestroyed()</code></td>
            <td>Auto-unsubscribe, gdy już musisz zrobić <code>.subscribe()</code>.</td>
          </tr>
          <tr>
            <td><code>outputFromObservable(obs$)</code></td>
            <td>Observable → <code>output()</code> komponentu.</td>
          </tr>
        </tbody>
      </table>

      <p class="fw-semibold mb-1">Uwagi</p>
      <ul class="mb-0">
        <li>
          ① i ② dają ten sam efekt. ② daje dodatkowo <code>status()</code> /
          <code>isLoading()</code> / <code>error()</code> za darmo.
        </li>
        <li>
          Bez <code>switchMap</code> (np. <code>mergeMap</code>) stara, wolniejsza odpowiedź może
          nadpisać nowszą – wyścig.
        </li>
        <li>
          Tutaj <code>tap()</code> ustawia sygnał licznika. To efekt uboczny strumienia, nie
          propagowanie stanu w <code>effect()</code>.
        </li>
        <li>
          v22: jest też <code>debounced(source, ms)</code> w <code>&#64;angular/core</code> – czysto
          sygnałowy debounce. Status: <strong>experimental</strong>, więc nie dawaj go jeszcze na
          produkcję.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D04RxjsInterop {
  readonly #http = inject(HttpClient);

  protected readonly query = signal('');
  protected readonly keystrokes = signal(0);
  protected readonly requests = signal(0);

  // ① Signal → Observable → (time operators + HTTP) → Signal
  readonly #debouncedQuery$ = toObservable(this.query).pipe(
    debounceTime(400),
    map((q) => q.trim()),
    distinctUntilChanged(),
  );

  protected readonly results = toSignal(
    this.#debouncedQuery$.pipe(
      tap(() => this.requests.update((n) => n + 1)),
      switchMap((q) => this.#http.get<Product[]>('/api/products', { params: { q } })),
    ),
    { initialValue: [] },
  );

  // ② Same debounced stream as signal → rxResource does the fetching (status, error, reload).
  readonly #debouncedQuery = toSignal(this.#debouncedQuery$, { initialValue: '' });

  protected readonly resource = rxResource({
    params: () => this.#debouncedQuery(),
    stream: ({ params: q }) => this.#http.get<Product[]>('/api/products', { params: { q } }),
    defaultValue: [],
  });

  protected onType(value: string): void {
    this.query.set(value);
    this.keystrokes.update((n) => n + 1);
  }

  protected readonly intervalCode = `// service provided by the demo component
ticks$ = interval(1000).pipe(
  tap({ subscribe: () => log('START'), finalize: () => log('STOP') }),
  share(),                                    // hot: 1 interval, stops at refCount 0
);

// A – RxJS in the template
ticks$ = inject(TickSource).ticks$;
{{ (ticks$ | async) ?? '–' }}

// B – same source as a signal
ticks = toSignal(inject(TickSource).ticks$, { initialValue: null });
{{ ticks() ?? '–' }}`;

  protected readonly code = `query = signal('');

// ① signal → RxJS (time!) → signal
results = toSignal(
  toObservable(this.query).pipe(
    debounceTime(400),
    distinctUntilChanged(),
    switchMap((q) => this.http.get<Product[]>('/api/products', { params: { q } })),
  ),
  { initialValue: [] },
);

// ② debounced signal + rxResource (status / error / reload included)
debouncedQuery = toSignal(toObservable(this.query).pipe(debounceTime(400)), { initialValue: '' });
resource = rxResource({
  params: () => this.debouncedQuery(),
  stream: ({ params: q }) => this.http.get<Product[]>('/api/products', { params: { q } }),
  defaultValue: [],
});`;
}
