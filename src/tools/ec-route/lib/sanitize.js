import { DEFAULT_ORDER } from "./constants.js";
import { validRoute } from "./keys.js";
import { repairTree } from "./tree.js";

const PACES = ["Active", "Passive", "Idle"];
const MODES = ["ep", "dilation"];
const PATHS = ["AD", "ID", "TD"];

// Coerce a path-priority list into a full valid permutation of AD/ID/TD.
function cleanOrder(arr, fallback) {
  if (!Array.isArray(arr)) return fallback;
  const seen = arr.filter((p) => PATHS.includes(p)).filter((p, i, a) => a.indexOf(p) === i);
  return seen.concat(fallback.filter((p) => !seen.includes(p)));
}

// Turn an untrusted config payload (localStorage or pasted import) into a safe
// partial state. Returns only the fields that were present and valid — invalid
// values crash renders otherwise (e.g. pace:"bogus" throws inside swapChain).
export function sanitizeConfig(v) {
  const out = {};
  if (!v || typeof v !== "object") return out;
  if (typeof v.tt === "number" && Number.isFinite(v.tt)) out.tt = Math.max(0, Math.floor(v.tt));
  if (v.comps && typeof v.comps === "object") {
    const comps = {};
    for (let ec = 1; ec <= 12; ec++) {
      const n = Number(v.comps[ec]);
      comps[ec] = Number.isFinite(n) ? Math.min(5, Math.max(0, Math.floor(n))) : 0;
    }
    out.comps = comps;
  }
  if (PACES.includes(v.pace)) out.pace = v.pace;
  if (MODES.includes(v.mode)) out.mode = v.mode;
  if (v.capacity != null) {
    const c = Number(v.capacity);
    if (Number.isFinite(c)) out.capacity = Math.min(3, Math.max(1, Math.floor(c)));
  }
  if (v.orders && typeof v.orders === "object") {
    out.orders = {
      ep: cleanOrder(v.orders.ep, DEFAULT_ORDER.ep),
      dilation: cleanOrder(v.orders.dilation, DEFAULT_ORDER.dilation),
    };
  }
  if (Array.isArray(v.customs)) {
    out.customs = v.customs
      .filter((c) => c && typeof c.tree === "string")
      .map((c) => {
        const r = repairTree(c.tree);
        return {
          label: typeof c.label === "string" && c.label ? c.label : "custom",
          tree: r.tree,
          notes: r.notes,
          mode: MODES.includes(c.mode) ? c.mode : "ep",
        };
      })
      .filter((c) => c.tree !== "|0");
  }
  if (validRoute(v.routeOrder)) out.routeOrder = v.routeOrder;
  return out;
}
