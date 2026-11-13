import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { scan, skip } from 'rxjs';
import { AuthSession, Notifications, ShoppingCart } from './e04-services';

/** Smart widget #1 – talks only to AuthSession. */
@Component({
  selector: 'app-e04-session-bar',
  template: `
    @if (session.user(); as user) {
      <span
        >Zalogowany: <strong>{{ user }}</strong></span
      >
      <button class="btn btn-sm btn-outline-danger" type="button" (click)="session.logout()">
        Wyloguj
      </button>
    } @else {
      <span class="text-body-secondary">niezalogowany</span>
      <button class="btn btn-sm btn-outline-primary" type="button" (click)="session.login('Ala')">
        Zaloguj jako Ala
      </button>
    }
  `,
  host: { class: 'd-flex align-items-center gap-2' },
})
export class E04SessionBar {
  protected readonly session = inject(AuthSession);
}

/** Smart widget #2 – talks only to ShoppingCart. */
@Component({
  selector: 'app-e04-cart-panel',
  template: `
    <div class="card h-100">
      <div class="card-header">ShoppingCart ({{ cart.items().length }})</div>
      <div class="card-body d-flex flex-wrap gap-2">
        @for (item of products; track item) {
          <button class="btn btn-sm btn-primary" type="button" (click)="cart.add(item)">
            + {{ item }}
          </button>
        }
        <button class="btn btn-sm btn-warning" type="button" (click)="addThreeAtOnce()">
          3× Jabłko w jednej chwili
        </button>
      </div>
      <ul class="list-group list-group-flush small">
        @for (item of cart.items(); track $index) {
          <li class="list-group-item py-1">{{ item }}</li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">koszyk pusty</li>
        }
      </ul>
    </div>
  `,
})
export class E04CartPanel {
  protected readonly cart = inject(ShoppingCart);
  protected readonly products = ['Jabłko', 'Banan'];

  protected addThreeAtOnce(): void {
    // Synchronous burst: 3 events in the same tick.
    this.cart.add('Jabłko');
    this.cart.add('Jabłko');
    this.cart.add('Jabłko');
  }
}

/** Smart widget #3 – listens via Notifications, never sees Cart/Session directly. */
@Component({
  selector: 'app-e04-toasts',
  template: `
    <div class="card h-100">
      <div class="card-header">Notifications (słucha 2 serwisów)</div>
      <ul class="list-group list-group-flush small">
        @for (toast of notifications.toasts(); track toast.id) {
          <li class="list-group-item py-1 d-flex justify-content-between align-items-center">
            {{ toast.text }}
            <button
              class="btn-close btn-sm"
              type="button"
              aria-label="Zamknij"
              (click)="notifications.dismiss(toast.id)"
            ></button>
          </li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">brak powiadomień</li>
        }
      </ul>
    </div>
  `,
})
export class E04Toasts {
  protected readonly notifications = inject(Notifications);
}

@Component({
  selector: 'app-e04-long-distance-page',
  imports: [E04SessionBar, E04CartPanel, E04Toasts],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3 d-flex justify-content-between">
      E04 – long-distance <app-e04-session-bar />
    </header>

    <h2 class="h6">1. Serwis → serwis: zdarzenie zamiast wywołania</h2>
    <div class="row g-3 mb-3">
      <div class="col-md-6"><app-e04-cart-panel /></div>
      <div class="col-md-6"><app-e04-toasts /></div>
    </div>
    <p class="small">
      Dodaj coś i kliknij <strong>Wyloguj</strong>. <code>AuthSession</code> nie wie, że istnieje
      koszyk ani powiadomienia. Tylko ogłasza <code>loggedOut$</code>, a słuchacze sami reagują.
    </p>
    <pre><code>{{ flow }}</code></pre>
    <pre><code>{{ code }}</code></pre>

    <h2 class="h6 mt-4">2. Dlaczego zdarzenie to nie sygnał?</h2>
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <div class="card border-success h-100">
          <div class="card-header">✅ <code>itemAdded$</code> (Subject)</div>
          <div class="card-body">
            <p class="display-6 mb-0">{{ viaSubject() }}</p>
            <small class="text-body-secondary">liczba usłyszanych zdarzeń</small>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-danger h-100">
          <div class="card-header">❌ <code>lastAdded</code> (sygnał „ostatnio dodany”)</div>
          <div class="card-body">
            <p class="display-6 mb-0">{{ viaSignal() }}</p>
            <small class="text-body-secondary">liczba zauważonych zmian</small>
          </div>
        </div>
      </div>
    </div>
    <p class="small">
      Kliknij 2× <strong>+ Jabłko</strong>, potem <strong>3× Jabłko w jednej chwili</strong>.
      Subject liczy każde kliknięcie, sygnał gubi zdarzenia.
    </p>
    <pre><code>{{ compareCode }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Sygnał = stan, Observable = zdarzenie</p>
      <ul>
        <li>
          <strong>Sygnał gubi zdarzenia:</strong> ta sama wartość 2× → brak zmiany (równość
          <code>===</code>). Kilka zapisów w jednym ticku → słuchacz (<code>effect</code>,
          <code>toObservable</code>) widzi tylko ostatni. Dla stanu to zaleta (glitch-free), dla
          zdarzeń błąd.
        </li>
        <li>
          <strong>Subject prywatny, na zewnątrz <code>asObservable()</code>:</strong> tak samo jak
          <code>#state</code> + <code>asReadonly()</code>. Tylko właściciel może wywołać
          <code>next()</code>.
        </li>
        <li>
          <strong>Kierunek zależności:</strong> słuchacz zna nadawcę (<code>inject</code>), nadawca
          nie zna słuchaczy. Bez zdarzenia <code>AuthSession.logout()</code> musiałby wołać
          <code>cart.clear()</code>, <code>notifications.push()</code>, … i rosnąć z każdym nowym
          feature'em.
        </li>
        <li>
          <strong>Sprzątanie:</strong> <code>takeUntilDestroyed()</code> działa też w serwisie (w
          konstruktorze = injection context). Odpina się, gdy ginie injector serwisu.
        </li>
        <li>
          <strong>Pułapka – leniwe serwisy:</strong> serwis w root powstaje przy pierwszym
          <code>inject()</code>. Nikt nie wstrzyknął <code>Notifications</code> → nikt nie słucha,
          zdarzenie przepada (Subject nie ma pamięci). Słuchacz globalny:
          <code>provideAppInitializer(() =&gt; &#123; inject(Notifications); &#125;)</code>.
        </li>
        <li>
          <strong>RxJS się opłaca</strong>, gdy liczy się czas lub kombinacja źródeł:
          <code>merge</code>, <code>debounceTime</code>, <code>bufferTime</code> („dodano 3
          produkty”), <code>switchMap</code>. Wynik dla widoku i tak trafia do sygnału.
        </li>
        <li>
          Wszystko w jednym pliku, bez granic. Gdy nadawca i słuchacz są w
          <strong>różnych domenach</strong>, których Sheriff nie pozwala łączyć → E5.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E04LongDistancePage {
  readonly #cart = inject(ShoppingCart);

  // Both counters built the same way – only the source differs.
  protected readonly viaSubject = toSignal(this.#cart.itemAdded$.pipe(scan((n) => n + 1, 0)), {
    initialValue: 0,
  });
  protected readonly viaSignal = toSignal(
    toObservable(this.#cart.lastAdded).pipe(
      skip(1), // toObservable emits the current value first
      scan((n) => n + 1, 0),
    ),
    { initialValue: 0 },
  );

  protected readonly flow = `AuthSession.logout()
  ├─ #user.set(null)              state  → session-bar re-renders
  └─ #loggedOut.next('Ala')       event
       ├─▶ ShoppingCart      →  #items.set([])
       └─▶ Notifications     →  toast "Ala wylogowany"`;

  protected readonly code = `@Service()
export class AuthSession {
  readonly #loggedOut = new Subject<string>();          // private
  readonly loggedOut$ = this.#loggedOut.asObservable(); // public, read-only

  logout() { …; this.#loggedOut.next(user); }           // knows no listeners
}

@Service()
export class ShoppingCart {
  constructor() {
    inject(AuthSession).loggedOut$
      .pipe(takeUntilDestroyed())                      // ok in a service
      .subscribe(() => this.#items.set([]));
  }
}`;

  protected readonly compareCode = `add(item) {
  this.#lastAdded.set(item);   // ❌ 'Jabłko' → 'Jabłko' = no change; 3 sets in one tick = 1
  this.#itemAdded.next(item);  // ✅ every call = one event
}`;
}
