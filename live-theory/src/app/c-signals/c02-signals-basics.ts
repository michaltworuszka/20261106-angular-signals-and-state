import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-c02-signals-basics',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C02 – signal-basics</header>
    <div class="d-flex justify-content-center align-items-center gap-2">
      <button class="btn btn-warning" type="button" (click)="updateCount(-2)">-</button>
      <div class="fs-4 fw-bold">{{ count() }}</div>
      <button class="btn btn-success" type="button" (click)="updateCount(2)">+</button>
      <button class="btn btn-outline-secondary ms-3" type="button" (click)="reset()">reset</button>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <ul class="mb-0">
        <li>
          <code>signal(wartość)</code> → <code>WritableSignal&lt;T&gt;</code>: „pudełko” z
          wartością, które powiadamia odbiorców o zmianie.
        </li>
        <li>
          <strong>Odczyt</strong> = wywołanie: <code>count()</code>. W template,
          <code>computed()</code> i <code>effect()</code> odczyt rejestruje zależność.
        </li>
        <li>
          <strong>Zapis</strong>: <code>set(v)</code> – nowa wartość, <code>update(fn)</code> – na
          podstawie poprzedniej.
        </li>
        <li>
          <code>asReadonly()</code> – wersja tylko do odczytu, do wystawienia na zewnątrz (np. ze
          store).
        </li>
        <li>
          <strong>Zoneless</strong>: zmiana sygnału czytanego w template sama oznacza widok do
          odświeżenia – bez <code>zone.js</code>.
        </li>
        <li>
          Powiadamia tylko, gdy wartość <strong>naprawdę</strong> się zmieni
          (<code>Object.is</code>) – zob. przykład „Ta sama referencja”.
        </li>
      </ul>
    </blockquote>
  `,
})
export class C02SignalsBasics {
  protected readonly count = signal(200);

  protected readonly code = `count = signal(200);        // WritableSignal<number>

count();                    // read → 200
count.set(0);               // write: new value
count.update((c) => c + 2); // write: from previous value

readonlyCount = count.asReadonly(); // Signal<number> – no set/update`;

  protected updateCount(value: number): void {
    this.count.update((c) => c + value);
  }

  protected reset(): void {
    this.count.set(200);
  }
}
