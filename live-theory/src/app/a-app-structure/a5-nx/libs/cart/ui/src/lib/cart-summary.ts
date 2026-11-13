import { Component, input, output } from '@angular/core';
import { PricePipe } from '@shop/shared/ui';

@Component({
  selector: 'app-a5-cart-summary',
  imports: [PricePipe],
  template: `
    <div class="card">
      <div class="card-body">
        <div>
          Koszyk: <strong>{{ count() }}</strong> szt.
        </div>
        <div>
          Razem: <strong>{{ total() | price }}</strong>
        </div>
        <button
          class="btn btn-sm btn-outline-danger mt-2"
          type="button"
          [disabled]="count() === 0"
          (click)="clear.emit()"
        >
          wyczyść
        </button>
      </div>
    </div>
  `,
})
export class CartSummary {
  readonly count = input.required<number>();
  readonly total = input.required<number>();
  readonly clear = output();
}
