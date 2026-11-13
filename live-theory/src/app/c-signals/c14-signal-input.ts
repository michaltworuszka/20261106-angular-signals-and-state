import { Component, signal } from '@angular/core';
import { ProductCard } from './product-card';

@Component({
  selector: 'app-c14-signal-input',
  imports: [ProductCard],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C14 – signal-input</header>

    <div class="card mb-4">
      <div class="card-header">Rodzic – właściciel stanu</div>
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          cena:
          <button class="btn btn-sm btn-warning" type="button" (click)="changePrice(-10)">
            -10
          </button>
          <code class="fs-5">{{ price() }}</code>
          <button class="btn btn-sm btn-success" type="button" (click)="changePrice(10)">
            +10
          </button>
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="rabat">
          @for (value of discounts; track value) {
            <button
              class="btn btn-outline-primary"
              type="button"
              [class.active]="discount() === value"
              (click)="discount.set(value)"
            >
              {{ value }}%
            </button>
          }
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-sm-6">
        <p class="small text-body-secondary mb-1">bez <code>[discount]</code> → domyślne 0</p>
        <app-product-card name="Klawiatura" [price]="price()" />
      </div>
      <div class="col-sm-6">
        <p class="small text-body-secondary mb-1">z <code>[discount]="discount()"</code></p>
        <app-product-card name="Klawiatura" [price]="price()" [discount]="discount()" />
      </div>
    </div>

    <div class="row g-3 mt-2">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">Dziecko – <code>product-card.ts</code></div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ childCode }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">Czego nie zrobisz</div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ errorsCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1"><code>input()</code> = sygnał tylko do odczytu</p>
      <p>
        Zwraca <code>InputSignal&lt;T&gt;</code>. Czytasz jak każdy sygnał – <code>price()</code>.
        Pisze <strong>tylko rodzic</strong> przez binding – dziecko nie ma <code>.set()</code>. Dane
        płyną w dół, jeden właściciel stanu.
      </p>

      <p class="fw-semibold mb-1">Bo to sygnał…</p>
      <p>
        …działa w <code>computed()</code> i <code>effect()</code>. <code>finalPrice</code> przelicza
        się sam przy zmianie ceny lub rabatu – bez <code>ngOnChanges</code> i
        <code>SimpleChanges</code>.
      </p>

      <p class="fw-semibold mb-1">Trzy warianty</p>
      <ul>
        <li><code>input(0)</code> – opcjonalny z domyślną wartością, typ <code>number</code>.</li>
        <li>
          <code>input&lt;number&gt;()</code> – opcjonalny bez domyślnej, typ
          <code>number | undefined</code>.
        </li>
        <li>
          <code>input.required&lt;string&gt;()</code> – bez domyślnej, typ <code>string</code>. Brak
          bindingu → <strong>błąd kompilacji</strong>. Odczyt zanim rodzic ustawi wartość (w
          konstruktorze) → kompilator też to wyłapie; ukryty w metodzie → błąd w runtime.
          Bezpiecznie: w template, <code>computed()</code>, <code>effect()</code>.
        </li>
      </ul>

      <p class="fw-semibold mb-1">Opcje</p>
      <p>
        <code>alias</code> – inna nazwa w template; <code>transform</code> – konwersja, np.
        <code>input(false, {{ '{' }} transform: booleanAttribute {{ '}' }})</code> pozwala pisać
        <code>&lt;app-x disabled /&gt;</code>.
      </p>

      <p class="fw-semibold mb-1">Migracja</p>
      <p class="mb-0">
        <code>&#64;Input()</code> → <code>input()</code>,
        <code>&#64;Input({{ '{' }} required: true {{ '}' }})</code> → <code>input.required()</code>.
        Automatycznie: <code>ng g &#64;angular/core:signal-input-migration</code>.
      </p>
    </blockquote>

    <div class="alert alert-secondary small mt-4 mb-0">
      Dane w dół już mamy. A w górę – kliknięcie w dziecku ma zmienić stan rodzica? →
      <strong><code>output()</code></strong> (C5 – następny przykład).
    </div>
  `,
})
export class C14SignalInput {
  protected readonly discounts = [0, 10, 25];
  protected readonly price = signal(200);
  protected readonly discount = signal(10);

  protected readonly childCode = `export class ProductCard {
  readonly name = input.required<string>();
  readonly price = input.required<number>();
  readonly discount = input(0);

  protected readonly finalPrice = computed(
    () => this.price() * (1 - this.discount() / 100),
  );
}`;

  protected readonly errorsCode = `// parent template – missing required input
<app-product-card [price]="price()" />
// ❌ NG8008: Required input 'name' from
//    component ProductCard must be specified.

// child
this.price.set(100);
// ❌ compile error: no 'set' on InputSignal<number>

constructor() { this.name(); }
// ❌ NG8118: \`name\` is a required \`input\` and does not
//    have a value in this context.   (compile time!)

constructor() { this.log(); } // read hidden in a method
// ❌ NG0950: Input "name" is required but no value
//    is available yet.               (runtime)`;

  protected changePrice(delta: number): void {
    this.price.update((p) => Math.max(0, p + delta));
  }
}
