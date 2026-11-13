import { Component } from '@angular/core';
import { RenderModesCompare } from './render-modes-compare';

@Component({
  selector: 'app-b2-ssr-page',
  imports: [RenderModesCompare],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      B2 – SSR: renderowanie na serwerze
    </header>

    <p class="lead">
      <strong>Server-Side Rendering</strong>: przy <strong>każdym żądaniu</strong> serwer (Node +
      Express) uruchamia aplikację, renderuje HTML i go odsyła. Przeglądarka pokazuje gotowy widok,
      a potem Angular go <strong>hydratuje</strong> (podpina zdarzenia, nie renderuje od nowa).
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
            <kbd>Ctrl</kbd>+<kbd>U</kbd> → nazwa produktu jest w HTML. Na dole
            <code>&lt;script id="ng-state"&gt;</code> = <code>TransferState</code> z serwera.
          </li>
          <li>
            Po starcie to zwykłe SPA: <code>routerLink</code> renderuje już przeglądarka. Serwer
            robi tylko pierwsze wejście.
          </li>
        </ol>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        Setup SSR – raz na aplikację (<code>ng new --ssr</code> /
        <code>ng add &#64;angular/ssr</code>)
      </div>
      <div class="card-body">
        <pre class="small mb-0"><code>{{ setup }}</code></pre>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <ul class="mb-0">
        <li>
          Kod komponentów wykonuje się <strong>też w Node</strong>: brak <code>window</code>,
          <code>localStorage</code>. DOM → <code>afterNextRender()</code>, platforma →
          <code>isPlatformBrowser()</code>, dokument → <code>inject(DOCUMENT)</code>.
        </li>
        <li>
          Dane pobrane na serwerze przez <code>HttpClient</code> /
          <code>httpResource</code> trafiają do <code>TransferState</code> → przeglądarka nie pyta
          API drugi raz.
        </li>
        <li>
          <strong>Plusy</strong>: szybki pierwszy obraz, SEO, zawsze świeże dane (per użytkownik,
          per żądanie).
        </li>
        <li>
          <strong>Minusy</strong>: serwer Node do utrzymania, CPU na każde żądanie, TTFB zależy od
          najwolniejszego API.
        </li>
      </ul>
    </blockquote>

    <app-render-modes-compare current="ssr" />
  `,
})
export class B2SsrPage {
  protected readonly serverRoute = `import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'render/ssr',
    renderMode: RenderMode.Server, // ← HTML rendered on every request
    // optional, per route:
    // status: 200,
    // headers: { 'Cache-Control': 'no-store' },
  },
  // …
  { path: '**', renderMode: RenderMode.Prerender },
];`;

  protected readonly setup = `// angular.json → build.options
"server": "src/main.server.ts",
"outputMode": "server",          // "static" = only CSR + SSG, no Node server
"ssr": { "entry": "src/server.ts" } // Express app

// app.config.ts
provideClientHydration(withEventReplay()),

// app.config.server.ts
provideServerRendering(withRoutes(serverRoutes)),

// run
ng build && node dist/live-theory/server/server.mjs   // http://localhost:4000`;
}
