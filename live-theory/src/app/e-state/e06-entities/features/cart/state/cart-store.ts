import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeAllEntities,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, tap } from 'rxjs';
import { EventBus, ProductRef } from '../../../shared/events';
import { CartLine } from '../data';

/** CartLine has no `id` – its key is `productId`. One config, reused by every updater. */
const lineConfig = entityConfig({
  entity: type<CartLine>(),
  selectId: (line) => line.productId,
});

/** Cart domain (E5 `Cart` as a SignalStore with entities). */
export const CartStore = signalStore(
  { providedIn: 'root' },
  withEntities(lineConfig),
  withProps(() => ({ _bus: inject(EventBus) })),
  withComputed(({ entities }) => ({
    count: computed(() => entities().reduce((n, l) => n + l.qty, 0)),
    total: computed(() => entities().reduce((s, l) => s + l.price * l.qty, 0)),
  })),
  withMethods((store) => ({
    remove(productId: number): void {
      const line = store.entityMap()[productId];
      if (!line) {
        return;
      }
      patchState(store, removeEntity(productId));
      store._bus.publish({ type: '[Cart] Items Released', items: [{ productId, qty: line.qty }] });
    },
    checkout(): void {
      const lines = store.entities();
      if (!lines.length) {
        return;
      }
      const total = store.total();
      patchState(store, removeAllEntities());
      store._bus.publish({ type: '[Cart] Checked Out', lines, total });
    },
    _add: rxMethod<ProductRef>(
      tap(({ id, name, price }) =>
        patchState(
          store,
          store.entityMap()[id]
            ? updateEntity({ id, changes: (l) => ({ qty: l.qty + 1 }) }, lineConfig)
            : addEntity({ productId: id, name, price, qty: 1 }, lineConfig),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store._add(store._bus.on('[Products] Reserved').pipe(map((e) => e.product)));
    },
  }),
);
