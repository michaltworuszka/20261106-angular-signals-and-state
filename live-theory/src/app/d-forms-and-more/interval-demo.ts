import { Component, inject, Service, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, share, tap } from 'rxjs';

/** One shared (hot) clock for the whole demo. Instrumented so we can SEE the interval start/stop. */
@Service({ autoProvided: false })
export class TickSource {
  /** Is the underlying `interval` running? (= has share() any subscriber?) */
  readonly running = signal(false);
  readonly log = signal<string[]>([]);

  readonly ticks$ = interval(1000).pipe(
    tap({
      subscribe: () => this.#write('▶ interval START (pierwszy subskrybent)', true),
      finalize: () => this.#write('■ interval STOP (refCount = 0)', false),
    }),
    share(), // hot: ONE interval for all subscribers; unsubscribes from source at refCount 0
  );

  #write(entry: string, running: boolean): void {
    this.running.set(running);
    this.log.update((l) =>
      [`${new Date().toLocaleTimeString('pl-PL')} ${entry}`, ...l].slice(0, 6),
    );
  }
}

/** A: classic RxJS in the template – async pipe subscribes and unsubscribes on destroy. */
@Component({
  selector: 'app-tick-async',
  imports: [AsyncPipe],
  template: `
    <div class="card h-100">
      <div class="card-header">A: <code>ticks$ | async</code></div>
      <div class="card-body display-6">{{ (ticks$ | async) ?? '–' }}</div>
    </div>
  `,
})
export class TickAsync {
  protected readonly ticks$ = inject(TickSource).ticks$;
}

/** B: same stream as a signal – toSignal() unsubscribes via DestroyRef. */
@Component({
  selector: 'app-tick-signal',
  template: `
    <div class="card h-100">
      <div class="card-header">B: <code>toSignal(ticks$)</code></div>
      <div class="card-body display-6">{{ ticks() ?? '–' }}</div>
    </div>
  `,
})
export class TickSignal {
  protected readonly ticks = toSignal(inject(TickSource).ticks$, { initialValue: null });
}

@Component({
  selector: 'app-interval-demo',
  imports: [TickAsync, TickSignal],
  providers: [TickSource],
  template: `
    <div class="d-flex flex-wrap gap-4 align-items-center mb-2">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="show-a"
          [checked]="showA()"
          (change)="showA.set(!showA())"
        />
        <label class="form-check-label" for="show-a">A (async)</label>
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="show-b"
          [checked]="showB()"
          (change)="showB.set(!showB())"
        />
        <label class="form-check-label" for="show-b">B (toSignal)</label>
      </div>
      <span class="small">
        interval:
        @if (source.running()) {
          <span class="badge text-bg-success">działa</span>
        } @else {
          <span class="badge text-bg-secondary">zatrzymany</span>
        }
      </span>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        @if (showA()) {
          <app-tick-async />
        } @else {
          <div class="card h-100 text-body-secondary">
            <div class="card-body">A zniszczony → odsubskrybowany</div>
          </div>
        }
      </div>
      <div class="col-md-6">
        @if (showB()) {
          <app-tick-signal />
        } @else {
          <div class="card h-100 text-body-secondary">
            <div class="card-body">B zniszczony → odsubskrybowany</div>
          </div>
        }
      </div>
    </div>

    <ul class="list-group list-group-flush small font-monospace mt-2">
      @for (entry of source.log(); track $index) {
        <li class="list-group-item py-1">{{ entry }}</li>
      }
    </ul>
  `,
})
export class IntervalDemo {
  protected readonly source = inject(TickSource);
  protected readonly showA = signal(true);
  protected readonly showB = signal(true);
}
