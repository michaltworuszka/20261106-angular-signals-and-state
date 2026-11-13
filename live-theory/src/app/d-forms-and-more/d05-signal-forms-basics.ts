import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

interface Signup {
  name: string;
  email: string;
  newsletter: boolean;
}

@Component({
  selector: 'app-d05-signal-forms-basics',
  imports: [FormField, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D05 – signal-forms-basics</header>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="mb-2">
          <label class="form-label" for="name">Imię</label>
          <input id="name" class="form-control" [formField]="signupForm.name" />
        </div>
        <div class="mb-2">
          <label class="form-label" for="email">E-mail</label>
          <input id="email" type="email" class="form-control" [formField]="signupForm.email" />
        </div>
        <div class="form-check mb-3">
          <!-- checkbox ↔ boolean, no extra config -->
          <input
            id="newsletter"
            type="checkbox"
            class="form-check-input"
            [formField]="signupForm.newsletter"
          />
          <label class="form-check-label" for="newsletter">Chcę newsletter</label>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" type="button" (click)="fillFromCode()">
            Ustaw z kodu (field.value.set)
          </button>
          <button class="btn btn-sm btn-outline-secondary" type="button" (click)="reset()">
            Reset
          </button>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-header"><code>model()</code> – jedyne źródło prawdy</div>
          <pre class="card-body small mb-0"><code>{{ model() | json }}</code></pre>
        </div>
        <table class="table table-sm font-monospace small mb-0">
          <caption class="caption-top">
            Stan pola
            <code>signupForm.email()</code>
          </caption>
          <tbody>
            <tr>
              <th>value()</th>
              <td>'{{ signupForm.email().value() }}'</td>
            </tr>
            <tr>
              <th>touched()</th>
              <td>{{ signupForm.email().touched() }} <small>(focus + blur)</small></td>
            </tr>
            <tr>
              <th>dirty()</th>
              <td>{{ signupForm.email().dirty() }} <small>(zmienione przez użytkownika)</small></td>
            </tr>
            <tr>
              <th>signupForm().dirty()</th>
              <td>{{ signupForm().dirty() }} <small>(cały formularz)</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Signal Forms – formularz zbudowany na sygnale</p>
      <p>
        <code>form(model)</code> nie trzyma <strong>własnej kopii</strong> danych. Owija
        <code>WritableSignal</code> modelu w drzewo pól (<code>FieldTree</code>) o tym samym
        kształcie co model. Wpisanie w input zmienia <code>model()</code>, a zmiana modelu
        aktualizuje input.
      </p>
      <ul>
        <li>
          <code>signupForm.email</code> – pole (nawigacja jak po obiekcie, w pełni otypowana).
        </li>
        <li>
          <code>signupForm.email()</code> – <strong>stan</strong> pola: <code>value</code>,
          <code>touched</code>, <code>dirty</code>, <code>valid</code>, <code>errors</code>…
          (wszystko to sygnały).
        </li>
        <li>
          <code>[formField]</code> – jedna dyrektywa dla każdego inputa; typ wartości wynika z
          kontrolki (<code>checkbox</code> → <code>boolean</code>, <code>number</code> →
          <code>number</code>).
        </li>
      </ul>

      <p class="fw-semibold mb-1">Status w v22</p>
      <p class="mb-0">
        <code>&#64;angular/forms/signals</code> jest <strong>stabilne</strong> od v22. Reactive
        Forms nadal działają; migrację można robić stopniowo
        (<code>&#64;angular/forms/signals/compat</code>).
      </p>
    </blockquote>
  `,
})
export class D05SignalFormsBasics {
  protected readonly model = signal<Signup>({ name: '', email: '', newsletter: false });
  protected readonly signupForm = form(this.model);

  protected fillFromCode(): void {
    // Writing a field writes the model (same source of truth).
    this.signupForm.name().value.set('Ala');
    this.signupForm.email().value.set('ala@example.com');
  }

  protected reset(): void {
    // reset(value) – clears touched/dirty and sets the value.
    this.signupForm().reset({ name: '', email: '', newsletter: false });
  }

  protected readonly code = `model = signal<Signup>({ name: '', email: '', newsletter: false });
signupForm = form(this.model);           // FieldTree<Signup>

<input [formField]="signupForm.email" />  // import { FormField } from '@angular/forms/signals'

signupForm.email().value();               // field state = signals
signupForm.email().touched();
signupForm.name().value.set('Ala');       // → model().name === 'Ala'`;
}
