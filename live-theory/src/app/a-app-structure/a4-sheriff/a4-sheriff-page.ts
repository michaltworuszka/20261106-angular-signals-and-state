import { Component } from '@angular/core';
import { StructureExplorer } from '../structure-explorer';
import { dir, featureDir, file, SHOP_FEATURES } from '../structure-tree';
import { Shop } from './app/shop';

/** Mirrors ./app/ (real files) + ghost files (*) of a growing app. */
const TREE = dir(
  'a4-sheriff/app',
  dir(
    'core',
    file('auth-interceptor.ts', undefined, true),
    file('error-handler.ts', undefined, true),
  ),
  dir(
    'features',
    featureDir(
      'cart',
      'cart',
      dir('data', file('cart-item.ts', 'cart'), file('index.ts', 'cart')),
      dir('state', file('cart.ts', 'cart'), file('cart.spec.ts', 'cart'), file('index.ts', 'cart')),
      dir('ui', file('cart-summary.ts', 'cart'), file('index.ts', 'cart')),
      file('cart-widget.ts', 'cart'),
      file('index.ts', 'cart'),
    ),
    featureDir(
      'orders',
      'orders',
      dir('data', file('order.ts', 'orders', true), file('index.ts', 'orders', true)),
      dir('state', file('orders.ts', 'orders', true), file('index.ts', 'orders', true)),
      dir('ui', file('order-list.ts', 'orders', true), file('index.ts', 'orders', true)),
      file('orders-page.ts', 'orders', true),
      file('orders.routes.ts', 'orders', true),
      file('index.ts', 'orders', true),
    ),
    featureDir(
      'products',
      'products',
      dir(
        'data',
        file('product.ts', 'products'),
        file('product-api.ts', 'products'),
        file('index.ts', 'products'),
      ),
      dir('state', file('product-catalog.ts', 'products'), file('index.ts', 'products')),
      dir(
        'ui',
        file('product-list.ts', 'products'),
        file('sheriff-demo.ts', 'products'),
        file('index.ts', 'products'),
      ),
      file('products-page.ts', 'products'),
      file('products.routes.ts', 'products'),
      file('index.ts', 'products'),
    ),
  ),
  dir('shared', dir('ui', file('price-pipe.ts'), file('index.ts'))),
  file('shop.routes.ts'),
  file('shop.ts'),
);

@Component({
  selector: 'app-a4-sheriff-page',
  imports: [Shop, StructureExplorer],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      A4 – granice pilnowane przez Sheriff
    </header>

    <p class="lead">
      Ta sama struktura co A3 + dwie rzeczy, których Style Guide nie zna:
      <strong>barrel</strong> (<code>index.ts</code>) jako publiczne API każdego modułu i
      <a href="https://sheriff.softarc.io" target="_blank" rel="noopener">Sheriff</a> – reguły
      zależności sprawdzane przez ESLint (w IDE i w CI).
    </p>

    <div class="row g-4">
      <div class="col-lg-6">
        <app-structure-explorer [root]="tree" [features]="features" />
      </div>

      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Co dodaje Sheriff</p>
        <ol class="small">
          <li>
            <strong>Moduł = folder z <code>index.ts</code>.</strong> Z zewnątrz tylko przez barrel –
            deep import (<code>../cart/state/cart</code>) to błąd lint.
          </li>
          <li>
            <strong>Tagi</strong> na każdym module: <code>domain:&lt;funkcja&gt;</code> +
            <code>type:&lt;warstwa&gt;</code> (<code>feature</code> / <code>state</code> /
            <code>ui</code> / <code>data</code>).
          </li>
          <li>
            <strong><code>depRules</code></strong> – tabela „kto może importować kogo” z A3
            zamieniona w kod. Np. <code>type:ui</code> → tylko <code>ui</code> + <code>data</code>,
            więc presentational nie wstrzyknie store'a.
          </li>
          <li>
            <strong>Zaplanowany kierunek</strong>: <code>domain:products</code> →
            <code>domain:cart</code>. Odwrotnie – błąd.
          </li>
          <li>
            Działa w <strong>IDE</strong> (ESLint) i w <strong>CI</strong>: <code>pnpm lint</code>,
            <code>pnpm sheriff:verify</code>. Moduły: <code>pnpm sheriff:list</code>.
          </li>
          <li>
            Barrel ≠ <code>export *</code>. Eksportuj tylko to, czego potrzebują inni:
            <code>cart</code> wystawia <code>Cart</code>, <code>CartWidget</code>,
            <code>CartProduct</code> – <code>CartSummary</code> zostaje prywatny.
          </li>
        </ol>
        <p class="small mb-0 text-body-secondary">
          Real world: barrele to też koszt (cykle importów, wolniejsze narzędzia w dużych repo).
          Sheriff ma tryb bez barreli (<code>enableBarrelLess</code>, prywatne pliki w
          <code>internal/</code>).
        </p>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Reguły jako kod</span>
        <code class="small">live-theory/sheriff.config.ts</code>
      </div>
      <div class="card-body">
        <pre class="small mb-2"><code>{{ config }}</code></pre>
      </div>
    </div>

    <div class="card border-danger mt-4">
      <div class="card-header text-bg-danger">Spróbuj na żywo</div>
      <div class="card-body small">
        <ol class="mb-2">
          <li>Otwórz <code>a4-sheriff/app/features/products/ui/sheriff-demo.ts</code>.</li>
          <li>
            Odkomentuj jedną linię → czerwone podkreślenie w IDE, <code>pnpm lint</code> = błąd.
          </li>
          <li><code>ng build</code> nadal przechodzi – TypeScript nie zna granic modułów.</li>
        </ol>
        <pre class="mb-2"><code>{{ demo }}</code></pre>
        <p class="mb-1">Co zobaczysz (prawdziwe komunikaty):</p>
        <pre class="mb-0 text-danger-emphasis"><code>{{ errors }}</code></pre>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa! – ten sam sklep, każdy import przez barrel</span>
        <code class="small">src/app/a-app-structure/a4-sheriff/app/</code>
      </div>
      <div class="card-body">
        <app-a4-shop />
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3 mb-0">
      Granice są teraz <strong>wymuszone</strong>, nie tylko opisane. Następny krok → A5: Nx
      (monorepo, wiele aplikacji i bibliotek).
    </blockquote>
  `,
})
export class A4SheriffPage {
  protected readonly tree = TREE;
  protected readonly features = SHOP_FEATURES;

  protected readonly config = `modules: {
  [\`\${A4}/features/<domain>\`]:       ['domain:<domain>', 'type:feature'],
  [\`\${A4}/features/<domain>/data\`]:  ['domain:<domain>', 'type:data'],
  [\`\${A4}/features/<domain>/state\`]: ['domain:<domain>', 'type:state'],
  [\`\${A4}/features/<domain>/ui\`]:    ['domain:<domain>', 'type:ui'],
  [\`\${A4}/shared/<type>\`]:           ['domain:shared', 'type:<type>'],
},
depRules: {
  root: ['type:feature', 'domain:shared', 'noTag'],
  noTag: ['noTag'],                            // A5 libs (path aliases)
  'domain:*': [sameTag, 'domain:shared'],
  'domain:products': ['domain:cart'],          // planned direction only
  'type:feature': ['type:feature', 'type:state', 'type:ui', 'type:data'],
  'type:state': ['type:state', 'type:data'],
  'type:ui': ['type:ui', 'type:data'],
  'type:data': ['type:data'],
}`;

  protected readonly errors = `@softarc/sheriff/deep-import
  Deep import is not allowed. Use the module's index.ts or path
@softarc/sheriff/dependency-rule
  Tag type:ui has no clearance for tags domain:cart, type:feature`;

  protected readonly demo = `// export { Cart } from '../../cart/state/cart'; // ❌ deep import – past cart/index.ts
// export { Cart } from '../../cart';            // ❌ type:ui → type:feature
// export { ProductCatalog } from '../state';    // ❌ type:ui → type:state`;
}
