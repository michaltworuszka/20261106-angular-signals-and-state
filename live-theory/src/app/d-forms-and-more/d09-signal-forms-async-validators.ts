import { Component, signal } from '@angular/core';
import { form, FormField, minLength, required, validateHttp } from '@angular/forms/signals';
import { FieldErrors } from './field-errors';

interface LoginCheck {
  available: boolean;
}

@Component({
  selector: 'app-d09-signal-forms-async-validators',
  imports: [FormField, FieldErrors],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      D09 – signal-forms-async-validators
    </header>

    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label" for="login">Login (zajęte: admin, jan, anna, root)</label>
        <div class="input-group">
          <input
            id="login"
            class="form-control"
            [class.is-valid]="loginForm.login().valid()"
            [class.is-invalid]="loginForm.login().invalid()"
            [formField]="loginForm.login"
          />
          <span class="input-group-text" style="width: 3rem">
            @if (loginForm.login().pending()) {
              <span class="spinner-border spinner-border-sm" role="status"></span>
            } @else if (loginForm.login().valid()) {
              ✔
            }
          </span>
        </div>
        <app-field-errors [state]="loginForm.login()" />
      </div>

      <div class="col-md-6">
        <table class="table table-sm font-monospace small mb-0">
          <caption class="caption-top">
            Stan pola
            <code>loginForm.login()</code>
          </caption>
          <tbody>
            <tr>
              <th>pending()</th>
              <td>{{ loginForm.login().pending() }}</td>
            </tr>
            <tr>
              <th>valid()</th>
              <td>{{ loginForm.login().valid() }}</td>
            </tr>
            <tr>
              <th>invalid()</th>
              <td>{{ loginForm.login().invalid() }}</td>
            </tr>
            <tr>
              <th>errors()</th>
              <td>
                @for (e of loginForm.login().errors(); track e.kind) {
                  <code>{{ e.kind }}</code>
                  &nbsp;
                } @empty {
                  []
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Walidacja asynchroniczna = zasób (resource) przypięty do pola</p>
      <p>
        <code>validateHttp</code> tworzy pod spodem <code>httpResource</code>, więc ma wszystko z
        D1: interceptory, anulowanie starego requestu przy nowej wartości i stan
        <code>pending()</code>.
      </p>
      <ul>
        <li>
          <strong>Kolejność:</strong> async rusza dopiero, gdy walidatory synchroniczne przechodzą.
          „ab” → tylko <code>minLength</code>, bez requestu.
        </li>
        <li>
          <code>debounce</code> – czekaj, aż użytkownik przestanie pisać (tu 400 ms). Mniej
          requestów.
        </li>
        <li>
          <code>onSuccess</code> mapuje odpowiedź na błąd (lub <code>null</code>), a
          <code>onError</code> obsługuje błąd HTTP. Nie blokuj formularza, gdy serwer padnie –
          zdecyduj świadomie.
        </li>
        <li>
          W trakcie: <code>pending() = true</code>, <code>valid() = false</code> i
          <code>invalid() = false</code>. Dlatego <code>valid()</code> ≠ <code>!invalid()</code>.
        </li>
        <li>
          Dowolne źródło (nie HTTP) →
          <code>validateAsync(path, &#123; params, factory, onSuccess, onError &#125;)</code>, gdzie
          <code>factory</code> zwraca <code>resource()</code>.
        </li>
        <li>
          Serwer i tak musi sprawdzić unikalność przy zapisie (wyścig dwóch użytkowników). Walidacja
          async to UX, nie gwarancja.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D09SignalFormsAsyncValidators {
  protected readonly model = signal({ login: '' });

  protected readonly loginForm = form(this.model, (p) => {
    required(p.login, { message: 'Login jest wymagany' });
    minLength(p.login, 3, { message: 'Min. 3 znaki' });

    // Runs only when sync rules pass; previous request cancelled on new value.
    validateHttp<string, LoginCheck>(p.login, {
      request: ({ value }) => ({ url: '/api/logins/check', params: { login: value() } }),
      debounce: 400,
      onSuccess: (res) =>
        res.available ? null : { kind: 'taken', message: 'Login zajęty – wybierz inny' },
      onError: () => ({ kind: 'server', message: 'Nie udało się sprawdzić loginu' }),
    });
  });

  protected readonly code = `loginForm = form(this.model, (p) => {
  required(p.login);
  minLength(p.login, 3);                  // async runs only when these pass

  validateHttp<string, LoginCheck>(p.login, {
    request: ({ value }) => ({ url: '/api/logins/check', params: { login: value() } }),
    debounce: 400,
    onSuccess: (res) => (res.available ? null : { kind: 'taken', message: 'Login zajęty' }),
    onError: () => ({ kind: 'server', message: 'Nie udało się sprawdzić' }),
  });
});

@if (loginForm.login().pending()) { <spinner /> }`;
}
