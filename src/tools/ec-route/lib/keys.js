import { ROUTE } from "../data/route.js";

// Canonical identity for a route entry, e.g. "8x3" for EC8's third completion.
export const keyOf = (e) => `${e.ec}x${e.comp}`;

export const ENTRY_BY_KEY = {};
ROUTE.entries.forEach((e) => { ENTRY_BY_KEY[keyOf(e)] = e; });

export const DEFAULT_ROUTE = ROUTE.entries.slice().sort((a, b) => a.order - b.order).map(keyOf);

// A stored route is only usable if it's a permutation of the shipped one AND
// keeps each EC's completions in increasing order (ECx2 before ECx1 is
// impossible in game, and the editor's swap guard can't repair it).
export function validRoute(order) {
  if (!Array.isArray(order) || order.length !== DEFAULT_ROUTE.length) return false;
  if (new Set(order).size !== order.length) return false;
  if (!order.every((k) => ENTRY_BY_KEY[k])) return false;
  const lastComp = {};
  for (const k of order) {
    const e = ENTRY_BY_KEY[k];
    if ((lastComp[e.ec] || 0) > e.comp) return false;
    lastComp[e.ec] = e.comp;
  }
  return true;
}
