import { Component, computed, signal } from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Me {
  greeting: string;
  receivedHeaders: Record<string, string | null>;
}

@Component({
  selector: 'app-d03-http-resource-headers',
  imports: [FormsModule, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D03 – http-resource-headers</header>

    <div class="row g-2 mb-3">
      <div class="col-sm-6">
        <label class="form-label" for="token">Token (nagłówek <code>Authorization</code>)</label>
        <input
          id="token"
          class="form-control"
          placeholder="np. Ala – puste = 401"
          [(ngModel)]="token"
        />
      </div>
      <div class="col-sm-6">
        <label class="form-label" for="lang">Język (<code>Accept-Language</code>)</label>
        <select id="lang" class="form-select" [(ngModel)]="lang">
          <option value="pl">pl</option>
          <option value="en">en</option>
          <option value="de">de</option>
        </select>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">Odpowiedź – body</div>
          <div class="card-body">
            @if (me.hasValue()) {
              <p class="h5">{{ me.value().greeting }}</p>
              <small class="text-body-secondary">Serwer dostał nagłówki:</small>
              <pre class="small mb-0"><code>{{ me.value().receivedHeaders | json }}</code></pre>
            } @else if (me.isLoading()) {
              <span class="spinner-border spinner-border-sm"></span> ładowanie…
            } @else if (me.error()) {
              <div class="alert alert-danger mb-0">{{ errorMessage() }}</div>
            }
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">Odpowiedź – metadane (też sygnały)</div>
          <table class="table table-sm font-monospace small mb-0">
            <tbody>
              <tr>
                <th>statusCode()</th>
                <td>{{ me.statusCode() ?? '–' }}</td>
              </tr>
              <tr>
                <th>headers()?.get('X-Api-Version')</th>
                <td>{{ me.headers()?.get('X-Api-Version') ?? '–' }}</td>
              </tr>
              <tr>
                <th>headers()?.get('X-Request-Id')</th>
                <td class="text-break">{{ me.headers()?.get('X-Request-Id') ?? '–' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Request jako obiekt: <code>HttpResourceRequest</code></p>
      <p>
        Zamiast samego URL zwracamy obiekt: <code>url</code>, <code>method</code>,
        <code>params</code>, <code>headers</code>, <code>body</code>, <code>withCredentials</code>…
        Cała funkcja jest reaktywna – zmiana <strong>nagłówka</strong> (token, język) to taki sam
        powód do ponownego pobrania jak zmiana URL.
      </p>
      <p>
        Nagłówki <strong>odpowiedzi</strong> i kod statusu też są sygnałami: <code>headers()</code>,
        <code>statusCode()</code> (+ <code>progress()</code> dla uploadu / downloadu).
      </p>

      <p class="fw-semibold mb-1">W prawdziwej aplikacji</p>
      <ul class="mb-0">
        <li>
          Nagłówki <strong>globalne</strong> (token, język, correlation-id) →
          <code>HttpInterceptorFn</code>, nie w każdym komponencie. Zasób i tak przejdzie przez
          interceptor.
        </li>
        <li>
          Nagłówki <strong>per request</strong> (np. <code>If-None-Match</code>, wersja API dla
          jednego endpointu) → w obiekcie requestu, jak tutaj.
        </li>
        <li>
          Walidacja / mapowanie odpowiedzi → opcja <code>parse</code> (np. schemat Zod), dane wejdą
          do <code>value()</code> już otypowane.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D03HttpResourceHeaders {
  protected readonly token = signal('Ala');
  protected readonly lang = signal('pl');

  protected readonly me = httpResource<Me>(() => ({
    url: '/api/me',
    headers: {
      'Accept-Language': this.lang(),
      // Empty token → no header at all (server answers 401).
      ...(this.token() ? { Authorization: `Bearer ${this.token()}` } : {}),
    },
  }));

  protected readonly errorMessage = computed(() => {
    const err = this.me.error();
    return err instanceof HttpErrorResponse
      ? `${err.status}: ${err.error?.message ?? err.statusText}`
      : 'Błąd';
  });

  protected readonly code = `me = httpResource<Me>(() => ({
  url: '/api/me',
  headers: {
    'Accept-Language': this.lang(),                        // reactive header
    ...(this.token() ? { Authorization: \`Bearer \${this.token()}\` } : {}),
  },
}));

me.headers()?.get('X-Api-Version'); // response headers – signal
me.statusCode();                    // 200 | 401 | …`;
}
