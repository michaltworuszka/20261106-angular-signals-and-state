import { TestBed } from '@angular/core/testing';
import { AppEvent, EventBus } from '../../../shared/events';
import { CartStore } from './cart-store';

// Same scenarios as E5 – only the store changed. Behaviour stays, API: entities() / entityMap().
describe('CartStore (E6, entities)', () => {
  function setup() {
    const bus = TestBed.inject(EventBus);
    const published: AppEvent[] = [];
    bus.events$.subscribe((e) => published.push(e));
    const cart = TestBed.inject(CartStore); // onInit subscribes
    return { bus, cart, published };
  }

  const mouse = { id: 2, name: 'Mysz', price: 49.5 };

  describe('when products publishes "Reserved"', () => {
    it('keeps one line per productId and sums the total', () => {
      // given
      const { bus, cart } = setup();

      // when
      bus.publish({ type: '[Products] Reserved', product: mouse });
      bus.publish({ type: '[Products] Reserved', product: mouse });

      // then
      expect(cart.ids()).toEqual([2]);
      expect(cart.entityMap()[2]).toEqual({ productId: 2, name: 'Mysz', price: 49.5, qty: 2 });
      expect(cart.total()).toBe(99);
    });
  });

  describe('when a line is removed', () => {
    it('publishes "Items Released" with its qty', () => {
      // given
      const { bus, cart, published } = setup();
      bus.publish({ type: '[Products] Reserved', product: mouse });

      // when
      cart.remove(2);

      // then
      expect(cart.entities()).toEqual([]);
      expect(published.at(-1)).toEqual({
        type: '[Cart] Items Released',
        items: [{ productId: 2, qty: 1 }],
      });
    });
  });

  describe('when checking out', () => {
    it('publishes "Checked Out" with the total and empties the cart', () => {
      // given
      const { bus, cart, published } = setup();
      bus.publish({ type: '[Products] Reserved', product: mouse });

      // when
      cart.checkout();

      // then
      expect(cart.count()).toBe(0);
      expect(published.at(-1)).toMatchObject({ type: '[Cart] Checked Out', total: 49.5 });
    });
  });
});
