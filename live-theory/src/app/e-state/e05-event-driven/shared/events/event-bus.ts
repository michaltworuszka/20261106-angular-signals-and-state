import { Service } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { AppEvent, AppEventType, EventOf } from './app-events';

/** Pub-sub: publishers and subscribers know the bus + the contract, never each other. */
@Service()
export class EventBus {
  readonly #events = new Subject<AppEvent>();

  /** Every event – for logging / devtools. */
  readonly events$ = this.#events.asObservable();

  publish(event: AppEvent): void {
    this.#events.next(event);
  }

  /** Typed subscription: `on('[Cart] Checked Out')` → payload has `lines` and `total`. */
  on<T extends AppEventType>(type: T): Observable<EventOf<T>> {
    return this.events$.pipe(filter((e): e is EventOf<T> => e.type === type));
  }
}
