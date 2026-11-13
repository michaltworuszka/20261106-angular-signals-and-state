import { signalStore } from '@ngrx/signals';
import { prependEntity, withEntities } from '@ngrx/signals/entities';
import { on, withReducer } from '@ngrx/signals/events';
import { cartEvents } from '../../../shared/events';
import { Order } from '../data';

/** Orders domain – one reducer, nothing else. Added without touching cart. */
export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withEntities<Order>(),
  withReducer(
    on(cartEvents.checkedOut, ({ payload: { lines, total } }, state) =>
      prependEntity({
        id: state.ids.length + 1,
        items: lines.reduce((n, l) => n + l.qty, 0),
        total,
      }),
    ),
  ),
);
