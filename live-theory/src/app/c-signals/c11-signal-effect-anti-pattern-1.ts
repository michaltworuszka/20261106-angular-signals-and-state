import { Component, computed, effect, signal } from '@angular/core';

function toMessage(count: number): string {
  if (count > 250) return 'Liczba przekroczyła 250!';
  if (count < 220) return 'Liczba jest poniżej 220!';
  return 'OK';
}

@Component({
  selector: 'app-c11-signal-effect-anti-pattern-1',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      C11 – signal-effect – antywzorzec #1
    </header>

    <div class="d-flex justify-content-center align-items-center gap-2 mb-4">
      <button class="btn btn-warning" type="button" (click)="updateCount(-10)">-</button>
      <code class="fs-4">{{ count() }}</code>
      <button class="btn btn-success" type="button" (click)="updateCount(10)">+</button>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">❌ effect() + signal()</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ badCode }}</code></pre>
            Wynik: <strong>{{ messageFromEffect() }}</strong>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-success h-100">
          <div class="card-header text-bg-success">✅ computed()</div>
          <div class="card-body">
            <pre class="mb-3"><code>{{ goodCode }}</code></pre>
            Wynik: <strong>{{ message() }}</strong>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>Wynik ten sam – ale wersja z <code>effect()</code> jest gorsza:</p>
      <ul class="mb-0">
        <li>dodatkowy <em>zapisywalny</em> sygnał – każdy może go nadpisać i rozjechać stan,</li>
        <li>wartość startowa <code>''</code> zanim effect się wykona (glitch),</li>
        <li>
          effect jest planowany i uruchamiany zawsze, <code>computed</code> – leniwie i z memo,
        </li>
        <li>więcej kodu, trudniej prześledzić skąd bierze się wartość.</li>
      </ul>
      <p class="mt-2 mb-0">
        Reguła: wartość <strong>wyliczana</strong> z innych sygnałów → <code>computed()</code>.
      </p>
    </blockquote>
  `,
})
export class C11SignalEffectAntiPattern1 {
  protected readonly count = signal(230);

  // ❌ Anti-pattern: effect copies derived state into another writable signal.
  protected readonly messageFromEffect = signal('');
  // ✅ Fix: derived state = computed.
  protected readonly message = computed(() => toMessage(this.count()));

  protected readonly badCode = `message = signal('');

constructor() {
  effect(() => this.message.set(toMessage(this.count())));
}`;
  protected readonly goodCode = `message = computed(() => toMessage(this.count()));`;

  constructor() {
    effect(() => this.messageFromEffect.set(toMessage(this.count())));
  }

  protected updateCount(value: number): void {
    this.count.update((c) => c + value);
  }
}
