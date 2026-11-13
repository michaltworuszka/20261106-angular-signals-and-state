/**
 * Sheriff demo – uncomment ONE line: the IDE and `pnpm lint` report it.
 * In A4 products → cart was allowed (one direction). Here domains must not import each other at all.
 */

// export { StockStore } from '../../products/state'; // ❌ e6-events:cart → e6-events:products

// export { EventBus } from '../../../shared/events'; // ✅ every domain → shared events

export {};
