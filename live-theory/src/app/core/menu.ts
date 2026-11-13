import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface MenuLink {
  kind: 'link';
  label: string;
  link: string;
}

/** Not ready yet – rendered disabled with "wkrótce" badge. */
export interface MenuPlaceholder {
  kind: 'placeholder';
  label: string;
}

/** Group of examples for one topic (e.g. many `computed()` demos). */
export interface MenuGroup {
  kind: 'group';
  label: string;
  children: (MenuLink | MenuPlaceholder)[];
}

export type MenuItem = MenuLink | MenuPlaceholder | MenuGroup;

export interface MenuSection {
  part: string;
  title: string;
  items: MenuItem[];
}

/** Presentational: only inputs/outputs, no injected state. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Accordion: Bootstrap CSS only, open/closed state = signal (no Bootstrap JS) -->
    <nav class="accordion accordion-flush mt-2" aria-label="Menu przykładów">
      @for (section of sections(); track section.part) {
        @let open = openPart() === section.part;
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              type="button"
              class="accordion-button py-2 px-3 small"
              [class.collapsed]="!open"
              [attr.aria-expanded]="open"
              [attr.aria-controls]="'menu-part-' + $index"
              (click)="toggle(section.part)"
            >
              <span class="text-uppercase text-body-secondary me-1">{{ section.part }} –</span>
              <strong>{{ section.title }}</strong>
            </button>
          </h2>
          <div [id]="'menu-part-' + $index" class="accordion-collapse collapse" [class.show]="open">
            <div class="list-group list-group-flush">
              @for (item of section.items; track item.label) {
                @switch (item.kind) {
                  @case ('link') {
                    <a
                      class="list-group-item list-group-item-action"
                      [routerLink]="item.link"
                      routerLinkActive="active"
                      ariaCurrentWhenActive="page"
                      (click)="navigated.emit()"
                    >
                      {{ item.label }}
                    </a>
                  }
                  @case ('placeholder') {
                    <span
                      class="list-group-item disabled d-flex justify-content-between align-items-center"
                      aria-disabled="true"
                    >
                      {{ item.label }}
                      <span class="badge text-bg-secondary">wkrótce</span>
                    </span>
                  }
                  @case ('group') {
                    <!-- Group = static header + indented children (second menu level) -->
                    <div class="list-group-item fw-semibold">{{ item.label }}</div>
                    @for (child of item.children; track child.label) {
                      @if (child.kind === 'link') {
                        <a
                          class="list-group-item list-group-item-action ps-5 small"
                          [routerLink]="child.link"
                          routerLinkActive="active"
                          ariaCurrentWhenActive="page"
                          (click)="navigated.emit()"
                        >
                          {{ child.label }}
                        </a>
                      } @else {
                        <span
                          class="list-group-item disabled ps-5 small d-flex justify-content-between align-items-center"
                          aria-disabled="true"
                        >
                          {{ child.label }}
                          <span class="badge text-bg-secondary">wkrótce</span>
                        </span>
                      }
                    }
                  }
                }
              }
            </div>
          </div>
        </div>
      }
    </nav>
  `,
})
export class Menu {
  readonly sections = input.required<MenuSection[]>();
  /** Current router URL – the section containing it is expanded. */
  readonly activeUrl = input('');
  readonly navigated = output();

  private readonly activePart = computed(
    () => findSection(this.sections(), this.activeUrl())?.part ?? null,
  );

  /**
   * Expanded section (single-open accordion).
   * linkedSignal: follows the active route's section, but stays writable for manual toggling.
   */
  protected readonly openPart = linkedSignal(() => this.activePart());

  protected toggle(part: string): void {
    this.openPart.update((open) => (open === part ? null : part));
  }
}

function findSection(sections: MenuSection[], url: string): MenuSection | undefined {
  const path = url.split(/[?#]/)[0];
  const matches = (link: string) => path === link || path.startsWith(link + '/');
  return sections.find((section) =>
    section.items.some((item) =>
      item.kind === 'link'
        ? matches(item.link)
        : item.kind === 'group' &&
          item.children.some((child) => child.kind === 'link' && matches(child.link)),
    ),
  );
}
