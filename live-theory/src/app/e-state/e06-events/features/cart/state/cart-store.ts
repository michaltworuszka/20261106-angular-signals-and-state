import { computed, inject } from '@angular/core';
import { signalStore, type, withComputed } from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeAllEntities,
  removeEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Events, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { filter, map } from 'rxjs';
import { cartEvents, cartPageEvents, productsEvents } from '../../../shared/events';
import { CartLine } from '../data';

const lineConfig = entityConfig({
  entity: type<CartLine>(),
  selectId: (line) => line.productId,
});

/** Cart domain. Reducers = state transitions, handlers = decisions that emit domain events. */
export const CartStore = signalStore(
  { providedIn: 'root' },
  withEntities(lineConfig),
  withComputed(({ entities }) => ({
    count: computed(() => entities().reduce((n, l) => n + l.qty, 0)),
    total: computed(() => entities().reduce((s, l) => s + l.price * l.qty, 0)),
  })),
  withReducer(
    on(productsEvents.reserved, ({ payload: { id, name, price } }, state) =>
      state.entityMap[id]
        ? updateEntity({ id, changes: (l) => ({ qty: l.qty + 1 }) }, lineConfig)
        : addEntity({ productId: id, name, price, qty: 1 }, lineConfig),
    ),
    on(cartEvents.itemsReleased, ({ payload }) => removeEntities(payload.map((i) => i.productId))),
    on(cartEvents.checkedOut, () => removeAllEntities()),
  ),
  withEventHandlers((store, events = inject(Events)) => ({
    // Click carries only the id – the store knows the qty.
    release$: events.on(cartPageEvents.removeClicked).pipe(
      map(({ payload: productId }) => store.entityMap()[productId]),
      filter((line): line is CartLine => !!line),
      map(({ productId, qty }) => cartEvents.itemsReleased([{ productId, qty }])),
    ),
    // Reads lines BEFORE the `checkedOut` reducer clears them.
    checkout$: events.on(cartPageEvents.checkoutClicked).pipe(
      filter(() => store.count() > 0),
      map(() => cartEvents.checkedOut({ lines: store.entities(), total: store.total() })),
    ),
  })),
);
