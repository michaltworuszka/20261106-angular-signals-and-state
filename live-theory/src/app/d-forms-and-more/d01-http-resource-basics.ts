import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from './product';

@Component({
  selector: 'app-d01-http-resource-basics',
  imports: [FormsModule, DecimalPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D01 – http-resource-basics</header>

    <div class="row g-3">
      <div class="col-md-7">
        <input
          class="form-control mb-2"
          placeholder="Szukaj produktu… (np. „er”)"
          aria-label="Szukaj"
          [(ngModel)]="query"
        />
        <div class="card">
          <div class="card-header d-flex justify-content-between">
            <span>
              <code>GET /api/products?q={{ query() }}</code>
            </span>
            @if (products.isLoading()) {
              <span class="spinner-border spinner-border-sm" role="status"></span>
            }
          </div>
          <!-- defaultValue: [] → value() is never undefined, no extra checks needed -->
          <div class="list-group list-group-flush" [class.opacity-50]="products.isLoading()">
            @for (p of products.value(); track p.id) {
              <button
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between"
                [class.active]="selectedId() === p.id"
                (click)="selectedId.set(p.id)"
              >
                {{ p.name }} <span>{{ p.price | number: '1.2-2' }} zł</span>
              </button>
            } @empty {
              <div class="list-group-item text-body-secondary">brak wyników</div>
            }
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <div class="card h-100">
          <div class="card-header">
            Szczegóły: <code>status() = '{{ detail.status() }}'</code>
          </div>
          <div class="card-body">
            @if (detail.hasValue()) {
              <h3 class="h5">{{ detail.value().name }}</h3>
              <p class="mb-1">Kategoria: {{ detail.value().category }}</p>
              <p class="mb-3">Cena: {{ detail.value().price | number: '1.2-2' }} zł</p>
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                (click)="selectedId.set(undefined)"
              >
                Zamknij
              </button>
            } @else if (detail.isLoading()) {
              <span class="spinner-border spinner-border-sm"></span> ładowanie…
            } @else {
              <span class="text-body-secondary">
                Kliknij produkt. Brak id → request zwraca <code>undefined</code> → zasób w stanie
                <code>idle</code>, nic nie jest wysyłane.
              </span>
            }
          </div>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">
        <code>httpResource()</code> = <code>HttpClient</code> + <code>resource()</code>
      </p>
      <p>
        Dane z serwera jako <strong>sygnały</strong>: <code>value()</code>,
        <code>isLoading()</code>, <code>status()</code>, <code>error()</code>. Funkcja requestu jest
        <strong>reaktywna</strong> – czyta <code>query()</code>, więc każda zmiana frazy =
        <strong>automatyczny nowy request</strong>, a poprzedni, niedokończony, jest
        <strong>anulowany</strong> (brak wyścigów, jak <code>switchMap</code>).
      </p>
      <p>
        Idzie przez <code>HttpClient</code> → działają <strong>interceptory</strong> (auth, logi,
        cache). Stabilne API od v22. Backend: Express w <code>server.ts</code> → otwórz DevTools →
        <strong>Network</strong> (anulowany request = <code>(canceled)</code>).
      </p>

      <p class="fw-semibold mb-1">Zasady</p>
      <ul class="mb-0">
        <li>
          <strong>Stan serwera ≠ stan klienta.</strong> Lista produktów to stan serwera →
          <code>httpResource</code>. Wybrany produkt (<code>selectedId</code>) to stan UI →
          <code>signal</code>.
        </li>
        <li>
          Request zwraca <code>undefined</code> → brak zapytania (warunkowe ładowanie, np. „dopóki
          nic nie wybrano”).
        </li>
        <li>
          Tylko do <strong>odczytu</strong> (GET). Zapis (POST/PUT/DELETE) → zwykły
          <code>HttpClient</code> w metodzie, potem <code>reload()</code> zasobu.
        </li>
        <li>
          Inne źródła: <code>resource()</code> (dowolny <code>Promise</code>, np.
          <code>fetch</code>), <code>rxResource()</code> (<code>Observable</code>, patrz D2).
        </li>
      </ul>
    </blockquote>
  `,
})
export class D01HttpResourceBasics {
  protected readonly query = signal('');
  protected readonly selectedId = signal<number | undefined>(undefined);

  // Reactive request: reads query() → refetch on every change (previous request cancelled).
  protected readonly products = httpResource<Product[]>(
    () => ({ url: '/api/products', params: { q: this.query() } }),
    { defaultValue: [] },
  );

  // undefined → resource stays idle, no request.
  protected readonly detail = httpResource<Product>(() => {
    const id = this.selectedId();
    return id === undefined ? undefined : `/api/products/${id}`;
  });

  protected readonly code = `query = signal('');
selectedId = signal<number | undefined>(undefined);

products = httpResource<Product[]>(
  () => ({ url: '/api/products', params: { q: this.query() } }), // reactive
  { defaultValue: [] },
);

detail = httpResource<Product>(() => {
  const id = this.selectedId();
  return id === undefined ? undefined : \`/api/products/\${id}\`; // undefined → idle
});`;
}
