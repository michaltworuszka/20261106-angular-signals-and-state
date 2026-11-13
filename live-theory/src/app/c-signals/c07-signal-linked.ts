import { Component, computed, linkedSignal, signal } from '@angular/core';

interface Product {
  name: string;
  sizes: string[];
}

const PRODUCTS: Product[] = [
  { name: 'Koszulka', sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Buty', sizes: ['40', '41', '42', '43'] },
  { name: 'Czapka', sizes: ['uniwersalny'] },
];

@Component({
  selector: 'app-c07-signal-linked',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C07 – signal-linked</header>

    <p class="mb-2">1. Wybierz produkt, 2. wybierz rozmiar, 3. zmień produkt.</p>
    <div class="btn-group mb-4" role="group" aria-label="produkt">
      @for (p of products; track p.name) {
        <button
          class="btn btn-outline-primary"
          type="button"
          [class.active]="product() === p"
          (click)="product.set(p)"
        >
          {{ p.name }}
        </button>
      }
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100" [class.border-danger]="!plainValid()">
          <div class="card-header">❌ <code>signal('S')</code></div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 mb-3">
              @for (size of product().sizes; track size) {
                <button
                  class="btn btn-sm btn-outline-secondary"
                  type="button"
                  [class.active]="plainSize() === size"
                  (click)="plainSize.set(size)"
                >
                  {{ size }}
                </button>
              }
            </div>
            wybrany: <code>{{ plainSize() }}</code>
            @if (!plainValid()) {
              <div class="alert alert-danger small mt-2 mb-0">
                Rozmiar <code>{{ plainSize() }}</code> nie istnieje dla „{{ product().name }}”. Stan
                niespójny – do koszyka trafi błędny wariant.
              </div>
            }
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-success h-100">
          <div class="card-header">✅ <code>linkedSignal(() =&gt; product().sizes[0])</code></div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 mb-3">
              @for (size of product().sizes; track size) {
                <button
                  class="btn btn-sm btn-outline-success"
                  type="button"
                  [class.active]="size === linkedSize()"
                  (click)="linkedSize.set(size)"
                >
                  {{ size }}
                </button>
              }
            </div>
            wybrany: <code>{{ linkedSize() }}</code>
          </div>
        </div>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">
        <code>linkedSignal()</code> = <code>computed()</code>, który można nadpisać
      </p>
      <p>
        Wartość <strong>wyliczana</strong> ze źródła (jak <code>computed</code>), ale
        <strong>zapisywalna</strong> (jak <code>signal</code>) – zwraca <code>WritableSignal</code>.
        Użytkownik wybiera <code>set()</code>; zmiana źródła (<code>product</code>)
        <strong>resetuje</strong> wartość przez ponowne wyliczenie.
      </p>

      <p class="fw-semibold mb-1">Dlaczego nie…</p>
      <ul>
        <li><code>signal()</code> – nie wie o zmianie produktu → stan niespójny (lewa karta).</li>
        <li><code>computed()</code> – tylko do odczytu, użytkownik nie może wybrać rozmiaru.</li>
        <li>
          <code>signal()</code> + <code>effect()</code> resetujący – antywzorzec (propagacja stanu w
          effect, patrz <em>C4 – Antywzorzec #1</em>): dodatkowy cykl i moment, w którym stan jest
          błędny.
        </li>
      </ul>

      <p class="fw-semibold mb-1">Typowe użycia</p>
      <ul class="mb-0">
        <li>Wybór (zaznaczenie, zakładka, strona) resetowany przy zmianie listy.</li>
        <li>
          Lokalna, edytowalna kopia inputu – „szkic”:
          <code>draft = linkedSignal(() =&gt; this.value())</code>. Rodzic zmieni wartość → szkic
          wraca do niej.
        </li>
      </ul>
    </blockquote>

    <div class="alert alert-secondary small mt-4 mb-0">
      Reset do pierwszego to prosty przypadek. A gdyby wybór miał <strong>przetrwać</strong>, jeśli
      nadal jest na liście? → <em>C3 – Zachowaj poprzedni wybór</em>.
    </div>
  `,
})
export class C07SignalLinked {
  protected readonly products = PRODUCTS;
  protected readonly product = signal(PRODUCTS[0]);

  protected readonly plainSize = signal('S');
  protected readonly plainValid = computed(() => this.product().sizes.includes(this.plainSize()));

  protected readonly linkedSize = linkedSignal(() => this.product().sizes[0]);

  protected readonly code = `product = signal(PRODUCTS[0]);
size = linkedSignal(() => this.product().sizes[0]); // WritableSignal<string>

this.size.set('L');          // ✅ user choice
this.product.set(PRODUCTS[1]); // source changed → size() === '40' (reset)`;
}
