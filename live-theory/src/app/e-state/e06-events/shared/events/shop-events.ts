import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

/**
 * The contract between domains – E5's AppEvent union, now as NgRx event groups.
 * type string = `[source] name`, e.g. '[Cart] checkedOut'.
 *
 * Two kinds (Flux convention):
 * - "Page" events – what the USER did (dispatched by components, no logic).
 * - domain events – what the DOMAIN decided (emitted by event handlers in stores).
 */

export interface ProductRef {
  id: number;
  name: string;
  price: number;
}

export interface SoldLine {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export const productsPageEvents = eventGroup({
  source: 'Products Page',
  events: { addToCartClicked: type<number>() },
});

export const productsEvents = eventGroup({
  source: 'Products',
  events: { reserved: type<ProductRef>() },
});

export const cartPageEvents = eventGroup({
  source: 'Cart Page',
  events: {
    removeClicked: type<number>(),
    checkoutClicked: type<void>(),
  },
});

export const cartEvents = eventGroup({
  source: 'Cart',
  events: {
    itemsReleased: type<{ productId: number; qty: number }[]>(),
    checkedOut: type<{ lines: SoldLine[]; total: number }>(),
  },
});
