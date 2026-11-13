/**
 * The contract between domains ("published language").
 * Payloads are plain data defined HERE – an event never imports a domain model,
 * otherwise shared → domain would be a forbidden dependency.
 * Names: past tense ("something happened"), not commands ("do something").
 */
export interface ProductRef {
  id: number;
  name: string;
  price: number;
}

export interface SoldLine {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export type AppEvent =
  | { type: '[Products] Reserved'; product: ProductRef }
  | { type: '[Cart] Items Released'; items: { productId: number; qty: number }[] }
  | { type: '[Cart] Checked Out'; lines: SoldLine[]; total: number };

export type AppEventType = AppEvent['type'];

/** Narrow the union by its discriminator: EventOf<'[Cart] Checked Out'>. */
export type EventOf<T extends AppEventType> = Extract<AppEvent, { type: T }>;
