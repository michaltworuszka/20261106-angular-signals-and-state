import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VegetableStore } from './vegetable-store';

@Component({
  selector: 'app-c16-signal-communication-for-long-distance',
  imports: [FormsModule],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      C16 – signal-communication-for-long-distance
    </header>
    <div class="card border-primary mb-3">
      <div class="card-header text-bg-primary">
        Lista warzyw ({{ vegetableStore.numberOfVegetables() }})
      </div>
      <ul class="list-group list-group-flush">
        <!-- $index: the same vegetable can be added twice -->
        @for (vegetable of vegetableStore.vegetables(); track $index) {
          <li class="list-group-item">{{ vegetable }}</li>
        } @empty {
          <li class="list-group-item text-body-secondary">brak warzyw</li>
        }
      </ul>
    </div>
    <div class="d-flex flex-wrap gap-2">
      <select class="form-select w-auto" aria-label="Warzywo" [(ngModel)]="newVegetable">
        <option>onion</option>
        <option>garlic</option>
        <option>tomato</option>
        <option>potato</option>
      </select>
      <button class="btn btn-primary" type="button" (click)="vegetableStore.add(newVegetable())">
        add {{ newVegetable() }}...
      </button>
      <button class="btn btn-danger" type="button" (click)="vegetableStore.removeAll()">
        Remove all
      </button>
    </div>

    <blockquote class="mt-5 border-start border-4 border-primary ps-3">
      <p>
        Komunikacja między komponentami w Angularze może być realizowana na kilka sposobów, a jednym
        z nich jest użycie <code>signal</code> w środku <code>service</code>.
      </p>
      <p class="mb-0">
        Wyobraź sobie inny komponent, który nie jest w relacji
        <em>parent - child</em> w stosunku do komponentu
        <code>C16SignalCommunicationForLongDistance</code>, może on również korzystać z globalnie
        dostępnego (singleton) serwisu <code>VegetableStore</code>. Serwis ten może informować
        dowolny komponent o zmianach. Wystarczy, że zainteresowany komponent wstrzyknie serwis
        <code>VegetableStore</code> i będzie mógł korzystać z jego metod oraz obserwować zmiany w
        liście warzyw.
      </p>
    </blockquote>
  `,
})
export class C16SignalCommunicationForLongDistance {
  protected readonly vegetableStore = inject(VegetableStore);
  // Two-way binding [(ngModel)] works directly with a WritableSignal.
  protected readonly newVegetable = signal('onion');
}
