import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

// data access ────────────────────────────────────────────────────────────────

// @Injectable({ providedIn: 'root' })
// export class WishlistStore {
//   private _slugs: string[] = [];
//
//   get slugs(): string[] {
//     return this._slugs;
//   }
//
//   toggleOnList(slug: string): void {
//     if(this.has(slug)) {
//       this._slugs = this._slugs.filter(s => s !== slug);
//     } else {
//       this._slugs.push(slug);
//     }
//   }
//
//   has(slug: string): boolean {
//     return this._slugs.includes(slug);
//   }
//
//   get count(): number {
//     return this._slugs.length;
//   }
// }

// RUNTIME Exception - widoczny będzie w konsoli przeglądarki (f12) narzędzia DevTools
// throwError() {
//   throw new Error('!');
// }

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private _slugs: WritableSignal<string[]> = signal<string[]>([]);

  slugs: Signal<string[]> = this._slugs.asReadonly();
  count: Signal<number> = computed(() => this._slugs().length);

  toggleOnList(slug: string): void {
    this._slugs.update((sl) => (this.has(slug) ? sl.filter((s) => s !== slug) : [...sl, slug]));
  }

  has(slug: string): boolean {
    return this._slugs().includes(slug);
  }
}

// ### 3. Formularz, zapis do Store
//
//   3.1 W `WishlistStore`, przygotuj zapis formularza `saveDetails(details)`
// 3.2 W `WishlistStore`, przygotuj sygnał (tylko do odczytu) jako np.: `details()`
// 3.3 Podłącz zapis, "Save" → `saveDetails` w `submission.action` (teraz `console.log`).



// ### 1. Przygotowanie podziału
//
// 1.1 Przenieś `WishlistStore` do osobnego pliku `wishlist-store.ts` (na razie ten sam folder)
// 1.2 Przygotuj miejsce w pliku na komponent `pnpm ng g c domains/wishlist/feature-wishlist/wishlist-toggle --flat -s -t -d` jako osobny (`-s -t` - inline template, inline style; `-d` = dry-run: tylko podgląd, potem uruchom bez `-d`). Przenieś kod `WishlistToggle`, upewnij sie, że `selector` ten sam. Użyj nowego komponentu.
// 1.3 Emitowany output event `addToList` - refaktoryzuj, nazwij je zdarzeniem: `toggled` - to bardziej adekwatne, ponieważ raz button robi "remove" a raz "add".
