import { inject } from '@angular/core';
import { patchState, signalStore, withHooks } from '@ngrx/signals';
import { setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Events, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { filter, map } from 'rxjs';
import { cartEvents, productsEvents, productsPageEvents } from '../../../shared/events';
import { Product, PRODUCTS } from '../data';

/**
 * Products domain. No public methods – the store only REACTS to events:
 * - withEventHandlers: user clicked → check stock → emit domain event `reserved`
 * - withReducer: pure state transitions for `reserved` and `cart.itemsReleased`
 */
export const StockStore = signalStore(
  { providedIn: 'root' },
  withEntities<Product>(),
  withReducer(
    on(productsEvents.reserved, ({ payload }) =>
      updateEntity<Product>({ id: payload.id, changes: (p) => ({ stock: p.stock - 1 }) }),
    ),
    // A reducer may return several updaters.
    on(cartEvents.itemsReleased, ({ payload }) =>
      payload.map(({ productId, qty }) =>
        updateEntity<Product>({ id: productId, changes: (p) => ({ stock: p.stock + qty }) }),
      ),
    ),
  ),
  withEventHandlers((store, events = inject(Events)) => ({
    // An event returned from a handler is dispatched automatically.
    reserve$: events.on(productsPageEvents.addToCartClicked).pipe(
      map(({ payload: id }) => store.entityMap()[id]),
      filter((p): p is Product => !!p?.stock),
      map(({ id, name, price }) => productsEvents.reserved({ id, name, price })),
    ),
  })),
  withHooks({
    onInit(store) {
      patchState(store, setAllEntities(PRODUCTS));
    },
  }),
);
