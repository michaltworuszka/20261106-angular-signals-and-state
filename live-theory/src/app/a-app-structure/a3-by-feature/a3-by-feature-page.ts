import { Component } from '@angular/core';
import { StructureExplorer } from '../structure-explorer';
import { dir, featureDir, file, SHOP_FEATURES } from '../structure-tree';
import { Shop } from './app/shop';

/** Mirrors ./app/ (real files) + ghost files (*) of a growing app. */
const TREE = dir(
  'a3-by-feature/app',
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
      dir('data', file('cart-item.ts', 'cart')),
      dir('state', file('cart.ts', 'cart'), file('cart.spec.ts', 'cart')),
      dir('ui', file('cart-summary.ts', 'cart')),
      file('cart-widget.ts', 'cart'),
    ),
    featureDir(
      'orders',
      'orders',
      dir('data', file('order.ts', 'orders', true)),
      dir('state', file('orders.ts', 'orders', true)),
      dir('ui', file('order-list.ts', 'orders', true)),
      file('orders-page.ts', 'orders', true),
      file('orders.routes.ts', 'orders', true),
    ),
    featureDir(
      'products',
      'products',
      dir('data', file('product.ts', 'products'), file('product-api.ts', 'products')),
      dir('state', file('product-catalog.ts', 'products')),
      dir('ui', file('product-list.ts', 'products')),
      file('products-page.ts', 'products'),
      file('products.routes.ts', 'products'),
    ),
  ),
  dir('shared', dir('ui', file('price-pipe.ts'))),
  file('shop.routes.ts'),
  file('shop.ts'),
);

interface ImportRule {
  from: string;
  to: string;
  verdict: 'yes' | 'no' | 'convention';
}

const IMPORT_RULES: ImportRule[] = [
  { from: 'feature', to: 'shared/', verdict: 'yes' },
  { from: 'feature', to: 'core/', verdict: 'yes' },
  { from: 'feature', to: 'inna feature (zaplanowany kierunek)', verdict: 'convention' },
  { from: 'cart', to: 'products (odwrotny kierunek)', verdict: 'no' },
  { from: 'shared/', to: 'feature', verdict: 'no' },
  { from: 'core/', to: 'feature', verdict: 'no' },
  { from: 'ui/ (presentational)', to: 'state/ (inject store)', verdict: 'no' },
];

@Component({
  selector: 'app-a3-by-feature-page',
  imports: [Shop, StructureExplorer],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">A3 – podział wg feature</header>

    <p class="lead">
      Style Guide mówi <em>„grupuj wg funkcji”</em>. Architektura dopowiada <strong>jak</strong>:
      <code>core/</code> + <code>shared/</code> + <code>features/</code>, w każdej funkcji warstwy i
      publiczne API.
    </p>

    <div class="alert alert-info">
      <p class="mb-2">
        <strong>v20+: bez wymuszonych sufiksów.</strong> Strukturę niesie folder, nie nazwa pliku:
        <code>state/</code> mówi <em>czym</em> plik jest, nazwa – <em>co</em> robi. Porównaj z A2:
      </p>
      <pre class="small mb-0"><code>{{ renames }}</code></pre>
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <app-structure-explorer [root]="tree" [features]="features" />
      </div>

      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Zasady</p>
        <ol class="small">
          <li>
            <code>core/</code> – singletony całej aplikacji: auth, interceptory, obsługa błędów,
            layout. <span class="text-body-secondary">(tu tylko na schemacie)</span>
          </li>
          <li>
            <code>shared/</code> – „głupie”, wielokrotne UI, pipes, dyrektywy. Zero stanu
            biznesowego (<code>price-pipe.ts</code>).
          </li>
          <li>
            <code>features/&lt;funkcja&gt;/</code> – wszystko o jednej funkcji biznesowej:
            <ul>
              <li><code>data/</code> – API, DTO, modele</li>
              <li><code>state/</code> – serwis stanu / store</li>
              <li>
                <code>ui/</code> – presentational: tylko <code>input()</code> /
                <code>output()</code>
              </li>
              <li><code>*-page.ts</code> – smart: wstrzykuje stan, łączy UI</li>
              <li><code>*.routes.ts</code> – lazy loading + <code>providers</code> funkcji</li>
            </ul>
          </li>
          <li>
            <strong>Brak publicznego API</strong> – Style Guide nie mówi nic o barrelach
            (<code>index.ts</code>). Każdy plik funkcji jest osiągalny z zewnątrz (<code
              >products-page.ts</code
            >
            → <code>../cart/state/cart</code>).
          </li>
          <li>
            <strong>Najwęższy zasięg stanu</strong>: <code>ProductCatalog</code> w
            <code>providers</code> trasy (żyje tylko na niej), <code>Cart</code> w
            <code>root</code>, bo dzieli go kilka funkcji.
          </li>
          <li>
            <strong>Jeden kierunek</strong>: products → cart. Koszyk nie zna produktów – sam
            definiuje, czego potrzebuje (<code>CartProduct</code>).
          </li>
        </ol>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">Kto może importować kogo</div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm small mb-0 w-auto">
            <tbody>
              @for (rule of importRules; track $index) {
                <tr>
                  <td>
                    <code>{{ rule.from }}</code>
                  </td>
                  <td>→</td>
                  <td>
                    <code>{{ rule.to }}</code>
                  </td>
                  <td>{{ icons[rule.verdict] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <small class="text-body-secondary">⚠ = dozwolone, ale tylko „na słowo honoru”</small>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span
          >Działa! – ten sam sklep, produkty ładowane leniwie
          (<code>products.routes.ts</code>)</span
        >
        <code class="small">src/app/a-app-structure/a3-by-feature/app/</code>
      </div>
      <div class="card-body">
        <app-a3-shop />
      </div>
    </div>

    <div class="alert alert-warning mt-4">
      <p class="fw-semibold mb-1">Ale… to tylko umowa (→ A4)</p>
      <p class="small mb-2">
        Nic nie pilnuje tych zasad. Wszystko poniżej się <strong>kompiluje</strong> i przejdzie code
        review w piątek o 17:00:
      </p>
      <pre class="small mb-2"><code>{{ violation }}</code></pre>
      <p class="small mb-0">
        Potrzebujemy: <strong>publicznego API</strong> funkcji (barrel <code>index.ts</code>) i
        granic <strong>pilnowanych automatycznie</strong> – lint w IDE i CI. Następny krok → A4:
        Sheriff.
      </p>
    </div>
  `,
})
export class A3ByFeaturePage {
  protected readonly tree = TREE;
  protected readonly features = SHOP_FEATURES;
  protected readonly importRules = IMPORT_RULES;

  protected readonly renames = `A2 (do v19)                          A3 (v20+)
cart/cart.service.ts                 features/cart/state/cart.ts       → Cart
cart/cart-summary.component.ts       features/cart/ui/cart-summary.ts  → CartSummary
cart/cart-item.model.ts              features/cart/data/cart-item.ts   → CartItem`;

  protected readonly icons: Record<ImportRule['verdict'], string> = {
    yes: '✅',
    no: '❌',
    convention: '⚠',
  };

  protected readonly violation = `// features/products/ui/product-list.ts  (presentational!)
import { Cart } from '../../cart/state/cart';           // ❌ ui injects another feature's state

// features/cart/state/cart.ts
import { Product } from '../../products/data/product';  // ❌ cart → products (wrong direction)

// shared/ui/price-pipe.ts
import { Cart } from '../../features/cart/state/cart';  // ❌ shared depends on a feature`;
}
