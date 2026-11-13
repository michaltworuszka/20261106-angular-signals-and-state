import { Component, computed, signal } from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { Product } from './product';

type Scenario = 'ok' | 'slow' | 'error500' | 'notFound';

const SCENARIOS: { id: Scenario; label: string; url: string }[] = [
  { id: 'ok', label: 'Sukces', url: '/api/products/1' },
  { id: 'slow', label: 'Wolno (2 s)', url: '/api/products/2?delay=2000' },
  { id: 'error500', label: 'Błąd 500', url: '/api/products/3?fail=500' },
  { id: 'notFound', label: '404', url: '/api/products/999' },
];

@Component({
  selector: 'app-d02-http-resource-states',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D02 – http-resource-states</header>

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
      <button type="button" class="btn btn-outline-secondary" (click)="product.reload()">
        reload()
      </button>
      <button type="button" class="btn btn-outline-warning" (click)="setLocal()">
        value.set(…)
      </button>
    </div>

    <div class="row g-3">
      <div class="col-md-5">
        <table class="table table-sm font-monospace small mb-0">
          <tbody>
            <tr>
              <th>status()</th>
              <td>
                <span class="badge" [class]="badgeClass[product.status()]">{{
                  product.status()
                }}</span>
              </td>
            </tr>
            <tr>
              <th>isLoading()</th>
              <td>{{ product.isLoading() }}</td>
            </tr>
            <tr>
              <th>hasValue()</th>
              <td>{{ product.hasValue() }}</td>
            </tr>
            <tr>
              <th>statusCode()</th>
              <td>{{ product.statusCode() ?? '–' }}</td>
            </tr>
            <tr>
              <th>error()</th>
              <td>{{ product.error() ? 'HttpErrorResponse' : 'undefined' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-7">
        <!-- UI per state: one @switch, no boolean soup (isLoading && !error && …) -->
        <div class="card h-100">
          <div class="card-body">
            @switch (product.status()) {
              @case ('loading') {
                <span class="spinner-border spinner-border-sm"></span> Ładowanie (brak danych)…
              }
              @case ('error') {
                <div class="alert alert-danger mb-0">
                  <strong>{{ errorMessage() }}</strong>
                  <button
                    class="btn btn-sm btn-danger ms-2"
                    type="button"
                    (click)="product.reload()"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              }
              @default {
                <!-- resolved | reloading | local → value available -->
                @if (product.hasValue()) {
                  <div [class.opacity-50]="product.status() === 'reloading'">
                    <h3 class="h5">{{ product.value().name }}</h3>
                    <code>{{ product.value().price }} zł</code>
                    @if (product.status() === 'reloading') {
                      <span class="spinner-border spinner-border-sm ms-2"></span> odświeżanie (stare
                      dane zostają)
                    }
                    @if (product.status() === 'local') {
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
      <p class="fw-semibold mb-1">Stany zasobu – zamiast ręcznych flag</p>
      <ul>
        <li><code>idle</code> – request = <code>undefined</code>, nic nie ładujemy.</li>
        <li><code>loading</code> – pierwsze ładowanie / zmiana parametrów (brak wartości).</li>
        <li>
          <code>reloading</code> – <code>reload()</code>: stare dane <strong>zostają</strong> w
          <code>value()</code>, można je pokazać przygaszone.
        </li>
        <li><code>resolved</code> – są dane. <code>error</code> – błąd w <code>error()</code>.</li>
        <li>
          <code>local</code> – wartość ustawiona ręcznie <code>value.set()</code> (np. optymistyczna
          aktualizacja).
        </li>
      </ul>

      <p class="fw-semibold mb-1">Pułapki</p>
      <ul class="mb-0">
        <li>
          W stanie <code>error</code> odczyt <code>value()</code> <strong>rzuca wyjątek</strong> →
          zawsze najpierw <code>hasValue()</code> (zawęża też typ: brak <code>undefined</code>).
        </li>
        <li>
          <code>isLoading()</code> = <code>loading</code> <em>lub</em> <code>reloading</code>.
          Spinner „na całą stronę” tylko gdy nie ma danych.
        </li>
        <li>
          Jeden <code>&#64;switch (status())</code> zamiast kombinacji
          <code>isLoading &amp;&amp; !error &amp;&amp; data</code> – niemożliwe stany są niemożliwe.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D02HttpResourceStates {
  protected readonly scenarios = SCENARIOS;
  protected readonly scenario = signal<Scenario>('ok');

  protected readonly product = httpResource<Product>(
    () => SCENARIOS.find((s) => s.id === this.scenario())!.url,
  );

  protected readonly badgeClass: Record<string, string> = {
    idle: 'text-bg-secondary',
    loading: 'text-bg-info',
    reloading: 'text-bg-info',
    resolved: 'text-bg-success',
    error: 'text-bg-danger',
    local: 'text-bg-warning',
  };

  protected readonly errorMessage = computed(() => {
    const err = this.product.error();
    return err instanceof HttpErrorResponse
      ? `${err.status}: ${err.error?.message ?? err.statusText}`
      : 'Nieznany błąd';
  });

  protected setLocal(): void {
    if (this.product.hasValue()) {
      // Immutable update → status 'local' (e.g. optimistic update before the server confirms).
      this.product.value.update((p) => p && { ...p, price: +(p.price * 0.9).toFixed(2) });
    }
  }

  protected readonly code = `product = httpResource<Product>(() => urlFor(this.scenario()));

@switch (product.status()) {
  @case ('loading') { <spinner /> }
  @case ('error')   { {{ product.error() }} <button (click)="product.reload()">… }
  @default {
    @if (product.hasValue()) { {{ product.value().name }} }  // ⚠️ value() throws in 'error'
  }
}`;
}
