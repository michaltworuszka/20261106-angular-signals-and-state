import { MenuSection } from './menu';

export const MENU_SECTIONS: MenuSection[] = [
  {
    // Evolution: bad → better → good → perfect (src/app/a-app-structure/aX-*/app/ mimics each)
    part: 'Część A',
    title: 'Podział aplikacji',
    items: [
      { kind: 'link', link: '/structure/by-type', label: 'A1. Naiwny: wg typu' },
      { kind: 'link', link: '/structure/style-guide', label: 'A2. Wg Style Guide (do v19)' },
      { kind: 'link', link: '/structure/by-feature', label: 'A3. Wg feature' },
      {
        kind: 'group',
        label: 'A4. Pilnowany przez Sheriff',
        children: [
          { kind: 'link', link: '/structure/sheriff', label: 'Projekt' },
          { kind: 'link', link: '/structure/sheriff-config', label: 'Konfiguracja' },
        ],
      },
      { kind: 'link', link: '/structure/nx', label: 'A5. Nx – monorepo (bonus)' },
    ],
  },
  {
    part: 'Część B',
    title: 'Tryby renderowania',
    items: [
      { kind: 'link', link: '/render/csr', label: 'B1. CSR – renderowanie w przeglądarce' },
      {
        kind: 'group',
        label: 'B2. SSR – renderowanie na serwerze',
        children: [
          { kind: 'link', link: '/render/ssr', label: 'Podstawy' },
          { kind: 'link', link: '/render/ssr-hydration', label: 'Cykl życia i hydratacja' },
        ],
      },
      { kind: 'link', link: '/render/ssg', label: 'B3. SSG – prerender w czasie builda' },
    ],
  },
  {
    part: 'Część C',
    title: 'Sygnały',
    items: [
      {
        kind: 'group',
        label: 'C1. signal() – stan',
        children: [
          { kind: 'link', link: '/signal/basics', label: 'Podstawy' },
          { kind: 'link', link: '/signal/complex-data', label: 'Złożone dane' },
          { kind: 'link', link: '/signal/same-reference', label: 'Ta sama referencja' },
        ],
      },
      {
        kind: 'group',
        label: 'C2. computed() – stan wyliczany',
        children: [
          { kind: 'link', link: '/signal-computed/basics', label: 'Podstawy' },
          { kind: 'link', link: '/signal-computed/cart-total', label: 'Suma koszyka' },
        ],
      },
      {
        kind: 'group',
        label: 'C3. linkedSignal() – zapisywalny stan wyliczany',
        children: [
          { kind: 'link', link: '/signal-linked/basics', label: 'Podstawy: reset wyboru' },
          { kind: 'link', link: '/signal-linked/previous', label: 'Zachowaj poprzedni wybór' },
          {
            kind: 'link',
            link: '/signal-linked/anti-pattern',
            label: 'Antywzorce: znikający szkic, bez set()',
          },
        ],
      },
      {
        kind: 'group',
        label: 'C4. effect() – efekty uboczne',
        children: [
          { kind: 'link', link: '/signal-effect/autosave', label: 'Autozapis szkicu' },
          {
            kind: 'link',
            link: '/signal-effect/anti-pattern-1',
            label: 'Antywzorzec #1: effect zamiast computed',
          },
          {
            kind: 'link',
            link: '/signal-effect/anti-pattern-2',
            label: 'Antywzorzec #2: ukryta zależność',
          },
          {
            kind: 'link',
            link: '/signal-effect/anti-pattern-3',
            label: 'Antywzorzec #3: odczyt + zapis w effect',
          },
        ],
      },
      {
        kind: 'group',
        label: 'C5. input() / output() – rodzic ↔ dziecko',
        children: [
          { kind: 'link', link: '/signal-io/input', label: 'input() i input.required()' },
          { kind: 'link', link: '/signal-io/output', label: 'output() – zdarzenia (nie sygnał)' },
        ],
      },
      {
        kind: 'link',
        link: '/signal-long-distance',
        label: 'C6. Sygnał w serwisie',
      },
    ],
  },
  {
    part: 'Część D',
    title: 'Formularze i więcej()',
    items: [
      {
        kind: 'group',
        label: 'D1. httpResource() – dane z serwera',
        children: [
          { kind: 'link', link: '/http-resource/basics', label: 'Podstawy' },
          { kind: 'link', link: '/http-resource/states', label: 'Loading / error' },
          { kind: 'link', link: '/http-resource/states-rxjs', label: '↳ porównaj z RxJS' },
          { kind: 'link', link: '/http-resource/headers', label: 'Nagłówki' },
        ],
      },
      { kind: 'link', link: '/rxjs-interop', label: 'D2. RxJS interop – RxJS ↔ sygnały' },
      {
        kind: 'group',
        label: 'D3. Signal Forms',
        children: [
          { kind: 'link', link: '/signal-forms/basics', label: 'Podstawy' },
          { kind: 'link', link: '/signal-forms/model', label: 'Model i form()' },
          { kind: 'link', link: '/signal-forms/dynamic', label: 'Formularz dynamiczny' },
          { kind: 'link', link: '/signal-forms/validators', label: 'Walidatory' },
          { kind: 'link', link: '/signal-forms/async-validators', label: 'Walidatory async' },
        ],
      },
    ],
  },
  {
    part: 'Część E',
    title: 'State management',
    items: [
      { kind: 'link', link: '/state/component', label: 'E1. Komponenty – stan lokalny' },
      { kind: 'link', link: '/state/signal-store', label: 'E2. Signal Store' },
      { kind: 'link', link: '/state/di-tree', label: 'E3. Komunikacja – drzewo DI' },
      { kind: 'link', link: '/state/long-distance', label: 'E4. Daleka odległość' },
      { kind: 'link', link: '/state/event-driven', label: 'E5. Event driven' },
      {
        kind: 'group',
        label: 'E6. NgRx Signals',
        children: [
          { kind: 'link', link: '/state/ngrx/basics', label: 'Podstawy' },
          { kind: 'link', link: '/state/ngrx/signal-store', label: 'Signal store' },
          { kind: 'link', link: '/state/ngrx/entities', label: 'Entities' },
          { kind: 'link', link: '/state/ngrx/events', label: 'Events' },
        ],
      },
    ],
  },
];
