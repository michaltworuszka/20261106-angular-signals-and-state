import { Component, Injectable, inject, signal, input, output } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/ui';

// data-access ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private _slugs: string[] = [
    'typeforge-tkl-mechanical-keyboard',
    'typeforge-75-wireless-keyboard',
  ];

  get slugs(): readonly string[] {
    return this._slugs;
  }

  toggleOnList(slug: string) {
    if(this.has(slug)) {
      this._slugs = this._slugs.filter((s) => s !== slug);
    } else {
      this._slugs.push(slug);
    }
  }

  has(lookFor: string): boolean {
    return this._slugs.includes(lookFor)
  }
}

// const myStore = new WishlistStore();
//
// myStore.slugs.push()

// component (/ui) ────────────────────────────────────────────────────────────────

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
  // @Input()
  readonly active = input(false);
  // @Output()
  readonly addToList = output<void>()
}

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
}

@Component({
  selector: 'app-wishlist-page',
  imports: [PageHeader, RouterLink, WishlistToggle, FormField, FormRoot],
  template: `
    <app-page-header title="My wishlist" subtitle="Click ♡ to like a product." />

    <ul class="list-group">
      @for (slug of demoSlugs; track slug) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          {{ slug }}
          <app-wishlist-toggle [active]="wishlist.has(slug)" (addToList)="wishlist.toggleOnList(slug)" />
        </li>
      }
    </ul>

    <hr />
    <h2 class="h5 mt-4">List details</h2>

    <!-- formRoot: dodaje novalidate, on submit zaznacza pola jako touched, uruchamia submission.action tylko jeśli pola valid! -->
    <form [formRoot]="detailsForm" class="vstack gap-3" style="max-width: 32rem">
      @let name = detailsForm.name();
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
        <textarea id="wishlist-description" class="form-control" rows="3"></textarea>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>

    <h2 class="h5 mt-4 d-flex justify-content-between">
      Liked<span class="badge text-bg-danger">0</span>
    </h2>
    @if (wishlist.slugs.length) {
      <ul class="list-group">
        @for (slug of wishlist.slugs; track slug) {
          <li class="list-group-item d-flex justify-content-between">
            <a [routerLink]="['/products', slug]">{{ slug }}</a>
          </li>
        }
      </ul>
    } @else {
      <p class="text-body-secondary">Nothing here yet.</p>
    }
  `,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistStore);
  protected readonly demoSlugs = DEMO_SLUGS;

  // Signal Forms docs: https://angular.dev/guide/forms/signals/overview
  //   model:      https://angular.dev/guide/forms/signals/models
  //   validation: https://angular.dev/guide/forms/signals/validation  (async: …/async-operations)
  //   submit:     https://angular.dev/guide/forms/signals/form-submission
  private readonly detailsModel = signal<WishlistDetails>({ name: '', description: '' });

  protected readonly detailsForm = form(this.detailsModel, (p) => {
    required(p.name, { message: 'Name is required' });
  });
}
