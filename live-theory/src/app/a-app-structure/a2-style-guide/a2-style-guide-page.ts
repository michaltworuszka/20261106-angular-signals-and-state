import { Component } from '@angular/core';
import { StructureExplorer } from '../structure-explorer';
import { dir, file, SHOP_FEATURES } from '../structure-tree';
import { ShopComponent } from './app/shop.component';

/** Mirrors ./app/ (real files) + ghost files (*) of a growing app. */
const TREE = dir(
  'a2-style-guide/app',
  dir(
    'cart',
    file('cart.service.ts', 'cart'),
    file('cart.service.spec.ts', 'cart'),
    file('cart-item.model.ts', 'cart'),
    file('cart-summary.component.ts', 'cart'),
  ),
  dir(
    'orders',
    file('order.model.ts', 'orders', true),
    file('order-list.component.ts', 'orders', true),
    file('order-details.component.ts', 'orders', true),
    file('order-status.pipe.ts', 'orders', true),
  ),
  dir(
    'product-catalog',
    file('product.model.ts', 'products'),
    file('product-catalog.service.ts', 'products'),
    file('product-list.component.ts', 'products'),
  ),
  file('format-price.ts'),
  file('shop.component.ts'),
);

interface NamingRow {
  kind: string;
  before: string;
  now: string;
}

const NAMING: NamingRow[] = [
  {
    kind: 'komponent',
    before: 'product-list.component.ts → ProductListComponent',
    now: 'product-list.ts → ProductList',
  },
  { kind: 'serwis', before: 'cart.service.ts → CartService', now: 'cart.ts → Cart' },
  {
    kind: 'dyrektywa',
    before: 'highlight.directive.ts → HighlightDirective',
    now: 'highlight.ts → Highlight',
  },
  { kind: 'pipe', before: 'price.pipe.ts → PricePipe', now: 'price-pipe.ts → PricePipe' },
  { kind: 'guard', before: 'auth.guard.ts → authGuard', now: 'auth-guard.ts → authGuard' },
];

@Component({
  selector: 'app-a2-style-guide-page',
  imports: [ShopComponent, StructureExplorer],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      A2 – wg Style Guide
      <span class="badge text-bg-secondary align-middle">do v19 – z sufiksami</span>
    </header>

    <p class="lead">
      Ten sam sklep, ułożony wg oficjalnego
      <a href="https://angular.dev/style-guide" target="_blank" rel="noopener"
        >Angular Style Guide</a
      >
      w wersji, którą zna większość projektów (do v19): foldery wg funkcji, a typ pliku w nazwie –
      <code>.component.ts</code>, <code>.service.ts</code>, <code>.model.ts</code>. Drzewo zaczyna
      mówić <em>„to jest sklep”</em>.
    </p>

    <div class="row g-4">
      <div class="col-lg-6">
        <app-structure-explorer [root]="tree" [features]="features" />
      </div>

      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Zasady zastosowane tutaj</p>
        <ol class="small">
          <li>
            <strong>Grupuj wg obszaru funkcji</strong>, nie typu – Style Guide wprost odradza
            <code>components/</code>, <code>services/</code>, <code>directives/</code>.
          </li>
          <li>
            <strong>Nazwa pliku = identyfikator + typ</strong> (styl do v19):
            <code>CartSummaryComponent</code> → <code>cart-summary.component.ts</code>,
            <code>CartService</code> → <code>cart.service.ts</code>.
          </li>
          <li>
            <strong>Testy obok kodu</strong>, ta sama nazwa + <code>.spec</code>:
            <code>cart.service.spec.ts</code> (nie osobny folder <code>tests/</code>).
          </li>
          <li>
            <strong>Bez ogólnych nazw</strong> – żadnych <code>utils.ts</code>,
            <code>helpers.ts</code>, <code>common.ts</code> → <code>format-price.ts</code>.
          </li>
          <li><strong>Jeden plik = jedna koncepcja</strong> (komponent, serwis, model).</li>
          <li>
            W kodzie: <code>inject()</code>, <code>protected</code> dla członków template,
            <code>readonly</code> dla <code>input</code>/<code>output</code>/queries, handler
            nazwany wg akcji: <code>addToCart()</code>, nie <code>handleClick()</code>.
          </li>
          <li>Za dużo plików w folderze? Dopiero wtedy podfoldery.</li>
        </ol>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">Sufiksy: do v19 (tutaj) vs v20+ (→ A3)</div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm small font-monospace mb-3">
            <thead>
              <tr>
                <th></th>
                <th>do v19</th>
                <th>v20+ (domyślnie z CLI)</th>
              </tr>
            </thead>
            <tbody>
              @for (row of naming; track row.kind) {
                <tr>
                  <th>{{ row.kind }}</th>
                  <td class="text-danger-emphasis">{{ row.before }}</td>
                  <td class="text-success-emphasis">{{ row.now }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <ul class="small mb-0">
          <li>
            Sufiks powtarza to, co już mówi dekorator (<code>@Component</code>,
            <code>@Injectable</code>) – szum w każdej nazwie i każdym imporcie.
          </li>
          <li>
            Od v20 CLI generuje pliki <strong>bez sufiksów</strong>, a aktualny Style Guide mówi
            tylko: <em>nazwa pliku = główny identyfikator</em>. Nazwa ma mówić
            <strong>co robi</strong> (<code>Cart</code>, <code>ProductCatalog</code>), a nie
            <strong>czym jest</strong> dla frameworka.
          </li>
          <li>
            Komponenty, serwisy, dyrektywy – bez sufiksu. Pipe / guard / interceptor – typ zostaje,
            ale przez myślnik (<code>price-pipe.ts</code>), bo sama nazwa byłaby niejasna.
          </li>
          <li>
            Stare projekty po <code>ng update</code> mogą zachować stary styl (ustawienia schematów
            w <code>angular.json</code>). W jednym projekcie – jeden styl.
          </li>
        </ul>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa! – ten sam sklep, wg funkcji + sufiksy (do v19)</span>
        <code class="small">src/app/a-app-structure/a2-style-guide/app/</code>
      </div>
      <div class="card-body">
        <app-a2-shop />
      </div>
    </div>

    <div class="alert alert-warning mt-4">
      <p class="fw-semibold mb-1">Czego Style Guide nie mówi (→ A3)</p>
      <ul class="small mb-0">
        <li>
          <code>product-list.component.ts</code> importuje <code>../cart/cart.service</code> – sięga
          do wnętrza innej funkcji. Brak granic i publicznego API.
        </li>
        <li>Komponenty same wstrzykują serwisy – brak podziału smart / presentational.</li>
        <li>Wszystko <code>providedIn: 'root'</code> – brak decyzji o zasięgu stanu.</li>
        <li>
          Brak <code>core/</code> / <code>shared/</code>, lazy routes per funkcja, warstw (data /
          state / ui). To już <strong>architektura</strong>, nie styl.
        </li>
      </ul>
    </div>
  `,
})
export class A2StyleGuidePage {
  protected readonly tree = TREE;
  protected readonly features = SHOP_FEATURES;
  protected readonly naming = NAMING;
}
