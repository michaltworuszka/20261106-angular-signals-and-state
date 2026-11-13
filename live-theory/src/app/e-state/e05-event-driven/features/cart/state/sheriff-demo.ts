/**
 * Sheriff demo – uncomment ONE line: the IDE and `pnpm lint` report it.
 * In A4 products → cart was allowed (one direction). Here domains must not import each other at all.
 */

// export { Stock } from '../../products/state'; // ❌ e5:cart → e5:products

// export { EventBus } from '../../../shared/events'; // ✅ every domain → shared events

export {};
