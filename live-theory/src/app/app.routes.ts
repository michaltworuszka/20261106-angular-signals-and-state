import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'structure/by-type' },
  // Part A – App structure (evolution: by type → style guide → by feature → Sheriff)
  {
    path: 'structure',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'by-type' },
      {
        path: 'by-type',
        title: 'A1 – naiwny: wg typu',
        loadComponent: () =>
          import('./a-app-structure/a1-by-type/a1-by-type-page').then((m) => m.A1ByTypePage),
      },
      {
        path: 'style-guide',
        title: 'A2 – wg Style Guide (do v19)',
        loadComponent: () =>
          import('./a-app-structure/a2-style-guide/a2-style-guide-page').then(
            (m) => m.A2StyleGuidePage,
          ),
      },
      {
        path: 'by-feature',
        title: 'A3 – wg feature',
        loadComponent: () =>
          import('./a-app-structure/a3-by-feature/a3-by-feature-page').then(
            (m) => m.A3ByFeaturePage,
          ),
        // Mini-app routes render in the <router-outlet> inside the page's demo.
        loadChildren: () =>
          import('./a-app-structure/a3-by-feature/app/shop.routes').then((m) => m.SHOP_ROUTES),
      },
      {
        path: 'sheriff',
        title: 'A4 – pilnowany przez Sheriff',
        loadComponent: () =>
          import('./a-app-structure/a4-sheriff/a4-sheriff-page').then((m) => m.A4SheriffPage),
        loadChildren: () =>
          import('./a-app-structure/a4-sheriff/app/shop.routes').then((m) => m.SHOP_ROUTES),
      },
      {
        path: 'sheriff-config',
        title: 'A4 – konfiguracja Sheriff: podstawy',
        loadComponent: () =>
          import('./a-app-structure/a4-sheriff/a4-sheriff-config-page').then(
            (m) => m.A4SheriffConfigPage,
          ),
      },
      {
        path: 'nx',
        title: 'A5 – Nx monorepo',
        loadComponent: () => import('./a-app-structure/a5-nx/a5-nx-page').then((m) => m.A5NxPage),
        loadChildren: () =>
          import('./a-app-structure/a5-nx/apps/shop/src/app/shop.routes').then(
            (m) => m.SHOP_ROUTES,
          ),
      },
    ],
  },
  // Part B – Render modes: same client route shape, mode set per path in app.routes.server.ts
  {
    path: 'render',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'csr' },
      {
        path: 'csr',
        title: 'B1 – CSR',
        loadComponent: () => import('./b-render-modes/b1-csr-page').then((m) => m.B1CsrPage),
      },
      {
        path: 'ssr',
        title: 'B2 – SSR',
        loadComponent: () => import('./b-render-modes/b2-ssr-page').then((m) => m.B2SsrPage),
      },
      {
        path: 'ssr-hydration',
        title: 'B2 – SSR: cykl życia i hydratacja',
        loadComponent: () =>
          import('./b-render-modes/b2-ssr-hydration-page').then((m) => m.B2SsrHydrationPage),
      },
      {
        path: 'ssg',
        title: 'B3 – SSG',
        loadComponent: () => import('./b-render-modes/b3-ssg-page').then((m) => m.B3SsgPage),
      },
    ],
  },
  // Part C – Signals
  {
    // Group: signal() → /signal/<example>
    path: 'signal',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'signal() – podstawy',
        loadComponent: () =>
          import('./c-signals/c02-signals-basics').then((m) => m.C02SignalsBasics),
      },
      {
        path: 'complex-data',
        title: 'signal() – złożone dane',
        loadComponent: () =>
          import('./c-signals/c03-signal-complex-data').then((m) => m.C03SignalComplexData),
      },
      {
        path: 'same-reference',
        title: 'signal() – ta sama referencja',
        loadComponent: () =>
          import('./c-signals/c04-signal-same-reference').then((m) => m.C04SignalSameReference),
      },
    ],
  },
  {
    // Group: many computed() examples → /signal-computed/<example>
    path: 'signal-computed',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'computed() – podstawy',
        loadComponent: () =>
          import('./c-signals/c05-signal-computed').then((m) => m.C05SignalComputed),
      },
      {
        path: 'cart-total',
        title: 'computed() – suma koszyka',
        loadComponent: () =>
          import('./c-signals/c06-signal-computed-cart').then((m) => m.C06SignalComputedCart),
      },
    ],
  },
  {
    // Group: linkedSignal() → /signal-linked/<example>
    path: 'signal-linked',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'linkedSignal() – reset wyboru',
        loadComponent: () => import('./c-signals/c07-signal-linked').then((m) => m.C07SignalLinked),
      },
      {
        path: 'previous',
        title: 'linkedSignal() – poprzedni wybór',
        loadComponent: () =>
          import('./c-signals/c08-signal-linked-previous').then((m) => m.C08SignalLinkedPrevious),
      },
      {
        path: 'anti-pattern',
        title: 'linkedSignal() – antywzorce',
        loadComponent: () =>
          import('./c-signals/c09-signal-linked-anti-pattern').then(
            (m) => m.C09SignalLinkedAntiPattern,
          ),
      },
    ],
  },
  {
    // Group: effect() – good use + anti-patterns → /signal-effect/<example>
    path: 'signal-effect',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'autosave' },
      {
        path: 'autosave',
        title: 'effect() – autozapis',
        loadComponent: () => import('./c-signals/c10-signal-effect').then((m) => m.C10SignalEffect),
      },
      {
        path: 'anti-pattern-1',
        title: 'effect() – antywzorzec #1',
        loadComponent: () =>
          import('./c-signals/c11-signal-effect-anti-pattern-1').then(
            (m) => m.C11SignalEffectAntiPattern1,
          ),
      },
      {
        path: 'anti-pattern-2',
        title: 'effect() – antywzorzec #2',
        loadComponent: () =>
          import('./c-signals/c12-signal-effect-anti-pattern-2').then(
            (m) => m.C12SignalEffectAntiPattern2,
          ),
      },
      {
        path: 'anti-pattern-3',
        title: 'effect() – antywzorzec #3',
        loadComponent: () =>
          import('./c-signals/c13-signal-effect-anti-pattern-3').then(
            (m) => m.C13SignalEffectAntiPattern3,
          ),
      },
    ],
  },
  {
    // Group: parent ↔ child communication → /signal-io/<example>
    path: 'signal-io',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'input' },
      {
        path: 'input',
        title: 'input() i input.required()',
        loadComponent: () => import('./c-signals/c14-signal-input').then((m) => m.C14SignalInput),
      },
      {
        path: 'output',
        title: 'output() – zdarzenia',
        loadComponent: () => import('./c-signals/c15-signal-output').then((m) => m.C15SignalOutput),
      },
    ],
  },
  {
    path: 'signal-long-distance',
    title: 'Sygnał w serwisie',
    loadComponent: () =>
      import('./c-signals/c16-signal-communication-for-long-distance').then(
        (m) => m.C16SignalCommunicationForLongDistance,
      ),
  },
  // Part D – Forms & more signals (client-rendered, fake API: src/server-fake-api.ts)
  {
    // Group: httpResource() → /http-resource/<example>
    path: 'http-resource',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'httpResource() – podstawy',
        loadComponent: () =>
          import('./d-forms-and-more/d01-http-resource-basics').then(
            (m) => m.D01HttpResourceBasics,
          ),
      },
      {
        path: 'states',
        title: 'httpResource() – loading / error',
        loadComponent: () =>
          import('./d-forms-and-more/d02-http-resource-states').then(
            (m) => m.D02HttpResourceStates,
          ),
      },
      {
        path: 'states-rxjs',
        title: 'Loading / error – porównaj z RxJS',
        loadComponent: () =>
          import('./d-forms-and-more/d02b-http-client-states').then((m) => m.D02bHttpClientStates),
      },
      {
        path: 'headers',
        title: 'httpResource() – nagłówki',
        loadComponent: () =>
          import('./d-forms-and-more/d03-http-resource-headers').then(
            (m) => m.D03HttpResourceHeaders,
          ),
      },
    ],
  },
  {
    path: 'rxjs-interop',
    title: 'RxJS interop',
    loadComponent: () =>
      import('./d-forms-and-more/d04-rxjs-interop').then((m) => m.D04RxjsInterop),
  },
  {
    // Group: Signal Forms → /signal-forms/<example>
    path: 'signal-forms',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'Signal Forms – podstawy',
        loadComponent: () =>
          import('./d-forms-and-more/d05-signal-forms-basics').then((m) => m.D05SignalFormsBasics),
      },
      {
        path: 'model',
        title: 'Signal Forms – model i form()',
        loadComponent: () =>
          import('./d-forms-and-more/d06-signal-forms-model').then((m) => m.D06SignalFormsModel),
      },
      {
        path: 'dynamic',
        title: 'Signal Forms – formularz dynamiczny',
        loadComponent: () =>
          import('./d-forms-and-more/d07-signal-forms-dynamic').then(
            (m) => m.D07SignalFormsDynamic,
          ),
      },
      {
        path: 'validators',
        title: 'Signal Forms – walidatory',
        loadComponent: () =>
          import('./d-forms-and-more/d08-signal-forms-validators').then(
            (m) => m.D08SignalFormsValidators,
          ),
      },
      {
        path: 'async-validators',
        title: 'Signal Forms – walidatory async',
        loadComponent: () =>
          import('./d-forms-and-more/d09-signal-forms-async-validators').then(
            (m) => m.D09SignalFormsAsyncValidators,
          ),
      },
    ],
  },
  // Part E – State management: component → signal store (root) → DI tree scope → RxJS events → pub-sub → NgRx Signals
  {
    path: 'state',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'component' },
      {
        path: 'component',
        title: 'Stan w komponencie',
        loadComponent: () =>
          import('./e-state/e01-state-in-component').then((m) => m.E01StateInComponent),
      },
      {
        path: 'signal-store',
        title: 'Signal Store',
        loadComponent: () =>
          import('./e-state/e02-signal-store-page').then((m) => m.E02SignalStorePage),
      },
      {
        path: 'di-tree',
        title: 'Komunikacja – drzewo DI',
        loadComponent: () => import('./e-state/e03-di-tree-page').then((m) => m.E03DiTreePage),
      },
      {
        path: 'long-distance',
        title: 'Daleka odległość – RxJS między serwisami',
        loadComponent: () =>
          import('./e-state/e04-long-distance-page').then((m) => m.E04LongDistancePage),
      },
      {
        path: 'event-driven',
        title: 'Event driven – pub-sub między domenami',
        loadComponent: () =>
          import('./e-state/e05-event-driven-page').then((m) => m.E05EventDrivenPage),
      },
      {
        // Group: NgRx Signals → /state/ngrx/<example>
        path: 'ngrx',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'basics' },
          {
            path: 'basics',
            title: 'NgRx Signals – podstawy (signalState)',
            loadComponent: () =>
              import('./e-state/e06-ngrx-basics-page').then((m) => m.E06NgrxBasicsPage),
          },
          {
            path: 'signal-store',
            title: 'NgRx Signals – signalStore',
            loadComponent: () =>
              import('./e-state/e06-signal-store-page').then((m) => m.E06SignalStorePage),
          },
          {
            path: 'entities',
            title: 'NgRx Signals – entities',
            loadComponent: () =>
              import('./e-state/e06-entities-page').then((m) => m.E06EntitiesPage),
          },
          {
            path: 'events',
            title: 'NgRx Signals – events',
            loadComponent: () => import('./e-state/e06-events-page').then((m) => m.E06EventsPage),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'structure/by-type' },
];
