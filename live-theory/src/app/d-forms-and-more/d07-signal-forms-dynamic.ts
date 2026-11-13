import { Component, computed, signal } from '@angular/core';
import { DecimalPipe, JsonPipe } from '@angular/common';
import {
  applyEach,
  form,
  FormField,
  hidden,
  min,
  pattern,
  required,
  schema,
} from '@angular/forms/signals';
import { FieldErrors } from './field-errors';

interface OrderLine {
  product: string;
  qty: number;
}

interface Order {
  customer: string;
  lines: OrderLine[];
  invoice: boolean;
  nip: string;
}

const PRICES: Record<string, number> = { Jabłko: 2.5, Banan: 4.2, Mleko: 3.6, 'Ser żółty': 29.9 };

/** Reusable schema for one array item – applied to every line with applyEach. */
const orderLineSchema = schema<OrderLine>((line) => {
  required(line.product, { message: 'Wybierz produkt' });
  min(line.qty, 1, { message: 'Min. 1 szt.' });
});

@Component({
  selector: 'app-d07-signal-forms-dynamic',
  imports: [FormField, FieldErrors, DecimalPipe, JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">D07 – signal-forms-dynamic</header>

    <div class="row g-3">
      <div class="col-lg-7">
        <label class="form-label" for="customer">Klient</label>
        <input id="customer" class="form-control" [formField]="orderForm.customer" />
        <app-field-errors [state]="orderForm.customer()" />

        <p class="fw-semibold mt-3 mb-1">Pozycje ({{ model().lines.length }})</p>
        <!-- Array model → iterate the FieldTree; one sub-form per item -->
        @for (line of orderForm.lines; track line; let i = $index) {
          <div class="row g-2 align-items-start mb-2">
            <div class="col-6">
              <select class="form-select" aria-label="Produkt" [formField]="line.product">
                <option value="">– produkt –</option>
                @for (name of productNames; track name) {
                  <option [value]="name">{{ name }}</option>
                }
              </select>
              <app-field-errors [state]="line.product()" />
            </div>
            <div class="col-3">
              <input type="number" class="form-control" aria-label="Ilość" [formField]="line.qty" />
              <app-field-errors [state]="line.qty()" />
            </div>
            <div class="col-3">
              <button
                class="btn btn-outline-danger w-100"
                type="button"
                [disabled]="model().lines.length === 1"
                (click)="removeLine(i)"
              >
                usuń
              </button>
            </div>
          </div>
        }
        <button class="btn btn-sm btn-outline-primary mb-3" type="button" (click)="addLine()">
          + dodaj pozycję
        </button>

        <div class="form-check">
          <input
            id="invoice"
            type="checkbox"
            class="form-check-input"
            [formField]="orderForm.invoice"
          />
          <label class="form-check-label" for="invoice">Faktura na firmę</label>
        </div>
        <!-- hidden() only marks the field; rendering it is up to the template -->
        @if (!orderForm.nip().hidden()) {
          <div class="mt-2">
            <label class="form-label" for="nip">NIP</label>
            <input id="nip" class="form-control" [formField]="orderForm.nip" />
            <app-field-errors [state]="orderForm.nip()" />
          </div>
        }
      </div>

      <div class="col-lg-5">
        <div class="card mb-2">
          <div class="card-body d-flex justify-content-between">
            <span>Suma (<code>computed</code>)</span>
            <strong>{{ total() | number: '1.2-2' }} zł</strong>
          </div>
        </div>
        <div class="card" [class.border-success]="orderForm().valid()">
          <div class="card-header small">
            <code>orderForm().valid()</code> = {{ orderForm().valid() }}
          </div>
          <pre class="card-body small mb-0"><code>{{ model() | json }}</code></pre>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Dynamiczny formularz = dynamiczny model</p>
      <p>
        Nie ma <code>FormArray</code> ani <code>push(new FormGroup(…))</code>. Dodanie pozycji to
        <strong>niemutowalna</strong> zmiana tablicy w modelu (<code>model.update</code>), a drzewo
        pól samo dopasowuje się do danych.
      </p>
      <ul>
        <li>
          <code>applyEach(p.lines, schema)</code> – te same reguły dla każdego elementu tablicy
          (również dodanych później).
        </li>
        <li>
          <code>schema&lt;T&gt;(…)</code> – reguły jako wartość: można je eksportować i używać
          ponownie (<code>apply</code> / <code>applyEach</code>).
        </li>
        <li>
          <code>hidden(p.nip, logic)</code> – pole warunkowe. Ukryte pole
          <strong>nie wpływa</strong> na <code>valid()</code>, więc NIP nie blokuje zamówienia bez
          faktury.
        </li>
        <li>
          Pozostałe reguły „logiki pól”: <code>disabled(…)</code>, <code>readonly(…)</code> i opcja
          <code>when</code> w walidatorach.
        </li>
        <li>
          Wartości pochodne (suma) to <code>computed</code> z modelu. Nie trzymaj ich w modelu
          formularza.
        </li>
      </ul>
    </blockquote>
  `,
})
export class D07SignalFormsDynamic {
  protected readonly productNames = Object.keys(PRICES);

  protected readonly model = signal<Order>({
    customer: '',
    lines: [{ product: 'Jabłko', qty: 3 }],
    invoice: false,
    nip: '',
  });

  protected readonly orderForm = form(this.model, (p) => {
    required(p.customer, { message: 'Podaj klienta' });
    applyEach(p.lines, orderLineSchema);
    hidden(p.nip, ({ valueOf }) => !valueOf(p.invoice));
    required(p.nip, { message: 'NIP jest wymagany do faktury' });
    pattern(p.nip, /^\d{10}$/, { message: 'NIP = 10 cyfr' });
  });

  protected readonly total = computed(() =>
    this.model().lines.reduce((sum, l) => sum + (PRICES[l.product] ?? 0) * l.qty, 0),
  );

  protected addLine(): void {
    this.model.update((o) => ({ ...o, lines: [...o.lines, { product: '', qty: 1 }] }));
  }

  protected removeLine(index: number): void {
    this.model.update((o) => ({ ...o, lines: o.lines.filter((_, i) => i !== index) }));
  }

  protected readonly code = `orderLineSchema = schema<OrderLine>((line) => {
  required(line.product, { message: 'Wybierz produkt' });
  min(line.qty, 1, { message: 'Min. 1 szt.' });
});

orderForm = form(this.model, (p) => {
  required(p.customer);
  applyEach(p.lines, orderLineSchema);                  // every item, also added later
  hidden(p.nip, ({ valueOf }) => !valueOf(p.invoice));  // conditional field
  required(p.nip);                                      // ignored while hidden
});

@for (line of orderForm.lines; track line) { <select [formField]="line.product"> … }

addLine() { this.model.update((o) => ({ ...o, lines: [...o.lines, { product: '', qty: 1 }] })); }`;
}
