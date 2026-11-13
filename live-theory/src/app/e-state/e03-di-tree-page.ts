import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityLog, Task, TeamStore } from './team-store';

// All components below inject TeamStore themselves – nothing is passed down via input().

@Component({
  selector: 'app-team-header',
  template: `
    <span>Gotowe: {{ store.doneCount() }} / {{ store.tasks().length }}</span>
    <code class="badge text-bg-dark">TeamStore #{{ store.instanceId }}</code>
  `,
  host: { class: 'd-flex justify-content-between align-items-center' },
})
export class TeamHeader {
  protected readonly store = inject(TeamStore);
}

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  template: `
    <form class="input-group input-group-sm" (submit)="add($event)">
      <input
        class="form-control"
        placeholder="Nowe zadanie"
        aria-label="Nowe zadanie"
        name="title"
        [(ngModel)]="title"
      />
      <button class="btn btn-primary" type="submit" [disabled]="!title().trim()">Dodaj</button>
    </form>
  `,
})
export class TaskForm {
  readonly #store = inject(TeamStore);
  protected readonly title = signal('');

  protected add(event: Event): void {
    event.preventDefault();
    this.#store.add(this.title().trim());
    this.title.set('');
  }
}

/** Deepest level: still reaches the panel's store directly. */
@Component({
  selector: 'app-task-item',
  template: `
    <label class="form-check-label d-flex gap-2" [class.text-decoration-line-through]="task().done">
      <input
        type="checkbox"
        class="form-check-input"
        [checked]="task().done"
        (change)="store.toggle(task().id)"
      />
      {{ task().title }}
    </label>
  `,
  host: { class: 'list-group-item' },
})
export class TaskItem {
  readonly task = input.required<Task>();
  protected readonly store = inject(TeamStore);
}

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  template: `
    @for (task of store.tasks(); track task.id) {
      <app-task-item [task]="task" />
    }
  `,
  host: { class: 'list-group list-group-flush' },
})
export class TaskList {
  protected readonly store = inject(TeamStore);
}

/** Provides TeamStore → new instance per <app-team-panel>, visible to its whole subtree. */
@Component({
  selector: 'app-team-panel',
  imports: [TeamHeader, TaskForm, TaskList],
  providers: [TeamStore],
  template: `
    <div class="card h-100" [class]="'border-' + color()">
      <div class="card-header" [class]="'text-bg-' + color()">
        <strong>{{ name() }}</strong> <small>&lt;app-team-panel&gt; providers: [TeamStore]</small>
      </div>
      <div class="card-body p-2 border-bottom"><app-team-header /></div>
      <app-task-list />
      <div class="card-body p-2"><app-task-form /></div>
    </div>
  `,
})
export class TeamPanel {
  readonly name = input.required<string>();
  readonly color = input<'primary' | 'success'>('primary');
}

@Component({
  selector: 'app-e03-di-tree-page',
  imports: [TeamPanel],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">E03 – di-tree-page</header>

    <div class="row g-3">
      <div class="col-md-6"><app-team-panel name="Zespół A" color="primary" /></div>
      <div class="col-md-6"><app-team-panel name="Zespół B" color="success" /></div>
    </div>

    <div class="card mt-3">
      <div class="card-header">
        <code>ActivityLog</code> – <code>&#64;Service()</code> w root: <strong>jedna</strong>
        instancja dla obu drzew
      </div>
      <ul class="list-group list-group-flush small font-monospace">
        @for (entry of log.entries(); track $index) {
          <li class="list-group-item py-1">{{ entry }}</li>
        } @empty {
          <li class="list-group-item py-1 text-body-secondary">kliknij coś w panelach…</li>
        }
      </ul>
    </div>

    <pre class="mt-4"><code>{{ tree }}</code></pre>
    <pre><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Poziom 3: zakres stanu = miejsce w drzewie DI</p>
      <p>
        Dwa panele mają <strong>ten sam kod</strong>, ale osobny stan. Każdy
        <code>&lt;app-team-panel&gt;</code> ma <code>providers: [TeamStore]</code>, więc Angular
        tworzy <strong>nową instancję na każdy element</strong>. Wszyscy potomkowie (header, lista,
        pojedyncze zadanie, formularz) dostają tę instancję przez <code>inject()</code>, bez
        przekazywania przez <code>input()</code> poziom po poziomie (prop drilling).
      </p>
      <p class="fw-semibold mb-1">Jak <code>inject()</code> szuka?</p>
      <ol>
        <li>
          Od bieżącego komponentu <strong>w górę</strong> drzewa elementów (element injectors), aż
          trafi na <code>providers</code> z tym tokenem → <code>TeamStore</code> z najbliższego
          panelu.
        </li>
        <li>
          Potem environment injectors: route <code>providers</code> → root →
          <code>ActivityLog</code> (jedna, wspólna instancja).
        </li>
        <li>Nigdzie? → błąd <code>NG0201: No provider</code>.</li>
      </ol>
      <p class="fw-semibold mb-1">Kiedy który zakres?</p>
      <ul class="mb-0">
        <li>
          <strong>Komponent</strong> (<code>providers</code> w komponencie): stan „instancji
          widgetu”, np. kreator, edytor, karta, panel. Żyje i ginie z komponentem. Wejdź na inną
          stronę i wróć: zadania wracają do startowych.
        </li>
        <li>
          <strong>Route</strong> (<code>providers</code> w definicji trasy): stan całego feature'u,
          dzielony przez jego strony.
        </li>
        <li>
          <strong>Root</strong> (<code>&#64;Service()</code>): naprawdę globalne rzeczy, np. auth,
          koszyk (E2), log, ustawienia.
        </li>
        <li>
          <code>&#64;Service(&#123; autoProvided: false &#125;)</code> chroni przed pomyłką: bez
          <code>providers</code> dostaniesz błąd, a nie cichy globalny singleton dzielony przez
          wszystkie panele.
        </li>
      </ul>
    </blockquote>
  `,
})
export class E03DiTreePage {
  protected readonly log = inject(ActivityLog);

  protected readonly tree = `Root injector ─ ActivityLog (1×)
└─ <app-di-tree-page>
   ├─ <app-team-panel "A">  providers: [TeamStore]  → TeamStore #1
   │   ├─ <app-team-header>   inject(TeamStore) → #1
   │   ├─ <app-task-list>     inject(TeamStore) → #1
   │   │   └─ <app-task-item> inject(TeamStore) → #1
   │   └─ <app-task-form>     inject(TeamStore) → #1
   └─ <app-team-panel "B">  providers: [TeamStore]  → TeamStore #2
       └─ … the same components → #2`;

  protected readonly code = `@Service({ autoProvided: false })        // must be provided explicitly
export class TeamStore {
  readonly #log = inject(ActivityLog);    // found in root
  readonly #tasks = signal<Task[]>([]);
  readonly tasks = this.#tasks.asReadonly();
}

@Component({
  selector: 'app-team-panel',
  providers: [TeamStore],                 // new instance per panel
})
export class TeamPanel {}

export class TaskItem {                   // 3 levels deeper – no input drilling
  protected readonly store = inject(TeamStore);
}`;
}
