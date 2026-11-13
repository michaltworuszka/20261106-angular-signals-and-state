import { TestBed } from '@angular/core/testing';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { cartEvents, productsEvents, productsPageEvents } from '../../../shared/events';
import { StockStore } from './stock-store';

describe('StockStore (E6, NgRx events)', () => {
  function setup() {
    const dispatcher = TestBed.inject(Dispatcher);
    const reserved: number[] = [];
    TestBed.inject(Events)
      .on(productsEvents.reserved)
      .subscribe(({ payload }) => reserved.push(payload.id));
    const stock = TestBed.inject(StockStore);
    return { dispatcher, stock, reserved };
  }

  describe('when add to cart is clicked', () => {
    it('reserves while in stock and ignores clicks at zero stock', () => {
      // given
      const { dispatcher, stock, reserved } = setup(); // Monitor (id 3): stock 1

      // when
      dispatcher.dispatch(productsPageEvents.addToCartClicked(3));
      dispatcher.dispatch(productsPageEvents.addToCartClicked(3)); // now 0 → ignored

      // then
      expect(reserved).toEqual([3]);
      expect(stock.entityMap()[3].stock).toBe(0);
    });
  });

  describe('when the cart releases items', () => {
    it('restocks the product', () => {
      // given
      const { dispatcher, stock } = setup(); // Klawiatura (id 1): stock 3

      // when
      dispatcher.dispatch(cartEvents.itemsReleased([{ productId: 1, qty: 2 }]));

      // then
      expect(stock.entityMap()[1].stock).toBe(5);
    });
  });
});
