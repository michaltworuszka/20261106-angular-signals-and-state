import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, merge, Subject, tap } from 'rxjs';

/**
 * E06 – E04 rebuilt with NgRx SignalStore. Same three services, same RxJS events.
 *
 * Mapping from E04:
 *   private signal + asReadonly   → withState      (state is protected: patchState only inside)
 *   computed                      → withComputed
 *   methods                       → withMethods
 *   private Subject / non-state   → withProps      (`_` prefix = private, not visible outside)
 *   constructor + subscribe       → withHooks.onInit + rxMethod (auto-unsubscribe)
 */

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState({ user: 'Ala' as string | null }),
  withProps(() => ({ _loggedOut: new Subject<string>() })),
  withProps(({ _loggedOut }) => ({ loggedOut$: _loggedOut.asObservable() })),
  withMethods((store) => ({
    login(name: string): void {
      patchState(store, { user: name });
    },
    logout(): void {
      const user = store.user();
      if (!user) {
        return;
      }
      patchState(store, { user: null });
      store._loggedOut.next(user);
    },
  })),
);

export const ShoppingCartStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as string[],
    // ❌ "event as signal" – kept only to compare in the demo (same as E04).
    lastAdded: null as string | null,
  }),
  withProps(() => ({ _itemAdded: new Subject<string>() })),
  withProps(({ _itemAdded }) => ({ itemAdded$: _itemAdded.asObservable() })),
  withComputed(({ items }) => ({ count: computed(() => items().length) })),
  withMethods((store) => ({
    add(item: string): void {
      patchState(store, (s) => ({ items: [...s.items, item], lastAdded: item }));
      store._itemAdded.next(item);
    },
    // rxMethod: accepts a value, a signal OR an observable; unsubscribes with the store.
    _clearOn: rxMethod<unknown>(tap(() => patchState(store, { items: [] }))),
  })),
  withHooks({
    // Hooks run in an injection context → inject() works here.
    onInit(store) {
      store._clearOn(inject(SessionStore).loggedOut$);
    },
  }),
);

export interface Toast {
  id: number;
  text: string;
}

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState({ toasts: [] as Toast[], nextId: 1 }),
  withMethods((store) => ({
    dismiss(id: number): void {
      patchState(store, (s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
    _push: rxMethod<string>(
      tap((text) =>
        patchState(store, (s) => ({
          // Newest first, keep the last 5.
          toasts: [{ id: s.nextId, text }, ...s.toasts].slice(0, 5),
          nextId: s.nextId + 1,
        })),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store._push(
        merge(
          inject(ShoppingCartStore).itemAdded$.pipe(map((item) => `🛒 Dodano: ${item}`)),
          inject(SessionStore).loggedOut$.pipe(
            map((user) => `👋 ${user} wylogowany – koszyk pusty`),
          ),
        ),
      );
    },
  }),
);
