import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import { prependEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';
import { EventBus, EventOf } from '../../../shared/events';
import { Order } from '../data';

/** Orders domain – only listens. */
export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withEntities<Order>(),
  withMethods((store) => ({
    _place: rxMethod<EventOf<'[Cart] Checked Out'>>(
      tap(({ lines, total }) =>
        patchState(
          store,
          // prependEntity → newest first (ids order = display order).
          prependEntity({
            id: store.ids().length + 1,
            items: lines.reduce((n, l) => n + l.qty, 0),
            total,
          }),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store._place(inject(EventBus).on('[Cart] Checked Out'));
    },
  }),
);
