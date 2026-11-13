import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  email,
  form,
  FormField,
  FormRoot,
  max,
  min,
  minLength,
  pattern,
  required,
  SchemaPath,
  validate,
} from '@angular/forms/signals';
import { FieldErrors } from './field-errors';

interface Registration {
  login: string;
  email: string;
  age: number;
  password: string;
  confirm: string;
  terms: boolean;
}

const EMPTY: Registration = {
  login: '',
  email: '',
  age: 18,
  password: '',
  confirm: '',
  terms: false,
};

/** Custom, reusable rule = plain function taking a path. */
function strongPassword(path: SchemaPath<string>): void {
  minLength(path, 8, { message: 'Min. 8 znaków' });
  validate(path, ({ value }) =>
    /\d/.test(value()) ? null : { kind: 'digit', message: 'Dodaj przynajmniej jedną cyfrę' },
  );
}

@Component({
  selector: 'app-d08-signal-forms-validators',
  imports: [FormField, FormRoot, FieldErrors, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      D08 – signal-forms-validators
    </header>

    <div class="row g-3">
      <div class="col-lg-7">
        <!-- formRoot: novalidate + submit → submission.action (only when valid) -->
        <form [formRoot]="regForm">
          <div class="row g-2">
            <div class="col-sm-6">
              <label class="form-label" for="login">Login</label>
              <input
                id="login"
                class="form-control"
                [class.is-invalid]="regForm.login().touched() && regForm.login().invalid()"
                [formField]="regForm.login"
              />
              <app-field-errors [state]="regForm.login()" />
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="email">E-mail</label>
              <input
                id="email"
                type="email"
                class="form-control"
                [class.is-invalid]="regForm.email().touched() && regForm.email().invalid()"
                [formField]="regForm.email"
              />
              <app-field-errors [state]="regForm.email()" />
            </div>
            <div class="col-sm-4">
              <label class="form-label" for="age">Wiek</label>
              <input id="age" type="number" class="form-control" [formField]="regForm.age" />
              <app-field-errors [state]="regForm.age()" />
            </div>
            <div class="col-sm-4">
              <label class="form-label" for="password">Hasło</label>
              <input
                id="password"
                type="password"
                class="form-control"
                [formField]="regForm.password"
              />
              <app-field-errors [state]="regForm.password()" />
            </div>
            <div class="col-sm-4">
              <label class="form-label" for="confirm">Powtórz hasło</label>
              <input
                id="confirm"
                type="password"
                class="form-control"
                [formField]="regForm.confirm"
              />
              <app-field-errors [state]="regForm.confirm()" />
            </div>
            <div class="col-12">
              <div class="form-check">
                <input
                  id="terms"
                  type="checkbox"
                  class="form-check-input"
                  [formField]="regForm.terms"
                />
                <label class="form-check-label" for="terms">Akceptuję regulamin</label>
              </div>
              <app-field-errors [state]="regForm.terms()" />
            </div>
          </div>

          <button class="btn btn-primary mt-3" type="submit" [disabled]="regForm().submitting()">
            @if (regForm().submitting()) {
              <span class="spinner-border spinner-border-sm"></span>
            }
            Zarejestruj
          </button>
          <small class="text-body-secondary ms-2">
            (login „admin” → błąd zwrócony przez „serwer”)
          </small>
        </form>
      </div>

      <div class="col-lg-5">
        <div class="card mb-2">
          <div class="card-header small">
            <code>regForm().errorSummary()</code> ({{ regForm().errorSummary().length }})
          </div>
          <ul class="list-group list-group-flush small">
            @for (e of regForm().errorSummary(); track $index) {
              <li class="list-group-item">
                <code>{{ e.kind }}</code> {{ e.message }}
              </li>
            } @empty {
              <li class="list-group-item text-success">brak błędów ✔</li>
            }
          </ul>
        </div>
        @if (registered(); as user) {
          <div class="alert alert-success small mb-0">
            Wysłano:
            <pre class="mb-0"><code>{{ user | json }}</code></pre>
          </div>
        }
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Walidacja = schemat obok modelu, nie w szablonie</p>
      <p>
        Drugi argument <code>form(model, (p) =&gt; …)</code> to <strong>schemat</strong>:
        <code>p</code> to ścieżki pól, na które „przypinasz” reguły. Wbudowane:
        <code>required</code>, <code>email</code>, <code>min</code> / <code>max</code>,
        <code>minLength</code> / <code>maxLength</code>, <code>pattern</code>. Każda przyjmuje
        <code>message</code> i <code>when</code> (warunek).
      </p>
      <ul>
        <li>
          <strong>Własna reguła</strong> →
          <code>validate(path, (&#123; value &#125;) =&gt; error | null)</code>. Funkcja jest
          reaktywna jak <code>computed</code>.
        </li>
        <li>
          <strong>Reguła wielokrotnego użytku</strong> → zwykła funkcja przyjmująca
          <code>SchemaPath</code> (tu <code>strongPassword</code>).
        </li>
        <li>
          <strong>Między polami</strong> → <code>valueOf(p.password)</code> w walidatorze
          <code>confirm</code>. Zmiana hasła sama przelicza błąd potwierdzenia.
        </li>
        <li>
          <strong>Błędy z serwera</strong> → <code>submission.action</code> zwraca błędy z
          <code>fieldTree</code>, a te trafiają do konkretnego pola.
        </li>
        <li>
          Błąd to obiekt <code>&#123; kind, message &#125;</code>. <code>errors()</code> daje błędy
          pola, a <code>errorSummary()</code> całego drzewa.
        </li>
        <li>
          <code>valid()</code> ≠ <code>!invalid()</code>: przy walidatorze w toku (async, D3 –
          walidatory async) oba są <code>false</code>.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D08SignalFormsValidators {
  protected readonly model = signal<Registration>(EMPTY);
  protected readonly registered = signal<Registration | null>(null);

  protected readonly regForm = form(
    this.model,
    (p) => {
      required(p.login, { message: 'Login jest wymagany' });
      minLength(p.login, 3, { message: 'Min. 3 znaki' });
      pattern(p.login, /^[a-z0-9_]*$/, { message: 'Tylko a-z, 0-9 i _' });

      required(p.email, { message: 'E-mail jest wymagany' });
      email(p.email, { message: 'Niepoprawny e-mail' });

      min(p.age, 18, { message: 'Musisz mieć 18 lat' });
      max(p.age, 120, { message: 'Serio?' });

      required(p.password, { message: 'Hasło jest wymagane' });
      strongPassword(p.password);

      // Cross-field: reads another field → re-validates when password changes too.
      validate(p.confirm, ({ value, valueOf }) =>
        value() === valueOf(p.password) ? null : { kind: 'mismatch', message: 'Hasła się różnią' },
      );

      validate(p.terms, ({ value }) =>
        value() ? null : { kind: 'terms', message: 'Zaakceptuj regulamin' },
      );
    },
    {
      submission: {
        // Runs only when the form is valid. Returned errors land on the given fields.
        action: async (f) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (f.login().value() === 'admin') {
            return { kind: 'server', message: 'Serwer: login zajęty', fieldTree: f.login };
          }
          this.registered.set(f().value());
          return null;
        },
      },
    },
  );

  protected readonly code = `regForm = form(this.model, (p) => {
  required(p.login, { message: 'Login jest wymagany' });
  minLength(p.login, 3, { message: 'Min. 3 znaki' });
  email(p.email, { message: 'Niepoprawny e-mail' });
  min(p.age, 18);
  strongPassword(p.password);                              // custom reusable rule

  validate(p.confirm, ({ value, valueOf }) =>              // cross-field
    value() === valueOf(p.password) ? null : { kind: 'mismatch', message: 'Hasła się różnią' });
}, {
  submission: {
    action: async (f) => {                                 // only when valid
      const ok = await api.register(f().value());
      return ok ? null : { kind: 'server', message: 'Login zajęty', fieldTree: f.login };
    },
  },
});

<form [formRoot]="regForm"> … <button type="submit">`;
}
