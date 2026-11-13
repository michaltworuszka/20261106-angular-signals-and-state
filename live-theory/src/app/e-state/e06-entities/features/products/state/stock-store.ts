import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withProps } from '@ngrx/signals';
import { setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, tap } from 'rxjs';
import { EventBus } from '../../../shared/events';
import { Product, PRODUCTS } from '../data';

/** Products domain (E5 `Stock` as a SignalStore with entities). Knows nothing about cart. */
export const StockStore = signalStore(
  { providedIn: 'root' },
  // Product has `id` → no config needed. Gives: entities(), entityMap(), ids().
  withEntities<Product>(),
  withProps(() => ({ _bus: inject(EventBus) })),
  withMethods((store) => ({
    reserve(id: number): void {
      const product = store.entityMap()[id]; // O(1) lookup instead of find()
      if (!product?.stock) {
        return;
      }
      patchState(store, updateEntity({ id, changes: (p) => ({ stock: p.stock - 1 }) }));
      const { name, price } = product;
      store._bus.publish({ type: '[Products] Reserved', product: { id, name, price } });
    },
    _restock: rxMethod<{ productId: number; qty: number }[]>(
      tap((items) =>
        // patchState takes many updaters – one per released line.
        patchState(
          store,
          ...items.map(({ productId, qty }) =>
            updateEntity<Product>({ id: productId, changes: (p) => ({ stock: p.stock + qty }) }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      patchState(store, setAllEntities(PRODUCTS));
      store._restock(store._bus.on('[Cart] Items Released').pipe(map((e) => e.items)));
    },
  }),
);
