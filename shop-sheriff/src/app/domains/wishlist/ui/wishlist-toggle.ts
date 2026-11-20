// component (ui) ────────────────────────────────────────────────────────────────

import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

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
      (click)="toggled.emit()"
    >
      {{ active() ? '♥' : '♡' }}
    </button>
  `,
})
export class WishlistToggle {
  readonly active: InputSignal<boolean> = input(false);
  readonly toggled:OutputEmitterRef<void> = output<void>();
}
