# Antimatter Dimensions Helper

Companion tools for [Antimatter Dimensions](https://ivark.github.io/AntimatterDimensions/), added as the playthrough reaches them.

**Live:** https://kautiontape.github.io/antimatter-dimensions-helper/

## EC Route Planner

Answers "what can I run right now?" during the Eternity Challenge grind. Enter your Time Theorems and it shows:

- **Ready challenges** in route order, each with a copy-paste study tree. When you have more TT than an entry planned for, it automatically substitutes the tree from a later completion of the same challenge — same unlock, strictly more studies.
- **A progress rail** of all 60 completions — done, affordable, and locked at a glance.
- **The best EP-farming (or dilation) tree** you can afford between challenges, with controls for Active/Passive/Idle pace, how many dimension paths you own (one / TS201 / three with the 1e10 DT upgrade), and click-to-promote path priority.
- **Locked entries** sorted by how much TT they still need, with the sheet's farming advice.

Completions and settings persist in localStorage. A settings panel adds:

- **Custom trees** — paste any study string; it's validated against the real prerequisite and split rules, missing prereqs get inserted, and it joins the farming tier list at its computed cost.
- **Route reordering** — the default order follows the community route sheet, and the couple of spots where guides disagree are flagged. Move any step earlier or later; completions of the same challenge always stay in sequence.
- **Export/import** — copy your whole state as JSON, or export the full tier plan / all EC trees as text.

### Data sources

- Route order, TT thresholds, and study trees from the community sheet *"Antimatter Dimensions — Eternity and Eternity Challenges"*, cross-checked against the Steam guide and the namu.wiki walkthrough (disagreements are flagged in the UI).
- Time study costs, prerequisites, and EC unlock costs mirror the game data in [IvarK/AntimatterDimensionsSourceCode](https://github.com/IvarK/AntimatterDimensionsSourceCode).

Trees are recommendations, not the only way through.

## Automator Scripts

A repository for Automator scripts, and the EC route written out as one.

The generated route script farms to each step's TT threshold, respecs into that step's tree, runs the challenge, and Eternities — the planner's process, in the Automator's own language:

```
// 5x1 · 147 TT
// unlock needs 160 Galaxies
auto infinity 1e20 x highest
until total tt >= 147 {
  studies nowait purchase FARM1
  wait pending ep > ep
  pause 6s
  eternity respec
}
auto infinity 1e10 x highest
if ec5 completions < 1 {
  studies purchase 11,21,22,32,42,51|5!
  wait pending completions >= 1
  eternity respec
}
```

- **Auto-eternity stays off.** The script triggers every Eternity itself, which needs no unlocks and stops the autobuyer from leaving a challenge before the completions land. Auto-infinity is the only autobuyer it sets, and it's editable: one level for farming, one for challenges, one for **EC4**, which caps Infinities at 16/12/8/4/**0** per completion and so gets `auto infinity off` for its fifth. **EC12**'s sub-second time limit is flagged in a comment rather than pretended away.
- **Idempotent.** Every challenge sits inside a `completions` check, so the script can be re-run from the top and picks up where you are. It can also read the planner's tracked completions and skip what's done, or emit just the next 6 or 12 steps.
- **Sized for the game.** Farming trees are hoisted into `FARM*` constants and the route is split across script slots to stay inside the game's limits (10,000 characters per script, 60,000 total, 20 scripts, 30 constants).

The repository also carries the Automator's five built-in templates, the two loops the route script is made of on their own, and scripts published by other players — [Ninjatsu's PreECR](https://steamcommunity.com/sharedfiles/filedetails/?id=3040232174) and [u/tovion's full EC ladder](https://reddit.com/r/AntimatterDimensions/comments/13o48j3/first_script_after_unlocking_automator/) — verbatim and credited.

Your own scripts save to localStorage. The whole library exports as JSON, and any single script can be copied as an `AntimatterDimensionsAutomatorScriptFormat…` string that the game's import box accepts; pasting one back in adds it to your library, constants included. Nothing is checked against the game's parser — this stores and moves scripts, it doesn't validate them.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Vite + React, no other runtime dependencies. Pushes to `main` deploy to GitHub Pages via Actions.

### Layout

```
src/
  App.jsx                    # site shell; tool registry, hash routing
  tools/ec-route/
    ECRoutePlanner.jsx       # state + composition
    data/                    # route entries, time study graph, farming tiers
    lib/                     # tree parsing/repair/cost logic, storage
    components/              # one file per section of the UI
  tools/automator/
    AutomatorRepo.jsx        # state + composition
    data/                    # built-in templates, community scripts, assembly
    lib/                     # route → script generator, game transfer codec
    components/              # list, detail, generator options, export/import
```

The Automator tool reads the route out of `tools/ec-route/data` rather than keeping a copy, so the script and the planner can't drift apart. Command syntax, the character limits, and the transfer format all follow [the game's source](https://github.com/IvarK/AntimatterDimensionsSourceCode) (`src/core/automator`).

## License

MIT. Not affiliated with Antimatter Dimensions; game data belongs to its authors.
