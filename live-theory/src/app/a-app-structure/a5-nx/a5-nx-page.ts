import { Component } from '@angular/core';
import { StructureExplorer } from '../structure-explorer';
import { dir, featureDir, file, SHOP_FEATURES, TreeDir, TreeFile } from '../structure-tree';
import { Shop } from './apps/shop/src/app/shop';

/** One Nx library: project.json + src/index.ts (public API) + src/lib/*. */
const lib = (name: string, feature: string | undefined, ...files: string[]): TreeDir =>
  dir(
    name,
    file('project.json', feature),
    dir('src', file('index.ts', feature), dir('lib', ...files.map((f) => file(f, feature)))),
  );

const ghostLib = (name: string, feature: string): TreeDir =>
  dir(name, file('project.json', feature, true));

const ghost = (name: string): TreeFile => file(name, undefined, true);

/** Mirrors ./ (real files) + ghost files (*) of a real Nx workspace. */
const TREE = dir(
  'a5-nx',
  dir(
    'apps',
    dir(
      'shop',
      file('project.json'),
      dir('src', dir('app', file('shop.routes.ts'), file('shop.ts'))),
    ),
  ),
  dir(
    'libs',
    featureDir(
      'cart',
      'cart',
      ghostLib('api', 'cart'),
      lib('data-access', 'cart', 'cart.ts', 'cart.spec.ts', 'cart-item.ts'),
      lib('feature', 'cart', 'cart-widget.ts'),
      lib('ui', 'cart', 'cart-summary.ts'),
    ),
    featureDir(
      'orders',
      'orders',
      ghostLib('data-access', 'orders'),
      ghostLib('feature', 'orders'),
      ghostLib('ui', 'orders'),
    ),
    featureDir(
      'products',
      'products',
      lib('data-access', 'products', 'product-api.ts', 'product-catalog.ts'),
      lib('feature', 'products', 'products.routes.ts', 'products-page.ts'),
      lib('ui', 'products', 'product-list.ts'),
      lib('util', 'products', 'product.ts'),
    ),
    dir('shared', lib('ui', undefined, 'price-pipe.ts')),
  ),
  ghost('eslint.config.mjs'),
  ghost('nx.json'),
  ghost('tsconfig.base.json'),
);

@Component({
  selector: 'app-a5-nx-page',
  imports: [Shop, StructureExplorer],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      A5 – Nx: monorepo, biblioteki i tagi
    </header>

    <p class="lead">
      Ta sama idea, skala wyżej: każda warstwa funkcji to osobna <strong>biblioteka</strong> z
      <code>project.json</code> i tagami. Granic pilnuje reguła ESLint
      <code>&#64;nx/enforce-module-boundaries</code> – na podstawie grafu projektu
      <a href="https://nx.dev" target="_blank" rel="noopener">Nx</a>.
    </p>

    <div class="alert alert-info small">
      Tutaj <strong>naśladujemy</strong> strukturę Nx w folderze: <code>apps/</code> +
      <code>libs/</code>, prawdziwe <code>project.json</code> z tagami, aliasy
      <code>&#64;shop/*</code> w <code>tsconfig.json</code>. Reguły egzekwuje dopiero prawdziwy
      workspace Nx (<code>npx create-nx-workspace</code>) – live-theory to zwykły projekt Angular
      CLI.
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <app-structure-explorer [root]="tree" [features]="features" />
      </div>

      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Co zmienia Nx (vs A4 + Sheriff)</p>
        <ol class="small">
          <li>
            <strong>Biblioteka zamiast folderu</strong>: <code>project.json</code> +
            <code>src/index.ts</code> (publiczne API) + alias, np.
            <code>&#64;shop/cart/data-access</code>.
          </li>
          <li>
            <strong>Tagi</strong> w <code>project.json</code>: <code>scope:*</code> (domena) +
            <code>type:*</code> (warstwa).
          </li>
          <li>
            <strong>Typy bibliotek</strong> (konwencja Nx): <code>feature</code>, <code>ui</code>,
            <code>data-access</code>, <code>util</code>. <code>data/</code> + <code>state/</code> z
            A4 = <code>data-access</code>; modele → <code>util</code>, żeby <code>ui</code> ich
            używał bez dostępu do stanu.
          </li>
          <li>
            <strong>Importy przez alias</strong>, nigdy względnie między bibliotekami. Wewnątrz
            biblioteki – względnie.
          </li>
          <li>
            <strong>Graf projektu</strong>: <code>nx graph</code> – wizualizacja zależności;
            <code>nx affected -t test</code> – testy tylko tego, czego dotyka zmiana.
          </li>
          <li>
            <strong>Kiedy?</strong> Wiele aplikacji, zespołów, wspólne biblioteki, cache w CI. Jedna
            aplikacja → A4 (Sheriff) zwykle wystarczy.
          </li>
        </ol>
      </div>
    </div>

    <div class="row g-4 mt-0">
      <div class="col-lg-5">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between flex-wrap gap-2">
            <span>Tagi biblioteki</span>
            <code class="small">libs/products/feature/project.json</code>
          </div>
          <div class="card-body">
            <pre class="small mb-3"><code>{{ projectJson }}</code></pre>
            <p class="small mb-1">Importy – A4 vs A5:</p>
            <pre class="small mb-0"><code>{{ imports }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="card border-primary h-100">
          <div class="card-header text-bg-primary d-flex justify-content-between flex-wrap gap-2">
            <span>Reguły granic</span>
            <code class="small text-bg-primary">eslint.config.mjs</code>
          </div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ rules }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Wzorzec <code>api</code> – domena udostępnia coś innej domenie</span>
        <code class="small">libs/cart/api</code>
      </div>
      <div class="card-body">
        <div class="row g-4">
          <div class="col-lg-5 small">
            <p>
              Problem: <code>products</code> potrzebuje koszyka. Gdy wolno mu importować
              <strong>wszystko</strong> z <code>scope:cart</code>, każda zmiana w
              <code>cart</code> może zepsuć <code>products</code>.
            </p>
            <p>
              Rozwiązanie: osobna biblioteka <code>type:api</code> – mała, stabilna fasada, która
              <strong>re-eksportuje</strong> tylko to, co inne domeny mogą brać. Reszta
              <code>cart</code> zostaje prywatna.
            </p>
            <ul class="mb-2">
              <li>
                Inne domeny → tylko <code>cart/api</code>, nigdy <code>cart/data-access</code>.
              </li>
              <li><code>api</code> trzyma kompatybilność wstecz – to kontrakt między zespołami.</li>
              <li>
                Alternatywa dla „wspólnego worka” w <code>shared</code>, który rośnie bez końca.
              </li>
            </ul>
            <p class="mb-0">
              Źródło:
              <a
                href="https://www.angulararchitects.io/en/blog/sustainable-angular-architectures-2/"
                target="_blank"
                rel="noopener"
                >Angular Architects – Implementing your Strategic Design with Angular and Nx</a
              >
              (Manfred Steyer). Tam dostęp do <code>api</code> nadaje się jeszcze węziej – tagiem
              <code>name:*</code> per biblioteka. Artykuł z 2019 (aktualizowany), przykłady w
              <code>tslint.json</code> – idea ta sama, dziś <code>eslint.config.mjs</code>.
            </p>
          </div>
          <div class="col-lg-7">
            <pre class="small mb-0"><code>{{ apiLib }}</code></pre>
          </div>
        </div>

        <hr />

        <div class="row g-4">
          <div class="col-lg-5 small">
            <p class="fw-semibold mb-1">To samo w Sheriff (A4) – bez Nx</p>
            <ul class="mb-0">
              <li>
                Nowy moduł <code>features/&lt;domain&gt;/api</code> (folder + <code>index.ts</code>)
                → tagi <code>domain:&lt;domain&gt;</code> + <code>type:api</code>.
              </li>
              <li>
                Bramka domeny: <code>'domain:*'</code> wpuszcza też <code>type:api</code> – czyli
                <code>api</code> <strong>każdej</strong> domeny. Znika potrzeba
                <code>'domain:products': ['domain:cart']</code>.
              </li>
              <li>
                Bramka warstwy: <code>feature</code> może brać <code>api</code>;
                <code>api</code> re-eksportuje swoje <code>state</code> / <code>data</code>.
              </li>
            </ul>
          </div>
          <div class="col-lg-7">
            <pre class="small mb-0"><code>{{ apiSheriff }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa! – ten sam sklep: aplikacja składa biblioteki</span>
        <code class="small">src/app/a-app-structure/a5-nx/</code>
      </div>
      <div class="card-body">
        <app-a5-shop />
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3 mb-0">
      Ewolucja: <strong>A1</strong> wg typu → <strong>A2</strong> wg funkcji + sufiksy →
      <strong>A3</strong> v20+, warstwy → <strong>A4</strong> barrele + Sheriff →
      <strong>A5</strong> biblioteki + Nx. Ten sam sklep, coraz mocniejsze granice.
    </blockquote>
  `,
})
export class A5NxPage {
  protected readonly tree = TREE;
  protected readonly features = SHOP_FEATURES;

  protected readonly projectJson = `{
  "name": "products-feature",
  "projectType": "library",
  "sourceRoot": "libs/products/feature/src",
  "tags": ["scope:products", "type:feature"]
}`;

  protected readonly imports = `// A4 (Sheriff) – relative path to a barrel
import { Cart } from '../cart';

// A5 (Nx) – library alias
import { Cart } from '@shop/cart/data-access';`;

  protected readonly apiLib = `// libs/cart/api/project.json
"tags": ["scope:cart", "type:api"]

// libs/cart/api/src/index.ts – hand-picked, small, stable
export { Cart } from '@shop/cart/data-access';
export type { CartItem } from '@shop/cart/data-access';

// eslint.config.mjs – depConstraints (changes vs above)
{ sourceTag: 'type:api',
  onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
{ sourceTag: 'type:feature',
  onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:data-access', 'type:util', 'type:api'] },
{ sourceTag: 'scope:products', // other domain → only its api
  onlyDependOnLibsWithTags: ['scope:products', 'scope:shared', 'type:api'] },

// libs/products/feature – before vs after
import { Cart } from '@shop/cart/data-access'; // ✗ scope:cart + type:data-access
import { Cart } from '@shop/cart/api';         // ✓ type:api`;

  protected readonly apiSheriff = `// sheriff.config.ts – changes vs A4
modules: {
  // …
  [\`\${A4}/features/<domain>/api\`]: ['domain:<domain>', 'type:api'],
},
depRules: {
  // domain gate: own domain, shared, or ANY domain's api
  'domain:*': [sameTag, 'domain:shared', 'type:api'],
  // 'domain:products': ['domain:cart'],  ← no longer needed

  // layer gate
  'type:feature': ['type:feature', 'type:state', 'type:ui', 'type:data', 'type:api'],
  'type:api': ['type:state', 'type:data'],   // api = facade over own state/data
  // …
},

// features/cart/api/index.ts
export { Cart } from '../state';

// features/products/products-page.ts
import { Cart } from '../cart/api';    // ✓ domain gate: type:api, layer gate: type:api
import { Cart } from '../cart/state';  // ✗ domain:products ↛ domain:cart`;

  protected readonly rules = `import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': ['error', {
        enforceBuildableLibDependency: true,
        allow: [],
        depConstraints: [
          // layers (type)
          { sourceTag: 'type:app',
            onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:util'] },
          { sourceTag: 'type:feature', // "can depend on any type of library"
            onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:data-access', 'type:util'] },
          { sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
          { sourceTag: 'type:data-access',
            onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
          { sourceTag: 'type:util',
            onlyDependOnLibsWithTags: ['type:util'] },

          // domains (scope)
          { sourceTag: 'scope:products',
            onlyDependOnLibsWithTags: ['scope:products', 'scope:cart', 'scope:shared'] },
          { sourceTag: 'scope:cart',
            onlyDependOnLibsWithTags: ['scope:cart', 'scope:shared'] },
          { sourceTag: 'scope:shared',
            onlyDependOnLibsWithTags: ['scope:shared'] },
        ],
      }],
    },
  },
];`;
}
