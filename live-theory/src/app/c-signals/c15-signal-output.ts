import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { QuantityStepper } from './quantity-stepper';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const INITIAL_ITEMS: CartItem[] = [
  { id: 1, name: 'Klawiatura', price: 129.99, quantity: 1 },
  { id: 2, name: 'Mysz', price: 49.5, quantity: 2 },
];

@Component({
  selector: 'app-c15-signal-output',
  imports: [DecimalPipe, QuantityStepper],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C15 – signal-output</header>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between">
            <span>Rodzic – koszyk (stan)</span>
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="reset()">
              reset
            </button>
          </div>
          <ul class="list-group list-group-flush">
            @for (item of items(); track item.id) {
              <li class="list-group-item d-flex flex-wrap justify-content-between gap-2">
                <span>
                  {{ item.name }}
                  <small class="text-body-secondary ms-1"
                    >{{ item.price | number: '1.2-2' }} zł</small
                  >
                </span>
                <app-quantity-stepper
                  [quantity]="item.quantity"
                  (quantityChange)="setQuantity(item.id, $event)"
                  (removed)="remove(item.id)"
                />
              </li>
            } @empty {
              <li class="list-group-item text-body-secondary">Koszyk pusty</li>
            }
            <li class="list-group-item text-end">
              Razem: <strong>{{ total() | number: '1.2-2' }} zł</strong>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card h-100">
          <div class="card-header">Zdarzenia od dziecka (ostatnie 5)</div>
          <ul class="list-group list-group-flush font-monospace small">
            @for (entry of log(); track $index) {
              <li class="list-group-item">{{ entry }}</li>
            } @empty {
              <li class="list-group-item text-body-secondary">kliknij - / + / usuń</li>
            }
          </ul>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-2">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">Dziecko – <code>quantity-stepper.ts</code></div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ childCode }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">Rodzic – template</div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ parentCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1"><code>output()</code> to nie sygnał</p>
      <p>
        Zwraca <code>OutputEmitterRef&lt;T&gt;</code>. Nie ma wartości do odczytu – nie wywołasz
        <code>quantityChange()</code>. Ma tylko <code>.emit(value)</code>. Sygnał =
        <strong>stan</strong> (jest zawsze, czytasz kiedy chcesz). Output =
        <strong>zdarzenie</strong> (dzieje się w chwili, ktoś słucha albo nie).
      </p>

      <p class="fw-semibold mb-1">Dlaczego jest w rodzinie sygnałów</p>
      <p>
        To ten sam nowy styl API co <code>input()</code> – funkcja zamiast dekoratora, bez
        <code>EventEmitter</code> i bez RxJS. Para <code>input()</code> + <code>output()</code> =
        kontrakt komponentu.
      </p>

      <p class="fw-semibold mb-1">Przepływ jednokierunkowy</p>
      <p>
        Stan w dół (<code>[quantity]</code>), zdarzenia w górę (<code>(quantityChange)</code>).
        Dziecko <strong>nie zmienia</strong> ilości – prosi rodzica. Rodzic aktualizuje swój sygnał
        (niemutowalnie), nowa wartość wraca inputem. Dziecko jest presentational – zero
        <code>inject()</code>, łatwe do testów i ponownego użycia.
      </p>

      <p class="fw-semibold mb-1">Poza template</p>
      <ul>
        <li>
          <code>ref.instance.removed.subscribe(fn)</code> – zwraca
          <code>OutputRefSubscription</code>, sprząta się sam przy zniszczeniu komponentu.
        </li>
        <li>
          RxJS interop: <code>outputFromObservable(obs$)</code> i
          <code>outputToObservable(output)</code> (<code>&#64;angular/core/rxjs-interop</code>).
        </li>
      </ul>

      <p class="fw-semibold mb-1">Migracja</p>
      <p class="mb-0">
        <code>&#64;Output() x = new EventEmitter&lt;T&gt;()</code> →
        <code>x = output&lt;T&gt;()</code>. Automatycznie:
        <code>ng g &#64;angular/core:output-migration</code>.
      </p>
    </blockquote>

    <div class="alert alert-secondary small mt-4 mb-0">
      Zauważ parę <code>quantity</code> + <code>quantityChange</code>. To konwencja, którą
      <code>model()</code> zamyka w jednym sygnale: <code>[(quantity)]</code> – dwukierunkowy
      binding. (później)
    </div>
  `,
})
export class C15SignalOutput {
  protected readonly items = signal(INITIAL_ITEMS);
  protected readonly log = signal<string[]>([]);

  protected readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  protected readonly childCode = `export class QuantityStepper {
  readonly quantity = input.required<number>();

  readonly quantityChange = output<number>();
  readonly removed = output();
}

// template
(click)="quantityChange.emit(quantity() + 1)"
(click)="removed.emit()"`;

  protected readonly parentCode = `<app-quantity-stepper
  [quantity]="item.quantity"
  (quantityChange)="setQuantity(item.id, $event)"
  (removed)="remove(item.id)"
/>`;

  protected setQuantity(id: number, quantity: number): void {
    this.items.update((items) => items.map((i) => (i.id === id ? { ...i, quantity } : i)));
    this.addLog(`quantityChange(${quantity}) ← #${id}`);
  }

  protected remove(id: number): void {
    this.items.update((items) => items.filter((i) => i.id !== id));
    this.addLog(`removed() ← #${id}`);
  }

  protected reset(): void {
    this.items.set(INITIAL_ITEMS);
    this.log.set([]);
  }

  private addLog(entry: string): void {
    this.log.update((log) => [entry, ...log].slice(0, 5));
  }
}
