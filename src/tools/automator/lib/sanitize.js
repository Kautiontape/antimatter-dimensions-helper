import { GEN_DEFAULTS, LIMITS } from "./generate.js";

// localStorage and a pasted export file carry exactly the same trust level:
// none. Everything below coerces rather than validates, so a damaged entry
// comes back usable instead of taking the render down with it.

const PACES = ["Active", "Passive", "Idle"];
const PATHS = ["AD", "ID", "TD"];

// Bodies are pasted from anywhere; cap them well above the game's own 10k limit
// so an over-long script is still editable down to size rather than truncated
// out from under someone.
const MAX_BODY = 40000;
const MAX_LINE = 400;

const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");

// Only ever render a link we know is a link. A stored `javascript:` URL would
// otherwise become a working one the moment it lands in an href.
function cleanUrl(v) {
  if (typeof v !== "string") return "";
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function cleanConstants(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c) => c && typeof c.name === "string" && typeof c.value === "string")
    .slice(0, LIMITS.constantCount)
    .map((c) => ({
      name: c.name.slice(0, LIMITS.constantNameChars),
      value: c.value.slice(0, LIMITS.constantValueChars),
    }))
    .filter((c) => c.name);
}

let idCounter = 0;
const newId = () => `s${Date.now().toString(36)}${(idCounter++).toString(36)}`;

/** One script from an untrusted source, coerced into something renderable. */
export function sanitizeScript(v) {
  if (!v || typeof v !== "object") return null;
  const body = str(v.body, MAX_BODY)
    .split("\n")
    .map((line) => line.slice(0, MAX_LINE))
    .join("\n");
  if (!body.trim()) return null;
  return {
    id: str(v.id, 40) || newId(),
    name: str(v.name, LIMITS.nameChars).trim() || "Script",
    title: str(v.title, 120).trim(),
    author: str(v.author, 60).trim(),
    source: cleanUrl(v.source),
    sourceLabel: str(v.sourceLabel, 120).trim(),
    era: str(v.era, 120).trim(),
    summary: str(v.summary, 1200).trim(),
    tags: Array.isArray(v.tags) ? v.tags.filter((t) => typeof t === "string").slice(0, 8).map((t) => t.slice(0, 20)) : [],
    constants: cleanConstants(v.constants),
    body,
  };
}

function num(v, lo, hi, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
}

// Autobuyer settings are free text on purpose — "1e20 x highest", "5s" and
// "0 ep" are all valid and this tool deliberately doesn't parse the language.
const setting = (v, fallback) =>
  typeof v === "string" && v.trim() && v.length <= 40 ? v.trim() : fallback;

export function sanitizeOptions(v) {
  const out = { ...GEN_DEFAULTS };
  if (!v || typeof v !== "object") return out;
  if (PACES.includes(v.pace)) out.pace = v.pace;
  out.capacity = num(v.capacity, 1, 3, GEN_DEFAULTS.capacity);
  if (Array.isArray(v.order)) {
    const seen = v.order.filter((p) => PATHS.includes(p)).filter((p, i, a) => a.indexOf(p) === i);
    out.order = seen.concat(GEN_DEFAULTS.order.filter((p) => !seen.includes(p)));
  }
  out.farmCrunch = setting(v.farmCrunch, GEN_DEFAULTS.farmCrunch);
  out.ecCrunch = setting(v.ecCrunch, GEN_DEFAULTS.ecCrunch);
  out.ec4Crunch = setting(v.ec4Crunch, GEN_DEFAULTS.ec4Crunch);
  out.pause = num(v.pause, 0, 600, GEN_DEFAULTS.pause);
  out.notes = v.notes !== false;
  out.count = num(v.count, 0, 60, GEN_DEFAULTS.count);
  out.useProgress = Boolean(v.useProgress);
  return out;
}

/** The whole saved blob: the scripts someone wrote plus their generator settings. */
export function sanitizeState(v) {
  const out = {};
  if (!v || typeof v !== "object") return out;
  if (Array.isArray(v.scripts)) {
    out.scripts = v.scripts.map(sanitizeScript).filter(Boolean).slice(0, 100);
  }
  if (v.options) out.options = sanitizeOptions(v.options);
  if (typeof v.selected === "string") out.selected = v.selected.slice(0, 40);
  return out;
}
