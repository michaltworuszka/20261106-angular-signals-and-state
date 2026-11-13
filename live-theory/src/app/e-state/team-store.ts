import { computed, inject, Service, signal } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

/** Root singleton – ONE instance shared by every component tree. */
@Service()
export class ActivityLog {
  readonly #entries = signal<string[]>([]);
  readonly entries = this.#entries.asReadonly();

  write(entry: string): void {
    // Newest first, keep the last 8.
    this.#entries.update((e) =>
      [`${new Date().toLocaleTimeString('pl-PL')} ${entry}`, ...e].slice(0, 8),
    );
  }
}

let instances = 0;

/**
 * NOT auto-provided: a component must list it in `providers`.
 * Every such component gets its OWN instance, shared by all its descendants.
 * Forgetting `providers` → NG0201 (No provider) instead of a silent global singleton.
 */
@Service({ autoProvided: false })
export class TeamStore {
  readonly #log = inject(ActivityLog); // resolved further up – in root

  /** Proof which instance we talk to. */
  readonly instanceId = ++instances;

  readonly #tasks = signal<Task[]>([
    { id: 1, title: 'Przegląd PR', done: false },
    { id: 2, title: 'Daily', done: true },
  ]);
  readonly tasks = this.#tasks.asReadonly();
  readonly doneCount = computed(() => this.#tasks().filter((t) => t.done).length);

  add(title: string): void {
    this.#tasks.update((tasks) => [...tasks, { id: Date.now(), title, done: false }]);
    this.#log.write(`TeamStore #${this.instanceId}: dodano „${title}”`);
  }

  toggle(id: number): void {
    this.#tasks.update((tasks) => tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    this.#log.write(`TeamStore #${this.instanceId}: przełączono zadanie`);
  }
}
