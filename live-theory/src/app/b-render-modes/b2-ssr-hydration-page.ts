import { Component } from '@angular/core';

@Component({
  selector: 'app-b2-ssr-hydration-page',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      B2 – SSR: cykl życia i hydratacja
    </header>

    <p class="lead">
      Komponent uruchamia się <strong>dwa razy</strong>: w Node (robi HTML) i w przeglądarce
      (hydratuje). Z serwera przechodzi tylko <strong>HTML</strong> (+ <code>TransferState</code>) –
      stan komponentu, sygnały, pola klasy tworzą się od nowa.
    </p>

    <div class="card mt-4">
      <div class="card-header">Co gdzie się wykonuje</div>
      <div class="table-responsive">
        <table class="table table-sm small mb-0 align-middle">
          <thead>
            <tr>
              <th>Kod</th>
              <th class="text-center">Serwer</th>
              <th class="text-center">Przeglądarka</th>
            </tr>
          </thead>
          <tbody>
            @for (row of lifecycle; track row.code) {
              <tr>
                <td class="font-monospace">{{ row.code }}</td>
                <td class="text-center">{{ row.server }}</td>
                <td class="text-center">{{ row.browser }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="card-footer small">
        Wniosek: efekt uboczny w konstruktorze / <code>ngOnInit</code> (analytics, POST, timer)
        wykona się <strong>2×</strong>. Kod tylko dla przeglądarki → <code>afterNextRender()</code>.
      </div>
    </div>

    <h2 class="h6 mt-4">1. API przeglądarki na serwerze → crash</h2>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card h-100 border-danger">
          <div class="card-header text-bg-danger">Źle</div>
          <div class="card-body">
            <pre class="small mb-2"><code>{{ browserApiBad }}</code></pre>
            <pre
              class="small mb-0 text-danger-emphasis"
            ><code>ReferenceError: localStorage is not defined</code></pre>
            <p class="small text-body-secondary mb-0 mt-2">
              SSR → 500 dla użytkownika. SSG → błąd prerenderu w <code>ng build</code>.
            </p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100 border-success">
          <div class="card-header text-bg-success">Dobrze</div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ browserApiGood }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <h2 class="h6 mt-4">2. Inny DOM na serwerze i w przeglądarce → błąd hydratacji</h2>
    <p class="small">
      Hydratacja <strong>nie renderuje od nowa</strong> – przechodzi po DOM z serwera i oczekuje
      dokładnie tej struktury, którą zbudowałby szablon. Najczęstsze przyczyny:
    </p>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">Nieprawidłowy HTML</div>
          <div class="card-body small">
            <pre class="mb-2"><code>{{ invalidHtml }}</code></pre>
            Parser przeglądarki „naprawia” HTML z serwera, więc DOM nie zgadza się z szablonem.
            <strong>Fix</strong>: poprawny HTML, zawsze jawne <code>&lt;tbody&gt;</code>.
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">Ręczne zmiany DOM</div>
          <div class="card-body small">
            <pre class="mb-2"><code>{{ manualDom }}</code></pre>
            Tak samo działają biblioteki jQuery i wtyczki przeglądarki.
            <strong>Fix</strong>: szablon zamiast DOM API; biblioteki 3rd-party w
            <code>afterNextRender()</code>. W ostateczności <code>ngSkipHydration</code> na hoście
            komponentu (Angular traktuje to jako bug do naprawy).
          </div>
        </div>
      </div>
    </div>

    <div class="card border-danger mt-3">
      <div class="card-header text-bg-danger">
        Tak wygląda błąd (konsola przeglądarki, skrócony)
      </div>
      <div class="card-body">
        <pre class="small mb-0 text-danger-emphasis"><code>{{ errorSample }}</code></pre>
      </div>
      <div class="card-footer small">
        Inne z tej rodziny: <code>NG0501</code> (brakuje węzłów obok), <code>NG0502</code> (nie
        znalazł węzła po zapisanej ścieżce). Lista:
        <a href="https://angular.dev/errors" target="_blank" rel="noopener">angular.dev/errors</a>.
      </div>
    </div>

    <h2 class="h6 mt-4">3. Bez błędu, ale „skok” po hydratacji</h2>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card h-100 border-warning">
          <div class="card-header text-bg-warning">Źle</div>
          <div class="card-body small">
            <pre class="mb-2"><code>{{ jumpBad }}</code></pre>
            Angular nie porównuje tekstu, tylko strukturę. Brak błędu, ale treść zmienia się na
            oczach użytkownika (layout shift).
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100 border-success">
          <div class="card-header text-bg-success">Dobrze</div>
          <div class="card-body small">
            <pre class="mb-0"><code>{{ jumpGood }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3 mb-0">
      <ul class="mb-0">
        <li>Pierwszy render musi wyjść <strong>tak samo</strong> na serwerze i w przeglądarce.</li>
        <li>
          Wszystko, co dotyczy tylko przeglądarki (<code>window</code>, <code>localStorage</code>,
          wymiary, biblioteki DOM), robisz <strong>po</strong> hydratacji →
          <code>afterNextRender()</code>.
        </li>
        <li>
          Fragment tylko dla przeglądarki → <code>&#64;defer</code> (serwer renderuje placeholder).
        </li>
      </ul>
    </blockquote>
  `,
})
export class B2SsrHydrationPage {
  protected readonly lifecycle = [
    { code: 'constructor / inject() / pola klasy', server: '✓', browser: '✓' },
    { code: 'ngOnInit, computed(), szablon', server: '✓', browser: '✓' },
    { code: 'ngOnDestroy / DestroyRef', server: '✓ (po renderze)', browser: '✓' },
    { code: 'afterNextRender / afterEveryRender', server: '✗', browser: '✓' },
  ];

  protected readonly browserApiBad = `export class Cart {
  // runs in Node too → no localStorage there
  readonly items = signal(JSON.parse(localStorage.getItem('cart') ?? '[]'));
}`;

  protected readonly browserApiGood = `export class Cart {
  readonly items = signal<CartItem[]>([]); // same on server + browser

  constructor() {
    afterNextRender(() => {               // browser only, after hydration
      this.items.set(JSON.parse(localStorage.getItem('cart') ?? '[]'));
    });
  }
}
// document → inject(DOCUMENT), never the global`;

  protected readonly invalidHtml = `<p>
  <div>Cena: 4999 zł</div>   <!-- <div> inside <p> -->
</p>

<table>
  <tr><td>Laptop</td></tr>   <!-- no <tbody> -->
</table>`;

  protected readonly manualDom = `export class Banner {
  private readonly el = inject(ElementRef);

  ngOnInit() {
    const badge = document.createElement('span');
    this.el.nativeElement.appendChild(badge); // not from the template
  }
}`;

  protected readonly errorSample = `// server sent <p><div>…</div></p>, browser parsed it as <p></p><div>…</div><p></p>
ERROR RuntimeError: NG0500: During hydration Angular expected <div> but the node was not found.

Angular expected this DOM:
  <p>
    <div>…</div>  <-- AT THIS LOCATION
  </p>

To fix this problem:
  * check the "ProductCard" component for hydration-related issues
  * check to see if your template has valid HTML structure
  * check if there are any third-party scripts that manipulate the DOM
  * or skip hydration by adding the \`ngSkipHydration\` attribute to its host node in a template`;

  protected readonly jumpBad = `<p>Wygenerowano: {{ now }}</p>   <!-- new Date() → server ≠ browser -->
<p>Promo: {{ randomPromo }}</p>  <!-- Math.random() -->

@if (isBrowser) {                <!-- server: nothing, browser: banner -->
  <app-cookie-banner />
}`;

  protected readonly jumpGood = `// value from server → TransferState / httpResource
// or show after hydration:
readonly showBanner = signal(false);
constructor() {
  afterNextRender(() => this.showBanner.set(true));
}

// or a client-only block:
@defer (on idle) {
  <app-cookie-banner />
} @placeholder {
  <div style="height: 4rem"></div>   <!-- reserve space -->
}`;
}
