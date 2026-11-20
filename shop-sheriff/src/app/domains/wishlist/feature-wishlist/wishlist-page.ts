import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormField, FormRoot, form, required, minLength } from '@angular/forms/signals';
import { PageHeader } from '../../../shared/ui';
import { WishlistItem } from './wishlist-item';
import { DEMO_SLUGS, WishlistDetails } from '../util';
import { WishlistToggle } from '../ui';
import { WishlistStore } from '../data-access';

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


// ─────────────────────────────────────────────────────────────────

/** Real slugs from shop-api. */

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
            (toggled)="wishlistStore.toggleOnList(slug)"
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
          this.detailsModel.set({name: '...', description: '', giftSlug: ''});
          this.detailsForm().reset();
        },
      },
    },
  );
}

// ### 2. Podział na warstwy (recap Sheriff)
//
// 2.1 W `feature-wishlist` leżą jeszcze `wishlist-store.ts`, `wishlist-toggle.ts` (♡), `wishlist-item.ts` i `wishlist-page.ts`. Każdy to inna warstwa. Jaka?
//   Rozdziel tak, jak zbudowane są inne domeny
// 2.2 `WishlistItem` — `ui` czy `feature`? Dlaczego?
//   2.3 `pnpm sheriff:verify` + `pnpm lint`. Co eksportuje każdy `index.ts`?
//   2.4 Modele też wynieś z plików komponentów: `WishlistDetails` (z `wishlist-page.ts`) i `WishlistProduct` (z `wishlist-item.ts`) → `util/wishlist.models.ts`.
//   `util/index.ts` — `export type { … }`. Podejrzyj jak robią to inne domeny (`catalog/util`)
