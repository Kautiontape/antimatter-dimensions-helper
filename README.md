# Antimatter Dimensions Helper

Companion tools for [Antimatter Dimensions](https://ivark.github.io/AntimatterDimensions/). One tool so far, with more planned as the playthrough progresses.

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
  App.jsx                    # site shell; tool registry for future tools
  tools/ec-route/
    ECRoutePlanner.jsx       # state + composition
    data/                    # route entries, time study graph, farming tiers
    lib/                     # tree parsing/repair/cost logic, storage
    components/              # one file per section of the UI
```

## Planned

- Automator script helper, once the playthrough reaches the Automator.

## License

MIT. Not affiliated with Antimatter Dimensions; game data belongs to its authors.
