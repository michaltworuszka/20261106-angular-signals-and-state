import { Component, input } from '@angular/core';

export type RenderModeKey = 'csr' | 'ssr' | 'ssg';

interface ModeRow {
  key: RenderModeKey;
  name: string;
  renderMode: string;
  htmlWhen: string;
  firstPaint: string;
  seo: string;
  server: string;
  goodFor: string;
}

/** Presentational: CSR vs SSR vs SSG side by side, current one highlighted. */
@Component({
  selector: 'app-render-modes-compare',
  host: { class: 'd-block mt-4' },
  template: `
    <div class="card">
      <div class="card-header">CSR vs SSR vs SSG</div>
      <div class="table-responsive">
        <table class="table table-sm small mb-0 align-middle">
          <thead>
            <tr>
              <th></th>
              <th><code>renderMode</code></th>
              <th>HTML powstaje</th>
              <th>Pierwszy obraz</th>
              <th>SEO / podgląd linków</th>
              <th>Serwer</th>
              <th>Dobre dla</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.key) {
              <tr [class.table-primary]="row.key === current()">
                <th>{{ row.name }}</th>
                <td>
                  <code>{{ row.renderMode }}</code>
                </td>
                <td>{{ row.htmlWhen }}</td>
                <td>{{ row.firstPaint }}</td>
                <td>{{ row.seo }}</td>
                <td>{{ row.server }}</td>
                <td>{{ row.goodFor }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RenderModesCompare {
  readonly current = input.required<RenderModeKey>();

  protected readonly rows: ModeRow[] = [
    {
      key: 'csr',
      name: 'CSR',
      renderMode: 'RenderMode.Client',
      htmlWhen: 'w przeglądarce, po pobraniu JS',
      firstPaint: 'najpóźniej (biała strona → JS → widok)',
      seo: 'słabe (bot widzi pusty <app-root>)',
      server: 'niepotrzebny – statyczny hosting',
      goodFor: 'panele po zalogowaniu, dashboardy',
    },
    {
      key: 'ssr',
      name: 'SSR',
      renderMode: 'RenderMode.Server',
      htmlWhen: 'na serwerze, przy każdym żądaniu',
      firstPaint: 'szybko, ale czeka na serwer (TTFB)',
      seo: 'dobre, zawsze świeże dane',
      server: 'Node (Express) – koszt CPU per żądanie',
      goodFor: 'dane per użytkownik / często zmienne',
    },
    {
      key: 'ssg',
      name: 'SSG',
      renderMode: 'RenderMode.Prerender',
      htmlWhen: 'w czasie ng build (raz)',
      firstPaint: 'najszybciej – gotowy plik z CDN',
      seo: 'dobre, dane z chwili builda',
      server: 'niepotrzebny dla tych tras',
      goodFor: 'treści stałe: landing, blog, katalog',
    },
  ];
}
