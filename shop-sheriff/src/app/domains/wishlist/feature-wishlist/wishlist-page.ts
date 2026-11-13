import { Component, Injectable, inject, signal, input, output, computed } from '@angular/core';
import { FormField, FormRoot, form, required, minLength } from '@angular/forms/signals';
import { PageHeader } from '../../../shared/ui';
import { WishlistItem } from './wishlist-item';

// ### 1. Recap: sygnały i store
//
// 1.1 `WishlistStore.slugs` to zwykła tablica. Zamień na sygnał: prywatny, zapisywalny
// 1.2 Na zewnątrz wystaw go tylko do odczytu
//   1.3 `count` — liczba ulubionych (stan pochodny). Wepnij w badge "Liked" (teraz na sztywno `0`)
// 1.4 Metody `has(slug)`, `toggle(slug)`, `remove(slug)` — bez mutowania tablicy
// 1.5 `WishlistToggle` (♡): `active` jest teraz lokalnym sygnałem. Kto powinien decydować, czy ♡ jest aktywne?
//   Zamień na wejście. Dodaj wyjście `toggled` i podepnij kliknięcie. Komponent nie zna store'a.
// 1.6 Wepnij ♡ w listę demo: stan ze store'a → wejście, kliknięcie → `toggle`
// 1.7 Sekcja "Liked" ma czytać sygnał ze store'a

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

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private _slugs = signal<string[]>([]);

  slugs = this._slugs.asReadonly();
  count = computed(() => this._slugs().length);

  toggleOnList(slug: string): void {
    this._slugs.update((sl) => (this.has(slug) ? sl.filter((s) => s !== slug) : [...sl, slug]));
  }

  has(slug: string): boolean {
    return this._slugs().includes(slug);
  }
}

// component (ui) ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-wishlist-toggle',
  template: `
    <button
      type="button"
      class="btn btn-sm"
      [class.btn-danger]="active()"
      [class.btn-outline-danger]="!active()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="active() ? 'Remove from wishlist' : 'Add to wishlist'"
      (click)="addToList.emit()"
    >
      {{ active() ? '♥' : '♡' }}
    </button>
  `,
})
export class WishlistToggle {
  readonly active = input(false);
  readonly addToList = output<void>();
}

// RUNTIME Exception - widoczny będzie w konsoli przeglądarki (f12) narzędzia DevTools
// throwError() {
//   throw new Error('!');
// }

// ─────────────────────────────────────────────────────────────────

/** Real slugs from shop-api. */
const DEMO_SLUGS = [
  'typeforge-tkl-mechanical-keyboard',
  'typeforge-75-wireless-keyboard',
  'typeforge-low-profile-keyboard',
  'typeforge-ergonomic-split-keyboard',
  'typeforge-60-compact-keyboard',
];

interface WishlistDetails {
  name: string;
  description: string;

  giftSlug: string;
}

@Component({
  selector: 'app-wishlist-page',
  imports: [PageHeader, WishlistToggle, FormField, FormRoot, WishlistItem],
  template: `
    <app-page-header title="My wishlist" subtitle="Click ♡ to like a product." />

    <ul class="list-group">
      @for (slug of demoSlugs; track slug) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          {{ slug }}
          <app-wishlist-toggle
            [active]="wishlistStore.has(slug)"
            (addToList)="wishlistStore.toggleOnList(slug)"
          />
        </li>
      }
    </ul>

    <hr />
    <h2 class="h5 mt-4">List details</h2>

    <!-- formRoot: dodaje novalidate, on submit zaznacza pola jako touched, uruchamia submission.action tylko jeśli pola valid! -->
    <form [formRoot]="detailsForm" class="vstack gap-3" style="max-width: 32rem">
      @let name = detailsForm.name();
      @let desc = detailsForm.description();
      <div>
        <label class="form-label" for="wishlist-name">Name</label>
        <input
          id="wishlist-name"
          class="form-control"
          [class.is-invalid]="name.touched() && name.invalid()"
          [class.is-valid]="name.touched() && name.valid()"
          [formField]="detailsForm.name"
        />
        @if (name.touched()) {
          @for (error of name.errors(); track error.kind) {
            <div class="invalid-feedback">{{ error.message }}</div>
          }
        }
      </div>

      <div>
        <label class="form-label" for="wishlist-description">Description</label>
        <textarea
          id="wishlist-description"
          class="form-control"
          rows="3"
          [class.is-invalid]="desc.touched() && desc.invalid()"
          [class.is-valid]="desc.touched() && desc.valid()"
          [formField]="detailsForm.description"
        ></textarea>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" [style.opacity]="detailsForm().invalid() ? 0.5 : 1" class="btn btn-primary">
          Save
        </button>
      </div>
      <!--<pre>
        {{ detailsModel() | json }}
      </pre>-->
    </form>

    <h2 class="h5 mt-4 d-flex justify-content-between">
      Liked<span class="badge text-bg-danger">{{ wishlistStore.count() }}</span>
    </h2>
    @if (wishlistStore.count()) {
      <ul class="list-group">
        @for (slug of wishlistStore.slugs(); track slug) {
          <app-wishlist-item [slug]="slug"/>
        }
      </ul>
    } @else {
      <p class="text-body-secondary">Nothing here yet.</p>
    }
  `,
})

// ### 2. Formularz — szczegóły listy (Signal Forms)
//
// Sekcja "List details": `name` jest wpięte, `description` jeszcze nie. "Save" nic nie robi.
//   Dokumentacja Signal Forms: linki w komentarzu nad modelem formularza w `WishlistPage`.
//
// 2.1 Wepnij `description` — analogicznie do `name`
// 2.2 W store: `details` (tylko do odczytu) + `saveDetails(details)`
// 2.3 Model formularza ≠ store. Model to lokalna kopia robocza — pisanie nie zmienia store'a dopóki nie klikniemy "Save".
// Model startuje z wartości zapisanych w store
// 2.4 "Save" → zapis do store'a. Uwaga na komentarz przy `<form>`: kiedy wykona się zapis?
// Gotowy formularz z tym samym API: `backoffice/feature-stock/new-product-form`
export class WishlistPage {
  protected readonly wishlistStore = inject(WishlistStore);
  protected readonly demoSlugs = DEMO_SLUGS;

  // Signal Forms docs: https://angular.dev/guide/forms/signals/overview
  //   model:      https://angular.dev/guide/forms/signals/models
  //   validation: https://angular.dev/guide/forms/signals/validation  (async: …/async-operations)
  //   submit:     https://angular.dev/guide/forms/signals/form-submission
  private readonly detailsModel = signal<WishlistDetails>({
    name: '',
    description: '',
    giftSlug: '',
  });

  protected readonly detailsForm = form(
    this.detailsModel,
    (p) => {
      required(p.name, { message: 'Name is required' });
      minLength(p.description, 5, { message: 'Description must be at least 5 characters' });
    },
    {
      submission: {
        action: async () => {
          console.log(this.detailsModel());
        },
      },
    },
  );
}
