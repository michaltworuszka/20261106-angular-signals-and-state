import { Component } from '@angular/core';
import { StructureExplorer } from '../structure-explorer';
import { dir, file, SHOP_FEATURES } from '../structure-tree';
import { Shop } from './app/components/shop';

/** Mirrors ./app/ (real files) + ghost files (*) of a growing app. */
const TREE = dir(
  'a1-by-type/app',
  dir(
    'components',
    file('shop.ts'),
    file('product-list.ts', 'products'),
    file('cart-summary.ts', 'cart'),
    file('order-list.ts', 'orders', true),
    file('order-details.ts', 'orders', true),
  ),
  dir(
    'services',
    file('catalog.ts', 'products'),
    file('cart.ts', 'cart'),
    file('orders.ts', 'orders', true),
  ),
  dir(
    'models',
    file('product.ts', 'products'),
    file('cart-item.ts', 'cart'),
    file('order.ts', 'orders', true),
  ),
  dir('utils', file('format-price.ts'), file('order-status.ts', 'orders', true)),
);

@Component({
  selector: 'app-a1-by-type-page',
  imports: [Shop, StructureExplorer],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">A1 – naiwny podział: wg typu</header>

    <p class="lead">
      Pierwszy odruch: grupujemy pliki wg tego, <strong>czym są</strong> – <code>components/</code>,
      <code>services/</code>, <code>models/</code>, <code>utils/</code>. Tak wygląda wiele
      tutoriali… i wiele starych projektów.
    </p>

    <div class="row g-4">
      <div class="col-lg-6">
        <app-structure-explorer [root]="tree" [features]="features" />
      </div>

      <div class="col-lg-6">
        <p class="fw-semibold mb-1">Dlaczego to problem</p>
        <ul class="small">
          <li>
            <strong>Rozproszenie</strong> – pliki jednej funkcji leżą w wielu folderach; każda
            zmiana = skakanie po drzewie.
          </li>
          <li>
            <strong>Foldery bez końca</strong> – <code>components/</code> ze 100+ plikami, nikt nie
            wie, co do czego należy.
          </li>
          <li>
            <strong>Brak granic</strong> – każdy importuje wszystko (<code>../services/cart</code>
            skądkolwiek) → spaghetti zależności.
          </li>
          <li>
            <strong>Nie da się wydzielić</strong> funkcji: usunąć, lazy-loadować, oddać innemu
            zespołowi.
          </li>
          <li>
            <strong>Wszystko globalne</strong> – każdy serwis <code>providedIn: 'root'</code>, bo
            nie ma „miejsca” na węższy scope.
          </li>
          <li>Struktura krzyczy <em>„to jest Angular”</em>, a nie <em>„to jest sklep”</em>.</li>
        </ul>
        <p class="small mb-0"><strong>Kiedy OK?</strong> Mała demo app, prototyp, kilka plików.</p>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between flex-wrap gap-2">
        <span>Działa! – mini sklep zbudowany w tej strukturze</span>
        <code class="small">src/app/a-app-structure/a1-by-type/app/</code>
      </div>
      <div class="card-body">
        <app-a1-shop />
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3 mb-0">
      Działa – problem nie jest w kodzie, tylko w tym, <strong>jak rośnie</strong>. Następny krok →
      A2: co mówi oficjalny Style Guide.
    </blockquote>
  `,
})
export class A1ByTypePage {
  protected readonly tree = TREE;
  protected readonly features = SHOP_FEATURES;
}
