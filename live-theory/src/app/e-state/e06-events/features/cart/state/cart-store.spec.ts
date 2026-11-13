import { TestBed } from '@angular/core/testing';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { cartEvents, cartPageEvents, productsEvents } from '../../../shared/events';
import { CartStore } from './cart-store';

// Same scenarios as E5/E6-entities – input = dispatched events, output = state + emitted events.
describe('CartStore (E6, NgRx events)', () => {
  function setup() {
    const dispatcher = TestBed.inject(Dispatcher);
    const emitted: string[] = [];
    TestBed.inject(Events)
      .on()
      .subscribe((e) => emitted.push(e.type));
    const cart = TestBed.inject(CartStore);
    return { dispatcher, cart, emitted };
  }

  const mouse = { id: 2, name: 'Mysz', price: 49.5 };

  describe('when products.reserved is dispatched', () => {
    it('adds a line, then increments its qty', () => {
      // given
      const { dispatcher, cart } = setup();

      // when
      dispatcher.dispatch(productsEvents.reserved(mouse));
      dispatcher.dispatch(productsEvents.reserved(mouse));

      // then
      expect(cart.entityMap()[2]).toEqual({ productId: 2, name: 'Mysz', price: 49.5, qty: 2 });
      expect(cart.total()).toBe(99);
    });
  });

  describe('when remove is clicked', () => {
    it('emits itemsReleased and removes the line', () => {
      // given
      const { dispatcher, cart, emitted } = setup();
      dispatcher.dispatch(productsEvents.reserved(mouse));

      // when
      dispatcher.dispatch(cartPageEvents.removeClicked(2));

      // then
      expect(cart.entities()).toEqual([]);
      expect(emitted).toContain(cartEvents.itemsReleased.type);
    });
  });

  describe('when checkout is clicked', () => {
    it('emits checkedOut with the total and empties the cart', () => {
      // given
      const { dispatcher, cart } = setup();
      const checkedOut: number[] = [];
      TestBed.inject(Events)
        .on(cartEvents.checkedOut)
        .subscribe(({ payload }) => checkedOut.push(payload.total));
      dispatcher.dispatch(productsEvents.reserved(mouse));

      // when
      dispatcher.dispatch(cartPageEvents.checkoutClicked());

      // then
      expect(checkedOut).toEqual([49.5]);
      expect(cart.count()).toBe(0);
    });
  });
});
