import { Component, input } from '@angular/core';
import { FeatureMeta, TreeDir, TreeEntry, TreeFile } from './structure-tree';

/** Recursive, presentational folder tree. */
@Component({
  selector: 'app-tree-view',
  template: `
    <ul class="list-unstyled mb-0" [class.ms-4]="nested()">
      @for (entry of entries(); track entry.name) {
        @if (entry.kind === 'dir') {
          <li class="mt-1">
            <span [class]="dirClass(entry)">📁 {{ entry.name }}/</span>
            <app-tree-view
              [entries]="entry.children"
              [features]="features()"
              [selected]="selected()"
              [nested]="true"
            />
          </li>
        } @else {
          <li class="px-1 rounded" [class]="fileClass(entry)">
            📄 {{ entry.name }}
            @if (entry.ghost) {
              <span class="opacity-75">*</span>
            }
          </li>
        }
      }
    </ul>
  `,
})
export class TreeView {
  readonly entries = input.required<TreeEntry[]>();
  readonly features = input.required<FeatureMeta[]>();
  readonly selected = input<string | null>(null);
  readonly nested = input(false);

  /** Feature folders get the feature colour. */
  protected dirClass(dir: TreeDir): string {
    const meta = this.features().find((f) => f.id === dir.feature);
    if (!meta) return '';
    if (this.selected() === meta.id) return `fw-semibold px-1 rounded text-bg-${meta.color}`;
    return `fw-semibold text-${meta.color}-emphasis` + (this.selected() ? ' opacity-25' : '');
  }

  protected fileClass(file: TreeFile): string {
    const meta = this.features().find((f) => f.id === file.feature);
    const ghost = file.ghost ? ' fst-italic' : '';
    if (!meta) return 'text-body-secondary' + ghost; // app-wide / shared
    if (this.selected() === meta.id) return `text-bg-${meta.color}` + ghost;
    return (this.selected() ? 'opacity-25' : `text-${meta.color}-emphasis`) + ghost;
  }
}
