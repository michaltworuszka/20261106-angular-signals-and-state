import { Component, computed, signal } from '@angular/core';

interface User {
  name: string;
  age: number;
}

const INITIAL_USER: User = { name: 'Ania', age: 30 };

@Component({
  selector: 'app-c04-signal-same-reference',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C04 – signal-same-reference</header>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <button class="btn btn-danger" type="button" (click)="mutate()">
        ❌ mutacja + set(ta sama referencja)
      </button>
      <button class="btn btn-success" type="button" (click)="immutable()">
        ✅ update() – nowy obiekt
      </button>
      <button class="btn btn-outline-secondary" type="button" (click)="reset()">reset</button>
    </div>

    <!-- @let: re-evaluated on every render (a memoized computed would be stale too) -->
    @let outOfSync = user().age !== age();
    <table class="table w-auto">
      <tbody>
        <tr>
          <th>bezpośrednio w template: <code>user().age</code></th>
          <td>
            <code class="fs-5">{{ user().age }}</code>
          </td>
        </tr>
        <tr [class.table-danger]="outOfSync">
          <th><code>computed(() =&gt; user().age)</code></th>
          <td>
            <code class="fs-5">{{ age() }}</code>
          </td>
        </tr>
      </tbody>
    </table>
    @if (outOfSync) {
      <div class="alert alert-danger">
        Rozjazd! <code>computed</code> nie wie o zmianie – sygnał nie powiadomił odbiorców.
      </div>
    }

    <div class="row g-3 mt-1">
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">❌ ta sama referencja</div>
          <div class="card-body">
            <pre class="mb-0"><code>{{ badCode }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-success h-100">
          <div class="card-header text-bg-success">✅ nowa referencja</div>
          <div class="card-body">
            <pre class="mb-0"><code>{{ goodCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>
        <code>set()</code> porównuje starą i nową wartość przez <code>Object.is</code>. Ten sam
        obiekt (nawet zmutowany) = „brak zmiany” → <strong>żadnego powiadomienia</strong>:
        <code>computed</code> zwraca starą wartość z memo, <code>effect</code> się nie uruchomi.
      </p>
      <p>
        Dlaczego <code>user().age</code> w template jednak się zmienia? Kliknięcie (event w
        template) samo oznacza widok do odświeżenia, więc template czyta zmutowany obiekt. Wynik:
        <strong>niespójny UI</strong> – najgorszy rodzaj błędu.
      </p>
      <p class="mb-0">
        Reguła: stan w sygnale traktuj jako <strong>niemutowalny</strong> – zawsze nowy obiekt /
        tablica. (Własne porównanie: <code>signal(v, &#123; equal &#125;)</code>.)
      </p>
    </blockquote>
  `,
})
export class C04SignalSameReference {
  protected readonly user = signal<User>({ ...INITIAL_USER });
  protected readonly age = computed(() => this.user().age);

  protected readonly badCode = `const u = this.user();
u.age++;           // mutation in place
this.user.set(u);  // same ref → Object.is → no-op`;
  protected readonly goodCode = `this.user.update((u) => ({ ...u, age: u.age + 1 }));
// new ref → consumers notified`;

  protected mutate(): void {
    // ❌ Anti-pattern (on purpose).
    const u = this.user();
    u.age++;
    this.user.set(u);
  }

  protected immutable(): void {
    this.user.update((u) => ({ ...u, age: u.age + 1 }));
  }

  protected reset(): void {
    this.user.set({ ...INITIAL_USER });
  }
}
