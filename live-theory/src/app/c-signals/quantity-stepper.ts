import { Component, input, output } from '@angular/core';

// Presentational: state comes in (input), events go out (output). It never changes state itself.
@Component({
  selector: 'app-quantity-stepper',
  template: `
    <div class="d-inline-flex align-items-center gap-2 text-nowrap">
      <button
        class="btn btn-sm btn-outline-warning"
        type="button"
        [disabled]="quantity() <= 1"
        (click)="quantityChange.emit(quantity() - 1)"
      >
        -
      </button>
      <code>{{ quantity() }}</code>
      <button
        class="btn btn-sm btn-outline-success"
        type="button"
        (click)="quantityChange.emit(quantity() + 1)"
      >
        +
      </button>
      <button class="btn btn-sm btn-outline-danger" type="button" (click)="removed.emit()">
        usuń
      </button>
    </div>
  `,
})
export class QuantityStepper {
  readonly quantity = input.required<number>();

  readonly quantityChange = output<number>(); // OutputEmitterRef<number> – NOT a signal
  readonly removed = output(); // OutputEmitterRef<void>
}
