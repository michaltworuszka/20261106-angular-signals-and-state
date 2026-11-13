import { TestBed } from '@angular/core/testing';
import { Cart } from './cart';

describe('Cart (A3)', () => {
  describe('when the same product is added twice', () => {
    it('keeps one line with quantity 2 and sums count and total', () => {
      // given
      const cart = TestBed.inject(Cart);
      const mouse = { id: 2, name: 'Mysz', price: 49.5 };

      // when
      cart.add(mouse);
      cart.add(mouse);

      // then
      expect(cart.items()).toEqual([{ ...mouse, quantity: 2 }]);
      expect(cart.count()).toBe(2);
      expect(cart.total()).toBe(99);
    });
  });
});
