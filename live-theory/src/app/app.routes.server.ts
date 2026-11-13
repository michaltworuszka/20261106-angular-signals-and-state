import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Part B – one route per render mode (client routes are identical, see app.routes.ts)
  { path: 'render/csr', renderMode: RenderMode.Client },
  { path: 'render/ssr', renderMode: RenderMode.Server },
  { path: 'render/ssg', renderMode: RenderMode.Prerender },
  // Part D – live HTTP (fake API) & timers: render in the browser, so loading states are visible
  // (prerender + HTTP transfer cache would hand over finished data).
  { path: 'http-resource/**', renderMode: RenderMode.Client },
  { path: 'rxjs-interop', renderMode: RenderMode.Client },
  { path: 'signal-forms/**', renderMode: RenderMode.Client },
  // Everything else → prerendered at build time
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
