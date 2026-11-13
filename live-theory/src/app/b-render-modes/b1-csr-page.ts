import { Component } from '@angular/core';
import { RenderModesCompare } from './render-modes-compare';

@Component({
  selector: 'app-b1-csr-page',
  imports: [RenderModesCompare],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      B1 – CSR: renderowanie w przeglądarce
    </header>

    <p class="lead">
      <strong>Client-Side Rendering</strong>: serwer oddaje pustą skorupę – sam
      <code>&lt;app-root&gt;</code> i skrypty. Widok buduje dopiero JS w przeglądarce. Klasyczne SPA
      – tak działał Angular „od zawsze”.
    </p>

    <div class="row g-4 mt-1">
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between flex-wrap gap-2">
            <span>Jedna linia decyduje o trybie</span>
            <code class="small">app.routes.server.ts</code>
          </div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ serverRoute }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <p class="fw-semibold mb-1">Jak to sprawdzić</p>
        <ol class="small">
          <li>
            <kbd>Ctrl</kbd>+<kbd>U</kbd> (źródło strony) → pusty <code>&lt;app-root&gt;</code>, brak
            nazwy produktu w HTML.
          </li>
          <li>DevTools → wyłącz JavaScript → biała strona.</li>
        </ol>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">Trasa w <code>app.routes.ts</code> – taka sama dla B1, B2, B3</div>
      <div class="card-body">
        <pre class="small mb-0"><code>{{ clientRoute }}</code></pre>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <ul class="mb-0">
        <li>
          Brak hydratacji, brak <code>TransferState</code> – nie ma czego „przejmować”. Kod widzi
          <code>window</code> / <code>document</code> od razu.
        </li>
        <li>
          <strong>Plusy</strong>: najprostszy hosting (statyczne pliki), zero kosztu serwera, brak
          pułapek „kod działa też w Node”.
        </li>
        <li>
          <strong>Minusy</strong>: biała strona do czasu JS (wolniejsze LCP), słabe SEO i podgląd
          linków (Slack, Facebook).
        </li>
        <li>
          Gdy cała aplikacja jest CSR (np. za logowaniem), SSR można w ogóle pominąć:
          <code>ng new --ssr=false</code>. Tu pokazujemy CSR <strong>per trasa</strong> w aplikacji
          z SSR.
        </li>
      </ul>
    </blockquote>

    <app-render-modes-compare current="csr" />
  `,
})
export class B1CsrPage {
  protected readonly serverRoute = `import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'render/csr',
    renderMode: RenderMode.Client, // ← server sends empty shell, browser renders
  },
  // …
  { path: '**', renderMode: RenderMode.Prerender },
];`;

  protected readonly clientRoute = `{
  path: 'render/csr',
  loadComponent: () => import('./b-render-modes/b1-csr-page').then((m) => m.B1CsrPage),
},`;
}
