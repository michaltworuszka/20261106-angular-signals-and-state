import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-c05-signal-computed',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C05 – signal-computed</header>
    <div class="d-flex justify-content-center align-items-center gap-2 mb-3">
      <button class="btn btn-warning" type="button" (click)="updateCount(-1)">-</button>
      <code class="fs-4">{{ count() }}</code>
      <button class="btn btn-success" type="button" (click)="updateCount(1)">+</button>
    </div>
    <p>
      Wartość podwojona: <code>{{ doubleCount() }}</code>
    </p>
    <p>
      Wartość podniesiona do kwadratu: <code>{{ squareCount() }}</code>
    </p>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Tylko do odczytu</p>
      <p>
        <code>computed()</code> zwraca <code>Signal&lt;T&gt;</code>, nie
        <code>WritableSignal&lt;T&gt;</code> – nie ma <code>.set()</code> ani
        <code>.update()</code>. Wartość zmienisz tylko zmieniając źródło (<code>count</code>). Jedno
        źródło prawdy – stan wyliczany nie może się „rozjechać”.
      </p>

      <p class="fw-semibold mb-1">Jak to się liczy</p>
      <ul>
        <li>
          <strong>Automatyczne zależności</strong> – każdy sygnał odczytany w funkcji staje się
          zależnością (tu: <code>count</code>). Bez ręcznej listy.
        </li>
        <li>
          <strong>Leniwie</strong> – funkcja uruchamia się dopiero przy pierwszym odczycie, nie przy
          utworzeniu.
        </li>
        <li>
          <strong>Memo</strong> – wynik jest zapamiętany. Kolejne odczyty zwracają go bez
          przeliczania, dopóki zależność się nie zmieni.
        </li>
        <li>
          <strong>Pull, nie push</strong> – zmiana <code>count</code> tylko oznacza computed jako
          nieaktualny; przelicza się przy następnym odczycie (np. w template).
        </li>
        <li>
          <strong>Równość</strong> – gdy nowy wynik jest równy poprzedniemu
          (<code>Object.is</code>), zależni od niego nie przeliczają się.
        </li>
      </ul>

      <p class="fw-semibold mb-1">Funkcja musi być czysta</p>
      <p class="mb-0">
        Bez efektów ubocznych i bez zapisu sygnałów – <code>set()</code> w
        <code>computed()</code> rzuca błąd (<code>NG0600</code>). Efekty uboczne →
        <code>effect()</code>.
      </p>
    </blockquote>
  `,
})
export class C05SignalComputed {
  protected readonly count = signal(2);
  protected readonly doubleCount = computed(() => this.count() * 2);
  protected readonly squareCount = computed(() => this.count() * this.count());

  protected readonly code = `count = signal(2);                               // WritableSignal<number>
doubleCount = computed(() => this.count() * 2);  // Signal<number> (read-only)

this.count.set(5);        // ✅
this.doubleCount.set(10); // ❌ compile error: no 'set' on Signal<number>`;

  protected updateCount(value: number): void {
    this.count.update((c) => c + value);
  }
}
