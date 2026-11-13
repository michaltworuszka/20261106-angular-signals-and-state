import { Component, input } from '@angular/core';
import { ReadonlyFieldState } from '@angular/forms/signals';

/** Presentational: shows a field's errors once the user has touched it. */
@Component({
  selector: 'app-field-errors',
  template: `
    @if (state().touched() && state().invalid()) {
      @for (error of state().errors(); track error.kind) {
        <div class="invalid-feedback d-block">{{ error.message ?? error.kind }}</div>
      }
    }
  `,
})
export class FieldErrors {
  readonly state = input.required<ReadonlyFieldState<unknown>>();
}
