import { Routes } from '@angular/router';
import { roleGuard } from './shared/data-access';

/**
 * The shell owns the top level only: URL prefix, who may enter (roleGuard), lazy loading.
 * Each feature owns its inner routes (`<feature>.routes.ts`: paths, titles, providers)
 * and exports only those routes from its index.ts. Pages stay private to the feature.
 *
 * Domains follow user journeys:
 * catalog (browse) · checkout (cart, my orders) · account (login) ·
 * backoffice (staff) · articles (shop owner's guides, read-only).
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./domains/catalog/feature-browse').then((m) => m.browseRoutes),
  },
  {
    path: 'products',
    loadChildren: () => import('./domains/catalog/feature-product').then((m) => m.productRoutes),
  },
  {
    path: 'wishlist',
    loadChildren: () => import('./domains/wishlist/feature-wishlist')
      .then((m) =>  m.wishlistRoutes),
  },
  {
    path: 'articles',
    loadChildren: () => import('./domains/articles/articles.routes').then((m) => m.articlesRoutes),
  },
  {
    path: 'login',
    loadChildren: () => import('./domains/account/feature-login').then((m) => m.loginRoutes),
  },
  {
    path: 'cart',
    canActivate: [roleGuard('buyer')],
    loadChildren: () => import('./domains/checkout/feature-cart').then((m) => m.cartRoutes),
  },
  {
    path: 'my-orders',
    canActivate: [roleGuard('buyer')],
    loadChildren: () =>
      import('./domains/checkout/feature-my-orders').then((m) => m.myOrdersRoutes),
  },
  {
    path: 'backoffice',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'stock' },
      {
        path: 'stock',
        canActivate: [roleGuard('stock-manager', 'admin')],
        loadChildren: () => import('./domains/backoffice/feature-stock').then((m) => m.stockRoutes),
      },
      {
        path: 'orders',
        canActivate: [roleGuard('stock-manager', 'admin')],
        loadChildren: () =>
          import('./domains/backoffice/feature-orders').then((m) => m.ordersRoutes),
      },
      {
        path: 'users',
        canActivate: [roleGuard('admin')],
        loadChildren: () => import('./domains/backoffice/feature-users').then((m) => m.usersRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
