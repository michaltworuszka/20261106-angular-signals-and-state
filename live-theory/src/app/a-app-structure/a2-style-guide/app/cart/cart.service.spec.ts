import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

// Test next to the code, same base name + .spec.
describe('CartService', () => {
  describe('when the same product is added twice', () => {
    it('keeps one line with quantity 2 and sums count and total', () => {
      // given
      const cart = TestBed.inject(CartService);
      const mouse = { id: 2, name: 'Mysz', price: 49.5 };

      // when
      cart.add(mouse);
      cart.add(mouse);

      // then
      expect(cart.items()).toEqual([{ product: mouse, quantity: 2 }]);
      expect(cart.count()).toBe(2);
      expect(cart.total()).toBe(99);
    });
  });
});
