import { TestBed } from '@angular/core/testing';
import { AppEvent, EventBus } from '../../../shared/events';
import { Cart } from './cart';

// Cart tested in isolation: the other domains are replaced by events on the bus.
describe('Cart (E5, event-driven)', () => {
  function setup() {
    const bus = TestBed.inject(EventBus);
    const published: AppEvent[] = [];
    bus.events$.subscribe((e) => published.push(e));
    const cart = TestBed.inject(Cart); // subscribes in constructor
    return { bus, cart, published };
  }

  const mouse = { id: 2, name: 'Mysz', price: 49.5 };

  describe('when products publishes "Reserved"', () => {
    it('adds a line per product and sums the total', () => {
      // given
      const { bus, cart } = setup();

      // when
      bus.publish({ type: '[Products] Reserved', product: mouse });
      bus.publish({ type: '[Products] Reserved', product: mouse });

      // then
      expect(cart.lines()).toEqual([{ productId: 2, name: 'Mysz', price: 49.5, qty: 2 }]);
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
      expect(cart.lines()).toEqual([]);
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
