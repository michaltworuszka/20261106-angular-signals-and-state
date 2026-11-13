import { inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Subject } from 'rxjs';

/**
 * E04 – three root services that talk over long distance with RxJS events.
 *
 * Rule: signal = STATE ("what is now"), Observable/Subject = EVENT ("what just happened").
 * Publisher exposes `asObservable()` only (nobody else can call `next()`).
 * Publisher does NOT know its listeners → no import cycle, easy to add a new listener.
 */

@Service()
export class AuthSession {
  readonly #user = signal<string | null>('Ala');
  readonly user = this.#user.asReadonly(); // state

  readonly #loggedOut = new Subject<string>(); // event: who logged out
  readonly loggedOut$ = this.#loggedOut.asObservable();

  login(name: string): void {
    this.#user.set(name);
  }

  logout(): void {
    const user = this.#user();
    if (!user) {
      return;
    }
    this.#user.set(null);
    this.#loggedOut.next(user);
  }
}

@Service()
export class ShoppingCart {
  readonly #items = signal<string[]>([]);
  readonly items = this.#items.asReadonly(); // state

  readonly #itemAdded = new Subject<string>(); // ✅ event: every add counts
  readonly itemAdded$ = this.#itemAdded.asObservable();

  // ❌ "event as signal" – kept only to compare in the demo. Same value twice = no change.
  readonly #lastAdded = signal<string | null>(null);
  readonly lastAdded = this.#lastAdded.asReadonly();

  constructor() {
    // Listener: cart knows the session, session does NOT know the cart.
    // takeUntilDestroyed() in a service → unsubscribes when its injector is destroyed.
    inject(AuthSession)
      .loggedOut$.pipe(takeUntilDestroyed())
      .subscribe(() => this.#items.set([]));
  }

  add(item: string): void {
    this.#items.update((items) => [...items, item]);
    this.#lastAdded.set(item);
    this.#itemAdded.next(item);
  }
}

export interface Toast {
  id: number;
  text: string;
}

/** Listens to several publishers at once – neither of them knows it exists. */
@Service()
export class Notifications {
  readonly #toasts = signal<Toast[]>([]);
  readonly toasts = this.#toasts.asReadonly();
  #nextId = 0;

  constructor() {
    merge(
      inject(ShoppingCart).itemAdded$.pipe(map((item) => `🛒 Dodano: ${item}`)),
      inject(AuthSession).loggedOut$.pipe(map((user) => `👋 ${user} wylogowany – koszyk pusty`)),
    )
      .pipe(takeUntilDestroyed())
      .subscribe((text) =>
        // Newest first, keep the last 5.
        this.#toasts.update((t) => [{ id: ++this.#nextId, text }, ...t].slice(0, 5)),
      );
  }

  dismiss(id: number): void {
    this.#toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
