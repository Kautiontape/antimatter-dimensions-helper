// Turns the EC route into Automator scripts.
//
// The route data lives in the EC Route Planner because that is where it is
// maintained; this is a second reading of the same tables, so the script and
// the planner can never disagree about what the route is.
//
// Shape of one route step, farm loop then challenge:
//
//   auto infinity 1e20 x highest
//   until total tt >= 147 {
//     studies nowait purchase FARM3
//     wait pending ep > ep
//     pause 6s
//     eternity respec
//   }
//   auto infinity 1e10 x highest
//   if ec5 completions < 1 {
//     studies purchase 11,21,22,32,42,51|5!
//     wait pending completions >= 1
//     eternity respec
//   }
//
// `|5!` buys the tree, unlocks EC5 and starts it in one command. Every block
// ends on a respecced Eternity, so the next block always starts from an empty
// tree. Auto-eternity stays off for the whole run: the script triggers every
// Eternity itself, which needs no unlocks and keeps the autobuyer from exiting
// a challenge before the completions land.
import { ROUTE } from "../../ec-route/data/route.js";
import { FARMS } from "../../ec-route/data/farms.js";
import { PACE_CHAIN, DEFAULT_ORDER } from "../../ec-route/lib/constants.js";
import { ENTRY_BY_KEY, DEFAULT_ROUTE } from "../../ec-route/lib/keys.js";
import { parseTree, treeCost, whichOf, pathsIn, setPaths, swapChain, unmetReqs } from "../../ec-route/lib/tree.js";

// Hard limits the game enforces on scripts (AutomatorData in the game source).
export const LIMITS = {
  scriptChars: 10000,
  totalChars: 60000,
  scriptCount: 20,
  nameChars: 15,
  constantCount: 30,
  constantNameChars: 20,
  constantValueChars: 250,
};

// Every EC unlock study carries a second requirement besides its Time Theorem
// cost — 40,000 Eternities for EC1's second completion, and so on. Miss one and
// `studies purchase …|N!` sits there waiting with nothing to show for it, so
// the script says out loud what it is waiting for. The numbers come from the
// planner's own table rather than a second copy of the formulas.
const unlockReq = (ec, comp) => (ROUTE.meta[ec] && ROUTE.meta[ec].req ? ROUTE.meta[ec].req[comp] || "" : "");

// Eternities are the one requirement the script can also resolve on its own:
// they only accrue by Eternitying, which is exactly what the farming loop does,
// so a run that would otherwise stall forever instead farms until it can go.
function waitableReq(text) {
  const match = /^(\d+)\s+Eternities$/u.exec(text);
  return match ? `eternities > ${match[1]}` : null;
}

// EC4 caps how many Infinities you may have when the goal is reached:
// max(16 - 4 * completions, 0). The fifth completion allows none at all.
export const ec4InfinityCap = (comp) => Math.max(16 - 4 * (comp - 1), 0);

// EC12 must be finished inside max(10 - 2 * completions, 1) / 10 in-game seconds.
export const ec12Seconds = (comp) => Math.max(10 - 2 * (comp - 1), 1) / 10;

export const GEN_DEFAULTS = {
  pace: "Active",
  capacity: 1,
  order: DEFAULT_ORDER.ep,
  farmCrunch: "1e20 x highest",
  ecCrunch: "1e10 x highest",
  ec4Crunch: "1e50 x highest",
  pause: 6,
  notes: true,
  partChars: 9200,
  from: 0,
  count: 0, // 0 = to the end of the route
};

const EMPTY_COMPS = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };

// The tier list's own label describes the tree as written; once pace and path
// priority have been applied it no longer matches, so rebuild the parts that
// moved and keep only the "TS181/191" style markers from the original.
function describe(ids, label, pace, order) {
  const paths = order.filter((p) => pathsIn(ids).includes(p));
  const extras = String(label).split(" · ").filter((s) => s.startsWith("TS"));
  return [paths.join("+") || "no split", pace, ...extras].join(" · ");
}

// The EP farming tiers, rebuilt for the requested pace and path priority —
// the same transformation the planner's farm section runs.
function farmCatalog({ pace, capacity, order }) {
  return FARMS
    .filter((f) => (f.mode || "ep") === "ep")
    .map((f) => {
      const { ids } = parseTree(f.tree);
      const basePace = whichOf(ids, PACE_CHAIN);
      const base = basePace ? swapChain(ids, PACE_CHAIN, basePace, pace) : ids;
      // A tree can only carry extra dimension paths if it actually contains TS201.
      const treeCap = pathsIn(base).length === 0 ? 0 : base.includes(201) ? 3 : 1;
      const slots = Math.min(capacity, treeCap);
      const out = slots ? setPaths(base, order.slice(0, slots)) : base;
      return { label: describe(out, f.label, pace, order), ids: out, value: out.join(","), cost: treeCost(out) };
    })
    .sort((a, b) => a.cost - b.cost);
}

// Priciest tier you can afford at `tt` whose studies you can actually hold —
// TS181 and friends need EC completions you may not have yet.
function bestFarm(catalog, tt, comps) {
  const ok = catalog.filter((f) => f.cost <= tt && unmetReqs(f.ids, comps).length === 0);
  return ok.length ? ok[ok.length - 1] : null;
}

function crunchFor(step, opt) {
  if (step.ec === 12) return "off";
  if (step.ec === 4) return ec4InfinityCap(step.comp) === 0 ? "off" : opt.ec4Crunch;
  return opt.ecCrunch;
}

// Per-step warnings worth carrying into the script as comments.
function cautionFor(step) {
  if (step.ec === 4) {
    const cap = ec4InfinityCap(step.comp);
    return cap === 0
      ? "no Infinities allowed this run"
      : `at most ${cap} Infinities this run`;
  }
  if (step.ec === 12) return `goal must be reached in ${ec12Seconds(step.comp)}s of game time`;
  return "";
}

// One farming loop: rebuy the tier, Eternity when the run has doubled your EP,
// repeat until `condition` is met.
function farmBlock(condition, farm, opt) {
  return [
    `until ${condition} {`,
    `  studies nowait purchase ${farm.name}`,
    `  wait pending ep > ep`,
    `  pause ${opt.pause}s`,
    `  eternity respec`,
    `}`,
  ];
}

function ecBlock(step) {
  const { ec } = parseTree(step.tree);
  const lines = [`if ec${step.ec} completions < ${step.comp} {`];
  if (ec === step.ec) {
    // The |EC suffix unlocks the challenge, the ! starts it.
    lines.push(`  studies purchase ${step.tree}!`);
  } else {
    // Route trees always carry their own EC, but never trust that blindly.
    lines.push(`  studies purchase ${step.tree}`);
    lines.push(`  unlock ec ${step.ec}`);
    lines.push(`  start ec ${step.ec}`);
  }
  lines.push(`  wait pending completions >= ${step.comp}`);
  lines.push(`  eternity respec`);
  lines.push(`}`);
  return lines;
}

const PREAMBLE = [
  `// EC ROUTE · antimatter dimensions helper`,
  `//`,
  `// 1. Add the FARM constants listed with this script (Automator > Constants).`,
  `// 2. Turn your Time Theorem autobuyers ON — the Automator cannot buy TT.`,
  `// 3. Leave the Eternity autobuyer alone; this script drives every Eternity.`,
  `// 4. Run the parts in order. Completions you already have are skipped.`,
  `auto eternity off`,
].join("\n");

// Every part after the first still has to assert the autobuyer state, because
// a part can be started on its own.
const CONTINUATION = `auto eternity off`;

/**
 * Build the route as a set of scripts plus the constants they reference.
 *
 * @param {object} options  See GEN_DEFAULTS. `comps` seeds completions already
 *   done (steps at or below them are dropped rather than guarded), `routeOrder`
 *   accepts the planner's custom ordering, and `from`/`count` cut a window out
 *   of the route for a short one-script version.
 * @returns {{constants: object[], parts: object[], steps: number, warnings: string[]}}
 */
export function generateRoute(options = {}) {
  const opt = { ...GEN_DEFAULTS, ...options };
  const comps = { ...EMPTY_COMPS, ...(options.comps || {}) };
  const order = Array.isArray(opt.routeOrder) && opt.routeOrder.length ? opt.routeOrder : DEFAULT_ROUTE;
  const catalog = farmCatalog(opt);
  const warnings = [];

  const all = order.map((k) => ENTRY_BY_KEY[k]).filter(Boolean);
  // Completions already done are simulated, not emitted — walking the whole
  // route keeps the farm tiers (which depend on completions) honest.
  const remaining = [];
  for (const step of all) {
    if ((comps[step.ec] || 0) >= step.comp) continue;
    remaining.push(step);
  }
  const chosen = remaining.slice(opt.from, opt.count > 0 ? opt.from + opt.count : undefined);

  const used = new Map(); // farm tree value -> constant record
  const blocks = [];
  let ttReached = 0;
  let crunch = null;

  for (const step of all) {
    const done = (comps[step.ec] || 0) >= step.comp;
    const farm = bestFarm(catalog, step.tt, comps);
    const inWindow = chosen.includes(step);

    if (!done && inWindow) {
      const lines = [];
      const caution = cautionFor(step);
      const req = unlockReq(step.ec, step.comp);
      lines.push(`// ${step.ec}x${step.comp} · ${step.tt} TT${caution ? ` · ${caution}` : ""}`);
      if (req) lines.push(`// unlock needs ${req}`);
      if (opt.notes && step.lead) lines.push(`// ${step.lead}`);
      if (opt.notes && step.note) lines.push(`// ${step.note}`);

      // Farming loops, in order: enough TT for the tree, then any unlock
      // requirement the script can actually wait on.
      const gates = [];
      if (step.tt > ttReached) gates.push(`total tt >= ${step.tt}`);
      const waitable = waitableReq(req);
      if (waitable) gates.push(waitable);

      if (gates.length) {
        if (crunch !== opt.farmCrunch) {
          lines.push(`auto infinity ${opt.farmCrunch}`);
          crunch = opt.farmCrunch;
        }
        if (farm) {
          if (!used.has(farm.value)) {
            const name = `FARM${used.size + 1}`;
            used.set(farm.value, { name, value: farm.value, label: farm.label, cost: farm.cost });
          }
          const constant = used.get(farm.value);
          gates.forEach((g) => lines.push(...farmBlock(g, constant, opt)));
        } else {
          // Nothing in the tier list is affordable this early; farm on whatever
          // tree the previous block left behind rather than emitting nonsense.
          gates.forEach((g) => lines.push(
            `until ${g} {`, `  wait pending ep > ep`, `  pause ${opt.pause}s`, `  eternity respec`, `}`
          ));
          warnings.push(`Step ${step.ec}x${step.comp}: no farming tier is affordable at ${step.tt} TT.`);
        }
      }

      const want = crunchFor(step, opt);
      if (crunch !== want) {
        lines.push(`auto infinity ${want}`);
        crunch = want;
      }
      lines.push(...ecBlock(step));
      blocks.push(lines.join("\n"));
    }

    if (step.tt > ttReached) ttReached = step.tt;
    comps[step.ec] = Math.max(comps[step.ec] || 0, step.comp);
  }

  if (blocks.length) {
    blocks.push([`notify "EC route finished"`, `stop`].join("\n"));
  }

  const constants = Array.from(used.values());
  if (constants.length > LIMITS.constantCount) {
    warnings.push(`${constants.length} farming constants, but the game allows ${LIMITS.constantCount}.`);
  }
  constants.forEach((c) => {
    if (c.value.length > LIMITS.constantValueChars) {
      warnings.push(`${c.name} is ${c.value.length} characters; constants cap at ${LIMITS.constantValueChars}.`);
    }
  });

  const parts = chunk(blocks, opt);
  if (parts.length > LIMITS.scriptCount) {
    warnings.push(`${parts.length} scripts, but the game allows ${LIMITS.scriptCount}.`);
  }
  return { constants, parts, steps: chosen.length, warnings };
}

// Pack blocks into scripts under the character cap, never splitting a block.
function chunk(blocks, opt) {
  if (!blocks.length) return [];
  const bodies = [];
  let held = [PREAMBLE];
  let size = PREAMBLE.length;

  for (const block of blocks) {
    const cost = block.length + 2;
    if (size + cost > opt.partChars && held.length > 1) {
      bodies.push(held.join("\n\n"));
      held = [CONTINUATION];
      size = CONTINUATION.length;
    }
    held.push(block);
    size += cost;
  }
  if (held.length > 1) bodies.push(held.join("\n\n"));

  return bodies.map((body, i) => ({
    // Script names are capped at 15 characters in game.
    name: bodies.length === 1 ? "EC Route" : `EC Route ${i + 1}/${bodies.length}`,
    body,
    chars: body.length,
  }));
}
