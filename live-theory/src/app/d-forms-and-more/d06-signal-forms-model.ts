import { Component, computed, linkedSignal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';

interface Address {
  street: string;
  city: string;
}

interface Customer {
  id: number;
  name: string;
  age: number;
  address: Address;
}

/** Pretend this came from the server (e.g. httpResource value). */
const CUSTOMERS: Customer[] = [
  { id: 1, name: 'Ala Kowalska', age: 31, address: { street: 'Kwiatowa 1', city: 'Kraków' } },
  { id: 2, name: 'Bob Nowak', age: 45, address: { street: 'Polna 7', city: 'Gdańsk' } },
];

@Component({
  selector: 'app-d06-signal-forms-model',
  imports: [FormField, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D06 – signal-forms-model</header>

    <div class="btn-group mb-3" role="group" aria-label="klient">
      @for (c of customers(); track c.id) {
        <button
          type="button"
          class="btn btn-outline-primary"
          [class.active]="selectedId() === c.id"
          (click)="selectedId.set(c.id)"
        >
          {{ c.name }}
        </button>
      }
    </div>

    <div class="row g-3">
      <div class="col-md-5">
        <div class="mb-2">
          <label class="form-label" for="name">Imię i nazwisko</label>
          <input id="name" class="form-control" [formField]="customerForm.name" />
        </div>
        <div class="mb-2">
          <label class="form-label" for="age">Wiek</label>
          <!-- type=number → model gets a number, not a string -->
          <input id="age" type="number" class="form-control" [formField]="customerForm.age" />
        </div>
        <!-- Nested object = nested FieldTree -->
        <fieldset class="border rounded p-2 mb-3">
          <legend class="float-none w-auto px-1 small">address</legend>
          <input
            class="form-control mb-2"
            aria-label="Ulica"
            [formField]="customerForm.address.street"
          />
          <input class="form-control" aria-label="Miasto" [formField]="customerForm.address.city" />
        </fieldset>

        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-success" type="button" [disabled]="!changed()" (click)="save()">
            Zapisz
          </button>
          <button
            class="btn btn-outline-secondary"
            type="button"
            [disabled]="!changed()"
            (click)="discard()"
          >
            Odrzuć zmiany
          </button>
          <button class="btn btn-outline-danger" type="button" (click)="mutateInPlace()">
            ❌ mutacja w miejscu
          </button>
        </div>
      </div>

      <div class="col-md-7">
        <div class="row g-2">
          <div class="col-sm-6">
            <div class="card h-100">
              <div class="card-header small">„serwer” – <code>selected()</code></div>
              <pre class="card-body small mb-0"><code>{{ selected() | json }}</code></pre>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card h-100" [class.border-warning]="changed()">
              <div class="card-header small">
                szkic – <code>model()</code>
                @if (changed()) {
                  <span class="badge text-bg-warning">zmieniony</span>
                }
              </div>
              <pre class="card-body small mb-0"><code>{{ model() | json }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Model to zwykły sygnał, a formularz to widok na niego</p>
      <ul>
        <li>
          Kształt modelu = kształt formularza. Zagnieżdżony obiekt (<code>address</code>) to
          zagnieżdżone pola (<code>customerForm.address.city</code>). Literówka w nazwie pola = błąd
          kompilacji.
        </li>
        <li>
          Formularz zapisuje model <strong>niemutowalnie</strong> (nowe obiekty), dlatego „serwer”
          po lewej się nie zmienia, póki nie klikniesz Zapisz.
        </li>
        <li>
          Model musi mieć <strong>komplet pól</strong> od początku (np. <code>''</code>,
          <code>0</code>, <code>[]</code>), bez <code>undefined</code>. Formularz buduje pola z
          wartości.
        </li>
      </ul>

      <p class="fw-semibold mb-1">Wzorzec z produkcji: szkic edycji = <code>linkedSignal</code></p>
      <p>
        <code>model = linkedSignal(() =&gt; this.selected())</code>: lokalna, edytowalna kopia
        danych z serwera. Zmiana klienta (źródła) <strong>resetuje</strong> szkic (C3), a „Odrzuć
        zmiany” to po prostu <code>model.set(selected())</code>.
      </p>

      <p class="fw-semibold mb-1">❌ Antywzorzec: mutacja w miejscu</p>
      <p>
        <code>model().address.city = 'X'</code> zmienia obiekt, ale <strong>nie sygnał</strong> (ta
        sama referencja, patrz C1). Kliknij i porównaj:
      </p>
      <ul class="mb-0">
        <li>input „Miasto” dalej pokazuje starą wartość, bo pole nie dostało powiadomienia,</li>
        <li>
          JSON pokazuje „ZMUTOWANE” (pipe <code>json</code> jest nieczysty i przelicza się przy
          kliknięciu), więc <strong>widok się rozjechał</strong>,
        </li>
        <li>
          zmienił się też „serwer”: szkic i źródło to ten sam obiekt, a znacznik „zmieniony” tego
          nie wykrył.
        </li>
        <li>
          Zawsze <code>set</code> / <code>update</code> albo <code>field().value.set()</code>.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D06SignalFormsModel {
  protected readonly customers = signal(CUSTOMERS);
  protected readonly selectedId = signal(1);
  protected readonly selected = computed(() =>
    this.customers().find((c) => c.id === this.selectedId())!,
  );

  // Editable draft of server data; resets when the source (selected customer) changes.
  protected readonly model = linkedSignal(() => this.selected());
  protected readonly customerForm = form(this.model);

  // Immutable updates → reference comparison is enough to detect changes.
  protected readonly changed = computed(() => this.model() !== this.selected());

  protected save(): void {
    const draft = this.model();
    // "Server" accepts → source updated → linkedSignal recomputes to the saved value.
    this.customers.update((list) => list.map((c) => (c.id === draft.id ? draft : c)));
  }

  protected discard(): void {
    this.model.set(this.selected());
  }

  protected mutateInPlace(): void {
    // ❌ Anti-pattern on purpose: no signal notification → UI shows stale data.
    this.model().address.city = 'ZMUTOWANE';
  }

  protected readonly code = `selected = computed(() => this.customers().find((c) => c.id === this.selectedId())!);

model = linkedSignal(() => this.selected());   // draft – resets when source changes
customerForm = form(this.model);

<input [formField]="customerForm.address.city" />   // nested field
<input type="number" [formField]="customerForm.age" /> // number in model

save()    { this.customers.update((l) => l.map((c) => (c.id === draft.id ? draft : c))); }
discard() { this.model.set(this.selected()); }

this.model().address.city = 'X';                       // ❌ in-place mutation – no update`;
}
