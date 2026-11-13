import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, merge, of, Subject, switchMap, tap } from 'rxjs';
import { Product } from './product';

type Scenario = 'ok' | 'slow' | 'error500' | 'notFound';

const SCENARIOS: { id: Scenario; label: string; url: string }[] = [
  { id: 'ok', label: 'Sukces', url: '/api/products/1' },
  { id: 'slow', label: 'Wolno (2 s)', url: '/api/products/2?delay=2000' },
  { id: 'error500', label: 'Błąd 500', url: '/api/products/3?fail=500' },
  { id: 'notFound', label: '404', url: '/api/products/999' },
];

const urlFor = (id: Scenario): string => SCENARIOS.find((s) => s.id === id)!.url;

// ① State model by hand – httpResource gives exactly this for free.
type Status = 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local';

interface ProductState {
  status: Status;
  value?: Product;
  error?: HttpErrorResponse;
  statusCode?: number;
}

/**
 * D02 1:1 (same UI, same behaviour) – but plain HttpClient + RxJS instead of httpResource.
 * Point: count what you have to write and keep correct yourself.
 */
@Component({
  selector: 'app-d02b-http-client-states',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      D02b – http-client-states (porównaj z RxJS)
    </header>

    <div class="d-flex flex-wrap gap-2 mb-3">
      <div class="btn-group" role="group" aria-label="scenariusz">
        @for (s of scenarios; track s.id) {
          <button
            type="button"
            class="btn btn-outline-primary"
            [class.active]="scenario() === s.id"
            (click)="scenario.set(s.id)"
          >
            {{ s.label }}
          </button>
        }
      </div>
      <button type="button" class="btn btn-outline-secondary" (click)="reload()">reload()</button>
      <button type="button" class="btn btn-outline-warning" (click)="setLocal()">setLocal()</button>
    </div>

    <div class="row g-3">
      <div class="col-md-5">
        <table class="table table-sm font-monospace small mb-0">
          <tbody>
            <tr>
              <th>status()</th>
              <td>
                <span class="badge" [class]="badgeClass[status()]">{{ status() }}</span>
              </td>
            </tr>
            <tr>
              <th>isLoading()</th>
              <td>{{ isLoading() }}</td>
            </tr>
            <tr>
              <th>hasValue()</th>
              <td>{{ hasValue() }}</td>
            </tr>
            <tr>
              <th>statusCode()</th>
              <td>{{ statusCode() ?? '–' }}</td>
            </tr>
            <tr>
              <th>error()</th>
              <td>{{ error() ? 'HttpErrorResponse' : 'undefined' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-7">
        <div class="card h-100">
          <div class="card-body">
            @switch (status()) {
              @case ('loading') {
                <span class="spinner-border spinner-border-sm"></span> Ładowanie (brak danych)…
              }
              @case ('error') {
                <div class="alert alert-danger mb-0">
                  <strong>{{ errorMessage() }}</strong>
                  <button class="btn btn-sm btn-danger ms-2" type="button" (click)="reload()">
                    Spróbuj ponownie
                  </button>
                </div>
              }
              @default {
                <!-- hasValue() is a plain boolean here – no type narrowing → '@if (value(); as p)' -->
                @if (value(); as p) {
                  <div [class.opacity-50]="status() === 'reloading'">
                    <h3 class="h5">{{ p.name }}</h3>
                    <code>{{ p.price }} zł</code>
                    @if (status() === 'reloading') {
                      <span class="spinner-border spinner-border-sm ms-2"></span> odświeżanie (stare
                      dane zostają)
                    }
                    @if (status() === 'local') {
                      <span class="badge text-bg-warning ms-2">zmienione lokalnie</span>
                    }
                  </div>
                }
              }
            }
          </div>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Ta sama strona co „Loading / error” – tylko bez httpResource</p>
      <p>
        UI i zachowanie 1:1. Różnica: zwykły <code>HttpClient</code> + RxJS, a wszystkie stany
        obsługujemy <strong>ręcznie</strong>. Tam: <strong>1 linia</strong> (<code
          >httpResource(() =&gt; url)</code
        >). Tu: <strong>~40 linii</strong>, które trzeba napisać, przetestować i utrzymać – w każdym
        komponencie, który pobiera dane.
      </p>

      <p class="fw-semibold mb-1">Co musisz napisać sam</p>
      <ul>
        <li>
          <strong>Model stanu</strong> – typ <code>Status</code> + obiekt stanu, i pilnować, żeby
          był spójny.
        </li>
        <li>
          <strong>Wyzwalacze</strong> – <code>toObservable(scenario)</code> +
          <code>Subject</code> dla <code>reload()</code>, sklejone przez <code>merge</code>.
        </li>
        <li>
          <strong>Flagi ładowania</strong> w <code>tap</code> – reload zostawia stare dane
          (<code>reloading</code>), zmiana parametru je czyści (<code>loading</code>).
        </li>
        <li><code>switchMap</code> – anulowanie poprzedniego requestu.</li>
        <li>
          <code>observe: 'response'</code> – bez tego nie znasz <code>statusCode</code> (ani
          nagłówków).
        </li>
        <li><code>catchError</code> – błąd zamieniony na stan, nie na wyjątek.</li>
        <li><code>takeUntilDestroyed()</code> – sprzątanie subskrypcji.</li>
        <li>
          <strong>6× <code>computed</code></strong> jako publiczne API + ręczny stan
          <code>local</code> (zamiast <code>value.set()</code>).
        </li>
      </ul>

      <p class="fw-semibold mb-1">Pułapki – typowe bugi z produkcji</p>
      <ul>
        <li>
          <code>mergeMap</code> zamiast <code>switchMap</code> → <strong>wyścig</strong>: kliknij
          „Wolno (2 s)”, potem od razu „Sukces” – po 2 s stara odpowiedź nadpisze nowszą. Ze
          <code>switchMap</code> w DevTools → Network stary request ma status
          <code>(canceled)</code>.
        </li>
        <li>
          <code>catchError</code> <strong>poza</strong> <code>switchMap</code> → pierwszy błąd
          kończy cały strumień. Przyciski przestają działać – po cichu, bez błędu w konsoli.
        </li>
        <li>
          Brak zawężania typu: <code>hasValue()</code> to zwykły <code>boolean</code>, więc w
          szablonie <code>value()!</code> albo <code>&#64;if (value(); as p)</code>.
        </li>
        <li>
          Osobne flagi <code>isLoading</code> / <code>error</code> / <code>data</code> (częsta
          wersja „na szybko”) → <strong>niemożliwe stany</strong> (loading i error naraz). Tu ratuje
          nas jeden obiekt stanu z <code>status</code>.
        </li>
        <li>
          <code>.subscribe()</code> w komponencie – łatwo zapomnieć o sprzątaniu albo zasubskrybować
          dwa razy (= dwa requesty).
        </li>
      </ul>

      <p class="fw-semibold mb-1">Kiedy jednak RxJS?</p>
      <p class="mb-0">
        Strumienie i czas: <code>debounceTime</code>, websockety, polling, retry z backoff. Nawet
        wtedy nie pisz stanów ręcznie: <code>rxResource</code> = RxJS w środku, stany zasobu na
        zewnątrz (zob. D2. RxJS interop). Zasada:
        <strong>RxJS do zdarzeń, sygnały do stanu</strong>.
      </p>
    </blockquote>
  `,
})
export class D02bHttpClientStates {
  readonly #http = inject(HttpClient);
  readonly #reload$ = new Subject<void>();
  readonly #state = signal<ProductState>({ status: 'idle' });

  protected readonly scenarios = SCENARIOS;
  protected readonly scenario = signal<Scenario>('ok');

  // ⑦ Public API – every flag rebuilt as computed (httpResource: status(), value(), error()…).
  protected readonly status = computed(() => this.#state().status);
  protected readonly value = computed(() => this.#state().value);
  protected readonly error = computed(() => this.#state().error);
  protected readonly statusCode = computed(() => this.#state().statusCode);
  protected readonly isLoading = computed(
    () => this.status() === 'loading' || this.status() === 'reloading',
  );
  protected readonly hasValue = computed(() => this.value() !== undefined);

  protected readonly badgeClass: Record<Status, string> = {
    idle: 'text-bg-secondary',
    loading: 'text-bg-info',
    reloading: 'text-bg-info',
    resolved: 'text-bg-success',
    error: 'text-bg-danger',
    local: 'text-bg-warning',
  };

  protected readonly errorMessage = computed(() => {
    const err = this.error();
    return err ? `${err.status}: ${err.error?.message ?? err.statusText}` : 'Nieznany błąd';
  });

  constructor() {
    // ② Triggers: param change + manual reload → one stream.
    merge(
      toObservable(this.scenario).pipe(map((id) => ({ url: urlFor(id), reload: false }))),
      this.#reload$.pipe(map(() => ({ url: urlFor(this.scenario()), reload: true }))),
    )
      .pipe(
        // ③ Loading flags by hand: reload keeps old data, param change drops it.
        tap(({ reload }) =>
          this.#state.update((s): ProductState =>
            reload && s.value ? { ...s, status: 'reloading' } : { status: 'loading' },
          ),
        ),
        // ④ switchMap = cancel the previous request (mergeMap → race, stale answer wins).
        switchMap(({ url }) =>
          // ⑤ observe: 'response' – otherwise no status code / headers.
          this.#http.get<Product>(url, { observe: 'response' }).pipe(
            map((res): ProductState => ({
              status: 'resolved',
              value: res.body ?? undefined,
              statusCode: res.status,
            })),
            // ⑥ catchError INSIDE switchMap – outside, the first error kills the whole stream.
            catchError((err: HttpErrorResponse) =>
              of<ProductState>({ status: 'error', error: err, statusCode: err.status }),
            ),
          ),
        ),
        // ⑧ Manual cleanup on destroy.
        takeUntilDestroyed(),
      )
      .subscribe((next) => this.#state.set(next));
  }

  protected reload(): void {
    this.#reload$.next();
  }

  protected setLocal(): void {
    // Immutable update → status 'local' (e.g. optimistic update before the server confirms).
    this.#state.update((s) =>
      s.value
        ? { ...s, status: 'local', value: { ...s.value, price: +(s.value.price * 0.9).toFixed(2) } }
        : s,
    );
  }

  protected readonly code = `// httpResource version (D02): 1 line
product = httpResource<Product>(() => urlFor(this.scenario()));

// HttpClient + RxJS version: state model + stream + flags – by hand
#state = signal<ProductState>({ status: 'idle' });
#reload$ = new Subject<void>();

merge(
  toObservable(this.scenario).pipe(map((id) => ({ url: urlFor(id), reload: false }))),
  this.#reload$.pipe(map(() => ({ url: urlFor(this.scenario()), reload: true }))),
).pipe(
  tap(({ reload }) => this.#state.update((s) =>
    reload && s.value ? { ...s, status: 'reloading' } : { status: 'loading' })),
  switchMap(({ url }) =>                                   // ⚠️ mergeMap → race
    this.http.get<Product>(url, { observe: 'response' }).pipe(
      map((res) => ({ status: 'resolved', value: res.body, statusCode: res.status })),
      catchError((err) => of({ status: 'error', error: err, statusCode: err.status })),
    )),                                                    // ⚠️ catchError outside → stream dies
  takeUntilDestroyed(),
).subscribe((next) => this.#state.set(next));

status = computed(() => this.#state().status);             // + value, error, statusCode,
isLoading = computed(() => ['loading', 'reloading'].includes(this.status())); // hasValue…`;
}
