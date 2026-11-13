import { DecimalPipe } from '@angular/common';
import { Component, computed, linkedSignal, signal } from '@angular/core';

type Category = 'wszystkie' | 'peryferia' | 'monitory';

interface Product {
  id: number;
  name: string;
  category: Exclude<Category, 'wszystkie'>;
  price: number;
}

const SERVER_PRODUCTS: Product[] = [
  { id: 1, name: 'Klawiatura', category: 'peryferia', price: 129.99 },
  { id: 2, name: 'Mysz', category: 'peryferia', price: 49.5 },
  { id: 3, name: 'Monitor 24"', category: 'monitory', price: 899 },
  { id: 4, name: 'Monitor 27"', category: 'monitory', price: 1299 },
];

@Component({
  selector: 'app-c08-signal-linked-previous',
  imports: [DecimalPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C08 – signal-linked-previous</header>

    <div class="d-flex flex-wrap gap-2 mb-3">
      <div class="btn-group btn-group-sm" role="group" aria-label="kategoria">
        @for (c of categories; track c) {
          <button
            class="btn btn-outline-primary"
            type="button"
            [class.active]="category() === c"
            (click)="category.set(c)"
          >
            {{ c }}
          </button>
        }
      </div>
      <button class="btn btn-sm btn-outline-secondary" type="button" (click)="refresh()">
        ⟳ odśwież z serwera (nowe obiekty, nowe ceny)
      </button>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="list-group">
          @for (p of visible(); track p.id) {
            <button
              class="list-group-item list-group-item-action d-flex justify-content-between"
              type="button"
              [class.active]="p.id === selected()?.id"
              (click)="selected.set(p)"
            >
              <span>{{ p.name }}</span>
              <small>{{ p.price | number: '1.2-2' }} zł</small>
            </button>
          }
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-success h-100">
          <div class="card-header">Szczegóły – <code>selected()</code></div>
          <div class="card-body">
            @if (selected(); as p) {
              <h6>{{ p.name }}</h6>
              <div class="fs-5 fw-semibold">{{ p.price | number: '1.2-2' }} zł</div>
              <small class="text-body-secondary">{{ p.category }} · id {{ p.id }}</small>
            } @else {
              <span class="text-body-secondary">brak produktów</span>
            }
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-header">Spróbuj</div>
      <ol class="list-group list-group-flush list-group-numbered small">
        <li class="list-group-item">
          Wybierz <strong>Mysz</strong> → kategoria „peryferia” → wybór zostaje (Mysz nadal na
          liście).
        </li>
        <li class="list-group-item">
          Kategoria „monitory” → Myszy nie ma → wybór spada na pierwszy.
        </li>
        <li class="list-group-item">
          „wszystkie”, wybierz <strong>Monitor 27"</strong> → odśwież → wybór zostaje, cena
          <strong>nowa</strong>.
        </li>
      </ol>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Forma z <code>source</code> + <code>computation</code></p>
      <p>
        <code>source</code> – co śledzić (tu: widoczna lista).
        <code>computation(source, previous)</code> – jak wyliczyć nową wartość, gdy źródło się
        zmieni. <code>previous</code> = <code>{{ '{' }} source, value {{ '}' }}</code> sprzed zmiany
        (przy pierwszym wyliczeniu <code>undefined</code>). <code>previous.value</code> to także
        wartość ustawiona ręcznie przez <code>set()</code>.
      </p>

      <p class="fw-semibold mb-1">Dlaczego szukamy po <code>id</code></p>
      <p>
        Po odświeżeniu z serwera lista ma <strong>nowe obiekty</strong>. Zwrócenie
        <code>previous.value</code> trzymałoby stary obiekt (starą cenę).
        <code>list.find(p =&gt; p.id === prev.id)</code> = ten sam produkt, świeże dane.
      </p>

      <p class="fw-semibold mb-1">Kiedy forma prosta, kiedy ta?</p>
      <ul class="mb-0">
        <li>Zawsze reset → <code>linkedSignal(() =&gt; ...)</code> (poprzedni przykład).</li>
        <li>
          Wynik zależy od poprzedniego wyboru →
          <code>{{ '{' }} source, computation {{ '}' }}</code
          >.
        </li>
        <li>
          Sygnały czytane w <code>computation</code> też są śledzone – trzymaj tam czystą logikę, a
          zależności w <code>source</code>.
        </li>
      </ul>
    </blockquote>
  `,
})
export class C08SignalLinkedPrevious {
  protected readonly categories: Category[] = ['wszystkie', 'peryferia', 'monitory'];
  protected readonly category = signal<Category>('wszystkie');
  protected readonly products = signal(SERVER_PRODUCTS);

  protected readonly visible = computed(() => {
    const category = this.category();
    return this.products().filter((p) => category === 'wszystkie' || p.category === category);
  });

  protected readonly selected = linkedSignal<Product[], Product | undefined>({
    source: this.visible,
    computation: (list, previous) => list.find((p) => p.id === previous?.value?.id) ?? list[0],
  });

  protected readonly code = `selected = linkedSignal<Product[], Product | undefined>({
  source: this.visible,
  computation: (list, previous) =>
    list.find((p) => p.id === previous?.value?.id) // still visible? keep (fresh object)
    ?? list[0],                                      // gone? fall back to first
});`;

  /** Simulates a refetch: same ids, new object references, new prices. */
  protected refresh(): void {
    this.products.update((list) =>
      list.map((p) => ({ ...p, price: Math.round(p.price * (0.9 + Math.random() * 0.2)) })),
    );
  }
}
