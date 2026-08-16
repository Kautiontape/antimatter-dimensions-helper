import { TEMPLATES } from "./templates.js";
import { COMMUNITY } from "./community.js";
import { generateRoute } from "../lib/generate.js";

// The two loops the route script is built out of, on their own. Most one-off
// jobs are one of these with different numbers in them.
export const SNIPPETS = [
  {
    id: "snip-ec-to-five",
    name: "EC to five",
    title: "Take one challenge to five completions",
    author: "Antimatter Dimensions Helper",
    source: "",
    sourceLabel: "",
    era: "any Eternity Challenge you can already afford",
    tags: ["ec", "snippet"],
    summary:
      "Swap in the challenge number and the tree from the planner. The tree ends in |6! — the |6 buys the unlock study, the ! starts the challenge — and auto-Eternity stays off so the autobuyer cannot bail out after the first completion.",
    constants: [],
    body: `auto eternity off
auto infinity 1e10 x highest
until ec6 completions >= 5 {
  studies purchase 11,21,22,32,42,51,61,62,72,82,92,102,111,121,131,141,151,162|6!
  wait pending completions >= 5
  eternity respec
}
auto infinity off`,
  },
  {
    id: "snip-farm-tt",
    name: "Farm to TT",
    title: "Farm Eternity Points to a Time Theorem target",
    author: "Antimatter Dimensions Helper",
    source: "",
    sourceLabel: "",
    era: "between challenges",
    tags: ["farm", "snippet"],
    summary:
      "Rebuy the tree, Eternity once the run would double your EP, repeat until the Time Theorem total is high enough. The pause after the doubling point is the tuning knob: longer means fewer, fatter Eternities. Time Theorem autobuyers have to be on — the Automator has no command to buy them.",
    constants: [],
    body: `auto eternity off
auto infinity 1e20 x highest
until total tt >= 200 {
  studies nowait purchase 11,22,32,42,51,61,72,82,92,102,111,121,131,141,151,161,171
  wait pending ep > ep
  pause 6s
  eternity respec
}`,
  },
];

const ordinal = (i, n) => (n === 1 ? "" : ` ${i + 1} of ${n}`);

/**
 * The route, as library entries. Regenerated whenever the options change, so
 * these are never stored — editing one means duplicating it first.
 */
export function routeScripts(options) {
  const { parts, constants, warnings, steps } = generateRoute(options);
  const scripts = parts.map((part, i) => ({
    id: `route-${i + 1}`,
    name: part.name,
    title: `EC route${ordinal(i, parts.length)}`,
    author: "Antimatter Dimensions Helper",
    source: "",
    sourceLabel: "generated from the EC Route Planner's data",
    era: options.count > 0 ? `next ${steps} completions` : "all 60 completions",
    tags: ["route", "generated"],
    summary:
      i === 0
        ? "Farm to each step's Time Theorem threshold, respec into that step's tree, run the challenge, Eternity. Each challenge is wrapped in a completions check, so completions you already have are skipped and the script can be re-run from the top at any point."
        : "Continues the route. Run the parts in order; each one re-asserts that auto-Eternity is off in case you start it on its own.",
    constants: constants.filter((c) => new RegExp(`\\b${c.name}\\b`, "u").test(part.body)),
    body: part.body,
    generated: true,
  }));
  return { scripts, constants, warnings, steps };
}

export function builtinScripts(options) {
  const route = routeScripts(options);
  const stamp = (group) => (s) => ({ ...s, group });
  return {
    ...route,
    all: [
      ...route.scripts.map(stamp("route")),
      ...SNIPPETS.map(stamp("snippet")),
      ...TEMPLATES.map(stamp("template")),
      ...COMMUNITY.map(stamp("community")),
    ],
  };
}
