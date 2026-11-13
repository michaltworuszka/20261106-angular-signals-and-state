import { Component } from '@angular/core';
import { RenderModesCompare } from './render-modes-compare';

@Component({
  selector: 'app-b3-ssg-page',
  imports: [RenderModesCompare],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      B3 – SSG: prerender w czasie builda
    </header>

    <p class="lead">
      <strong>Static Site Generation</strong> (prerender): HTML powstaje
      <strong>raz, podczas <code>ng build</code></strong
      >, jako zwykłe pliki <code>…/index.html</code>. Serwer (albo CDN) tylko je oddaje. Dalej –
      hydratacja, jak w SSR.
    </p>

    <div class="alert alert-warning small">
      <code>ng serve</code> renderuje trasy prerender <strong>na żądanie</strong> – wygląda jak SSR.
      Prawdziwe SSG zobaczysz po buildzie:
      <code>pnpm build &amp;&amp; pnpm serve:ssr:live-theory</code> → <code>localhost:4000</code>.
    </div>

    <div class="row g-4 mt-1">
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between flex-wrap gap-2">
            <span>Zwykła trasa i trasa z parametrem</span>
            <code class="small">app.routes.server.ts</code>
          </div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ serverRoute }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <p class="fw-semibold mb-1">Jak to sprawdzić (po buildzie)</p>
        <ol class="small">
          <li>
            <code>dist/live-theory/browser/render/ssg/index.html</code> istnieje – gotowy HTML z
            builda.
          </li>
          <li>
            Bez parametrów (<code>/structure/…</code>, <code>/signal/…</code>) wystarcza
            <code>'**'</code> – Angular wyciąga ścieżki z routera sam.
          </li>
        </ol>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <ul class="mb-0">
        <li>
          <code>getPrerenderParams()</code> działa w kontekście injectora (<code>inject()</code> OK)
          – np. pobierz ID produktów z API w czasie builda.
        </li>
        <li>
          <code>fallback</code> dla parametrów spoza listy: <code>Server</code> (domyślny, SSR),
          <code>Client</code> (CSR), <code>None</code> (404 – serwer nie obsłuży).
        </li>
        <li><strong>Plusy</strong>: najszybszy TTFB (plik z CDN), zero CPU per żądanie, SEO.</li>
        <li>
          <strong>Minusy</strong>: dane „zamrożone” w chwili builda – zmiana treści = nowy build;
          nie dla danych per użytkownik. Tysiące stron = długi build.
        </li>
        <li>
          Cała aplikacja tylko CSR + SSG? <code>"outputMode": "static"</code> – bez serwera Node,
          dowolny statyczny hosting.
        </li>
      </ul>
    </blockquote>

    <app-render-modes-compare current="ssg" />
  `,
})
export class B3SsgPage {
  protected readonly serverRoute = `import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'render/ssg',
    renderMode: RenderMode.Prerender, // ← HTML generated at build time
  },
  {
    path: 'products/:id', // route param → build must know the values
    renderMode: RenderMode.Prerender,
    // which :id values to prerender (runs at build, inject() allowed)
    async getPrerenderParams() {
      // const ids = await inject(ProductApi).getIds();
      return ['1', '2', '3'].map((id) => ({ id }));
    },
    fallback: PrerenderFallback.Server, // unknown :id → SSR (default)
  },
  // …
  { path: '**', renderMode: RenderMode.Prerender },
];`;
}
