import { Component, computed, input, signal } from '@angular/core';
import { FeatureMeta, filesByFolder, TreeDir } from './structure-tree';
import { TreeView } from './tree-view';

/** Tree + feature buttons: "change one feature – how many folders do I touch?" */
@Component({
  selector: 'app-structure-explorer',
  imports: [TreeView],
  template: `
    <p class="mb-2">Zmieniamy jedną funkcję biznesową. Ile folderów dotkniemy?</p>
    <div class="d-flex flex-wrap gap-2 mb-3">
      @for (feature of features(); track feature.id) {
        <button
          type="button"
          class="btn btn-sm"
          [class]="
            selected() === feature.id ? 'btn-' + feature.color : 'btn-outline-' + feature.color
          "
          [attr.aria-pressed]="selected() === feature.id"
          (click)="toggleFeature(feature.id)"
        >
          {{ feature.label }}
        </button>
      }
    </div>

    <div class="card mb-3">
      <div class="card-header font-monospace small">{{ root().name }}/</div>
      <div class="card-body small">
        <div class="font-monospace">
          <app-tree-view
            [entries]="root().children"
            [features]="features()"
            [selected]="selected()"
          />
        </div>
        <small class="d-block mt-2 text-body-secondary">
          * tylko na schemacie – tak rośnie realna app
        </small>
      </div>
    </div>

    @if (impact(); as impact) {
      <div class="alert" [class]="impact.folders > 1 ? 'alert-danger' : 'alert-success'">
        Zmiana w <strong>{{ impact.label }}</strong> = <strong>{{ impact.files }}</strong> plików w
        <strong>{{ impact.folders }}</strong> z {{ dirCount() }} folderów.
        {{ impact.folders > 1 ? 'Rozsmarowana po drzewie.' : 'Wszystko w jednym miejscu.' }}
      </div>
    } @else {
      <div class="alert alert-secondary">Kliknij funkcję, aby podświetlić jej pliki.</div>
    }
  `,
})
export class StructureExplorer {
  readonly root = input.required<TreeDir>();
  readonly features = input.required<FeatureMeta[]>();

  // Local UI state.
  protected readonly selected = signal<string | null>(null);

  readonly #filesByFolder = computed(() => filesByFolder(this.root()));
  protected readonly dirCount = computed(() => this.#filesByFolder().size);

  protected readonly impact = computed(() => {
    const id = this.selected();
    const meta = this.features().find((f) => f.id === id);
    if (!meta) return null;
    let files = 0;
    let folders = 0;
    for (const dirFiles of this.#filesByFolder().values()) {
      const n = dirFiles.filter((f) => f.feature === id).length;
      files += n;
      if (n) folders++;
    }
    return { label: meta.label, files, folders };
  });

  protected toggleFeature(id: string): void {
    this.selected.update((current) => (current === id ? null : id));
  }
}
