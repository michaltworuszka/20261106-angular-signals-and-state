import { TestBed } from '@angular/core/testing';
import { AuthSession, Notifications, ShoppingCart } from './e04-services';

describe('E04 – services talking via RxJS events', () => {
  describe('when the user logs out', () => {
    it('clears the cart and notifies, although the session knows neither', () => {
      // given
      const session = TestBed.inject(AuthSession);
      const cart = TestBed.inject(ShoppingCart);
      const notifications = TestBed.inject(Notifications);
      cart.add('Jabłko');

      // when
      session.logout();

      // then
      expect(cart.items()).toEqual([]);
      expect(notifications.toasts().map((t) => t.text)).toEqual([
        '👋 Ala wylogowany – koszyk pusty',
        '🛒 Dodano: Jabłko',
      ]);
    });
  });

  describe('when the same item is added twice', () => {
    it('delivers both events via the Subject; the signal only holds the last value', () => {
      // given
      const cart = TestBed.inject(ShoppingCart);
      const heard: string[] = [];
      cart.itemAdded$.subscribe((item) => heard.push(item));

      // when
      cart.add('Jabłko');
      cart.add('Jabłko');

      // then
      expect(heard).toEqual(['Jabłko', 'Jabłko']);
      expect(cart.lastAdded()).toBe('Jabłko'); // same value twice → signal did not change
    });
  });
});
