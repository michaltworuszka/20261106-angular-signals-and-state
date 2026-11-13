import { TestBed } from '@angular/core/testing';
import { NotificationsStore, SessionStore, ShoppingCartStore } from './e06-signal-store-stores';

describe('E06 – SignalStores talking via RxJS events', () => {
  describe('when the user logs out', () => {
    it('clears the cart and notifies, although the session knows neither', () => {
      // given
      const session = TestBed.inject(SessionStore);
      const cart = TestBed.inject(ShoppingCartStore);
      const notifications = TestBed.inject(NotificationsStore);
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
      const cart = TestBed.inject(ShoppingCartStore);
      const heard: string[] = [];
      cart.itemAdded$.subscribe((item) => heard.push(item));

      // when
      cart.add('Jabłko');
      cart.add('Jabłko');

      // then
      expect(heard).toEqual(['Jabłko', 'Jabłko']);
      expect(cart.count()).toBe(2);
      expect(cart.lastAdded()).toBe('Jabłko');
    });
  });
});
