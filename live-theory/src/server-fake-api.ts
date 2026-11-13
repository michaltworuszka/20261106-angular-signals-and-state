import { randomUUID } from 'node:crypto';
import { Router, type Response } from 'express';
import type { Product } from './app/d-forms-and-more/product';

/**
 * Fake backend for Part D – a real Express router mounted in `server.ts` under `/api`.
 * Runs in `ng serve` (dev server uses `reqHandler` from server.ts) and in `serve:ssr`.
 * Real HTTP → every request is visible in DevTools → Network (status, headers, timing, cancel).
 *
 * Extra query params (any endpoint): `delay=<ms>` (default 600), `fail=<status>` (forced error).
 */

const PRODUCTS: Product[] = [
  { id: 1, name: 'Jabłko', price: 2.5, category: 'owoce' },
  { id: 2, name: 'Banan', price: 4.2, category: 'owoce' },
  { id: 3, name: 'Gruszka', price: 3.1, category: 'owoce' },
  { id: 4, name: 'Marchew', price: 1.9, category: 'warzywa' },
  { id: 5, name: 'Pomidor', price: 6.5, category: 'warzywa' },
  { id: 6, name: 'Ogórek', price: 3.8, category: 'warzywa' },
  { id: 7, name: 'Mleko', price: 3.6, category: 'nabiał' },
  { id: 8, name: 'Ser żółty', price: 29.9, category: 'nabiał' },
];

/** Logins already taken – for the async validator demo. */
const TAKEN_LOGINS = ['admin', 'jan', 'anna', 'root'];

const GREETINGS: Record<string, string> = { pl: 'Cześć', en: 'Hello', de: 'Hallo' };

/** Request headers echoed back by `/api/me` (browser adds many more – sec-ch-*, cookies…). */
const ECHOED_HEADERS = ['authorization', 'accept-language', 'accept'];

export const fakeApi = Router();

// Common: no caching (every click = real request), forced error, artificial latency.
fakeApi.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');

  const forced = Number(param(req.query['fail']));
  if (forced >= 400) {
    return void setTimeout(() => sendError(res, forced, `Wymuszony błąd (fail=${forced})`), 300);
  }

  const wait = Number(param(req.query['delay']) || 600);
  const timer = setTimeout(next, wait);
  // Client aborted (httpResource param change, switchMap, closed tab) → drop the pending answer.
  // In DevTools the request shows as "(canceled)".
  res.on('close', () => {
    clearTimeout(timer);
    if (!res.writableFinished) {
      console.log(`[fake-api] canceled ${req.method} ${req.originalUrl}`);
    }
  });
});

fakeApi.get('/products', (req, res) => {
  const q = param(req.query['q']).trim().toLowerCase();
  const found = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  res.set('X-Total-Count', String(found.length)).json(found);
});

fakeApi.get('/products/:id', (req, res) => {
  const product = PRODUCTS.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return sendError(res, 404, 'Nie ma takiego produktu');
  }
  res.json(product);
});

fakeApi.get('/me', (req, res) => {
  const auth = req.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Brak tokena – dodaj nagłówek Authorization');
  }
  const lang = req.get('Accept-Language') ?? 'pl';
  res.set({ 'X-Api-Version': '2026.11', 'X-Request-Id': randomUUID() }).json({
    greeting: `${GREETINGS[lang] ?? GREETINGS['pl']}, ${auth.slice(7)}!`,
    // Echo – shows what the server actually received (custom X-* included).
    receivedHeaders: Object.fromEntries(
      Object.entries(req.headers).filter(
        ([key]) => ECHOED_HEADERS.includes(key) || key.startsWith('x-'),
      ),
    ),
  });
});

fakeApi.get('/logins/check', (req, res) => {
  const login = param(req.query['login']).toLowerCase();
  res.json({ available: !TAKEN_LOGINS.includes(login) });
});

// Unknown /api/* → JSON 404 (never fall through to Angular rendering).
fakeApi.use((req, res) => sendError(res, 404, `Nieznany endpoint ${req.path}`));

/** Error body `{ message }` → client reads it from `HttpErrorResponse.error.message`. */
function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ message });
}

/** First value of a query param as string (Express query values can be arrays/objects). */
function param(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first : '';
}
