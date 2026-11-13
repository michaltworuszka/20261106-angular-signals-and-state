import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

// Presentational: data in via input(), nothing injected.
@Component({
  selector: 'app-product-card',
  imports: [DecimalPipe],
  template: `
    <div class="card h-100">
      <div class="card-body">
        <h6 class="card-title">{{ name() }}</h6>
        @if (discount() > 0) {
          <span class="badge text-bg-danger mb-2">-{{ discount() }}%</span>
          <div class="text-body-secondary text-decoration-line-through small">
            {{ price() | number: '1.2-2' }} zł
          </div>
        }
        <div class="fs-5 fw-semibold">{{ finalPrice() | number: '1.2-2' }} zł</div>
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly name = input.required<string>(); // InputSignal<string>
  readonly price = input.required<number>(); // InputSignal<number>
  readonly discount = input(0); // optional, default 0 → InputSignal<number>

  // Input is a signal → derive with computed (no ngOnChanges).
  protected readonly finalPrice = computed(() => this.price() * (1 - this.discount() / 100));
}
