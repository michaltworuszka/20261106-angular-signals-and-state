import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * Sheriff is scoped to the A4 / E5 / E6 mini apps only (the rest of live-theory = "root", unrestricted).
 * Every folder below is a module; its public API is its index.ts (barrel).
 * Tags: domain (which feature) + type (which layer).
 */
const A4 = 'src/app/a-app-structure/a4-sheriff/app';
/** E5 + E6 mini apps – event-driven: domains talk only via shared/events (pub-sub). */
const E5 = 'src/app/e-state/e05-event-driven';
const E6_ENTITIES = 'src/app/e-state/e06-entities';
const E6_EVENTS = 'src/app/e-state/e06-events';

/**
 * Same layout for every event-driven mini app. Own domain tag prefix per app (e5:, e6-…:),
 * so A4's 'domain:products' → 'domain:cart' does not leak in and apps can't import each other.
 */
function eventDrivenFeatures(path: string, prefix: string): SheriffConfig['modules'] {
  return {
    [`${path}/features/<domain>`]: [`${prefix}:<domain>`, 'type:feature'],
    [`${path}/features/<domain>/data`]: [`${prefix}:<domain>`, 'type:data'],
    [`${path}/features/<domain>/state`]: [`${prefix}:<domain>`, 'type:state'],
    [`${path}/features/<domain>/ui`]: [`${prefix}:<domain>`, 'type:ui'],
  };
}

export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  modules: {
    [`${A4}/features/<domain>`]: ['domain:<domain>', 'type:feature'],
    [`${A4}/features/<domain>/data`]: ['domain:<domain>', 'type:data'],
    [`${A4}/features/<domain>/state`]: ['domain:<domain>', 'type:state'],
    [`${A4}/features/<domain>/ui`]: ['domain:<domain>', 'type:ui'],
    [`${A4}/shared/<type>`]: ['domain:shared', 'type:<type>'],

    ...eventDrivenFeatures(E5, 'e5'),
    [`${E5}/shared/<type>`]: ['domain:shared', 'type:<type>'], // shared/events → type:events

    ...eventDrivenFeatures(E6_ENTITIES, 'e6-entities'),
    [`${E6_ENTITIES}/shared/<type>`]: ['domain:shared', 'type:<type>'], // own EventBus, as E5

    ...eventDrivenFeatures(E6_EVENTS, 'e6-events'),
    // NgRx event groups: components dispatch them too → separate tag, wider access.
    [`${E6_EVENTS}/shared/events`]: ['domain:shared', 'type:event-groups'],
  },
  depRules: {
    // Everything outside A4 modules (shell, other lessons, a4 shop.ts) may use features + shared.
    root: ['type:feature', 'domain:shared', 'noTag'],

    // A5 (Nx-like libs via tsconfig path aliases) are auto-detected as untagged modules.
    // Their boundaries are Nx's job (@nx/enforce-module-boundaries), not Sheriff's.
    noTag: ['noTag'],

    // Domains: itself + shared…
    'domain:*': [sameTag, 'domain:shared'],
    // …plus one planned direction: products → cart (never cart → products).
    'domain:products': ['domain:cart'],
    // E5: NO domain → domain rule at all. Communication only through shared events.
    'e5:*': [sameTag, 'domain:shared'],
    'e6-entities:*': [sameTag, 'domain:shared'],
    'e6-events:*': [sameTag, 'domain:shared'],

    // Layers
    'type:feature': ['type:feature', 'type:state', 'type:ui', 'type:data', 'type:event-groups'],
    'type:state': ['type:state', 'type:data', 'type:events', 'type:event-groups'], // E5: only state touches the bus
    'type:ui': ['type:ui', 'type:data'],
    'type:data': ['type:data'],
    'type:events': [],
    'type:event-groups': [],
  },
};
