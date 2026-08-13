import { useEffect, useMemo, useState } from "react";
import { ROUTE } from "./data/route.js";
import { FARMS } from "./data/farms.js";
import { PACE_CHAIN, DEFAULT_ORDER } from "./lib/constants.js";
import { keyOf, ENTRY_BY_KEY, DEFAULT_ROUTE } from "./lib/keys.js";
import { parseTree, joinTree, treeCost, whichOf, pathsIn, swapChain, setPaths, unmetReqs } from "./lib/tree.js";
import { sanitizeConfig } from "./lib/sanitize.js";
import { loadSaved, saveState } from "./lib/storage.js";
import { useCopy } from "./hooks/useCopy.js";
import { TtInput } from "./components/TtInput.jsx";
import { ProgressRail } from "./components/ProgressRail.jsx";
import { CompletionsGrid } from "./components/CompletionsGrid.jsx";
import { FarmSection } from "./components/FarmSection.jsx";
import { SettingsPanel } from "./components/SettingsPanel.jsx";
import { ReadySection } from "./components/ReadySection.jsx";
import { LockedSection } from "./components/LockedSection.jsx";

const EMPTY = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };

// localStorage carries the same untrusted shape as a pasted import.
const saved = sanitizeConfig(loadSaved());

export default function ECRoutePlanner() {
  const [tt, setTt] = useState(saved.tt ?? 0);
  const [comps, setComps] = useState({ ...EMPTY, ...(saved.comps || {}) });
  const [showAll, setShowAll] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [pace, setPace] = useState(saved.pace || "Active");
  const [capacity, setCapacity] = useState(saved.capacity || 1);
  const [orders, setOrders] = useState({ ...DEFAULT_ORDER, ...(saved.orders || {}) });
  const [mode, setMode] = useState(saved.mode || "ep");
  const [customs, setCustoms] = useState(saved.customs || []);
  const [routeOrder, setRouteOrder] = useState(saved.routeOrder || DEFAULT_ROUTE);
  const [panel, setPanel] = useState(false);
  const [lastMark, setLastMark] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, copy] = useCopy();

  // Debounced autosave of everything worth keeping.
  useEffect(() => {
    const id = setTimeout(() => {
      saveState({ tt, comps, pace, mode, capacity, orders, customs, routeOrder });
    }, 400);
    return () => clearTimeout(id);
  }, [tt, comps, pace, mode, capacity, orders, customs, routeOrder]);

  // "really reset?" reverts on its own if the second click never comes.
  useEffect(() => {
    if (!confirmReset) return;
    const id = setTimeout(() => setConfirmReset(false), 4000);
    return () => clearTimeout(id);
  }, [confirmReset]);

  // Entries in the user's route order, each stamped with its step index.
  const orderedEntries = useMemo(
    () => routeOrder.map((k, i) => ({ ...ENTRY_BY_KEY[k], step: i })),
    [routeOrder]
  );

  const stepOf = useMemo(() => {
    const m = {};
    orderedEntries.forEach((e) => { m[keyOf(e)] = e.step; });
    return m;
  }, [orderedEntries]);

  const byEc = useMemo(() => {
    const m = {};
    orderedEntries.forEach((e) => { (m[e.ec] = m[e.ec] || []).push(e); });
    Object.values(m).forEach((a) => a.sort((x, y) => x.comp - y.comp));
    return m;
  }, [orderedEntries]);

  const rows = useMemo(() => {
    return Object.keys(byEc).map(Number).sort((a, b) => a - b).map((ec) => {
      const done = comps[ec] || 0;
      const next = done + 1;
      const entry = next <= 5 ? byEc[ec][next - 1] : null;
      const affordable = entry ? tt >= entry.tt : false;
      let best = entry;
      if (entry && affordable) {
        const better = byEc[ec].filter((e) => e.comp >= next && e.tt <= tt);
        best = better.reduce((a, b) => (b.tt > a.tt ? b : a), entry);
      }
      return { ec, done, next, entry, best, affordable, deficit: entry ? entry.tt - tt : 0 };
    });
  }, [byEc, comps, tt]);

  const order = orders[mode] || DEFAULT_ORDER[mode];

  // Farm tiers are mode-specific; customs remember the mode they were added in.
  const farm = useMemo(() => {
    const catalog = FARMS.filter((f) => (f.mode || "ep") === mode)
      .concat(customs.filter((c) => (c.mode || "ep") === mode).map((c) => ({ ...c, custom: true })));
    const built = catalog.map((f) => {
      const { ids, ec } = parseTree(f.tree);
      const basePace = whichOf(ids, PACE_CHAIN);
      let base = ids;
      if (basePace) base = swapChain(base, PACE_CHAIN, basePace, pace);
      // A tree can only carry extra paths if it actually contains TS201.
      const treeCap = pathsIn(base).length === 0 ? 0 : base.includes(201) ? 3 : 1;
      const slots = Math.min(capacity, treeCap);
      const out = slots ? setPaths(base, order.slice(0, slots)) : base;
      const baseCost = treeCost(base);
      return {
        ...f, ids: out, cost: treeCost(out), tree: joinTree(out, ec),
        baseCost, delta: treeCost(out) - baseCost, treeCap, slots,
        basePaths: pathsIn(base),
        shownPaths: order.filter((p) => pathsIn(out).includes(p)),
        basePace, unmet: unmetReqs(out, comps),
      };
    }).sort((a, b) => a.cost - b.cost);
    const ok = built.filter((f) => f.cost <= tt && f.unmet.length === 0);
    const best = ok.length ? ok[ok.length - 1] : null;
    const next = built.find((f) => f.cost > (best ? best.cost : -1));
    return { built, best, next };
  }, [tt, comps, pace, mode, capacity, order, customs]);

  // Click a path to promote it to first priority; everything else keeps its relative order.
  function promote(p) {
    setOrders((o) => {
      const cur = o[mode] || DEFAULT_ORDER[mode];
      return { ...o, [mode]: [p].concat(cur.filter((x) => x !== p)) };
    });
  }

  const ready = rows.filter((r) => r.entry && r.affordable)
    .sort((a, b) => stepOf[keyOf(a.entry)] - stepOf[keyOf(b.entry)]);
  const locked = rows.filter((r) => r.entry && !r.affordable).sort((a, b) => a.deficit - b.deficit);
  const finished = rows.filter((r) => !r.entry);
  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const nextGate = locked.length ? locked[0] : null;

  const visibleEcs = (showAll
    ? rows
    : rows.filter((r) => !r.entry || r.affordable || r.deficit <= (nextGate ? Math.max(nextGate.deficit, 1) : 1) * 1.5)
  ).filter((r) => !hideDone || r.entry);

  // Furthest step the current TT can afford — an index, not a count, so a
  // custom (non-monotonic) route order still marks the right tick.
  const hereIndex = orderedEntries.reduce((h, e, i) => (e.tt <= tt ? i : h), -1);
  const routeIsCustom = routeOrder.join(",") !== DEFAULT_ROUTE.join(",");

  function setComp(ec, v) {
    setComps((c) => ({ ...c, [ec]: v }));
  }
  function markDone(ec, comp) {
    setLastMark({ ec, comp, prev: comps[ec] || 0 });
    setComp(ec, comp);
  }
  function undoMark() {
    if (!lastMark) return;
    setComp(lastMark.ec, lastMark.prev);
    setLastMark(null);
  }
  function resetTracker() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setComps(EMPTY);
    setTt(0);
    setConfirmReset(false);
  }
  // Returns the field names actually applied, so the UI can say what happened.
  function importConfig(v) {
    const clean = sanitizeConfig(v);
    if (clean.tt !== undefined) setTt(clean.tt);
    if (clean.comps) setComps(clean.comps);
    if (clean.pace) setPace(clean.pace);
    if (clean.mode) setMode(clean.mode);
    if (clean.capacity) setCapacity(clean.capacity);
    if (clean.orders) setOrders(clean.orders);
    if (clean.customs) setCustoms(clean.customs);
    if (clean.routeOrder) setRouteOrder(clean.routeOrder);
    return Object.keys(clean);
  }

  return (
    <div className="wrap">
      <div className="inner">
        <div className="top">
          <div>
            <div className="eyebrow">Eternity Challenge route</div>
            <h1>What can I run right now?</h1>
          </div>
          <div className="topstats">
            <TtInput tt={tt} setTt={setTt} />
            <div className="stat">
              <b>{totalDone}</b>/60 completions · <b>{ready.length}</b> ready now
            </div>
          </div>
        </div>

        <ProgressRail entries={orderedEntries} comps={comps} tt={tt} hereIndex={hereIndex} totalDone={totalDone} />

        <CompletionsGrid
          rows={visibleEcs} meta={ROUTE.meta} setComp={setComp}
          hideDone={hideDone} setHideDone={setHideDone}
          showAll={showAll} setShowAll={setShowAll}
        />

        <ReadySection
          ready={ready} meta={ROUTE.meta} tt={tt} stepOf={stepOf}
          copied={copied} copy={copy}
          markDone={markDone} lastMark={lastMark} undoMark={undoMark} dismissMark={() => setLastMark(null)}
          ec8farm={ROUTE.ec8farm} routeIsCustom={routeIsCustom}
        />

        <FarmSection
          farm={farm} mode={mode} setMode={setMode} pace={pace} setPace={setPace}
          capacity={capacity} setCapacity={setCapacity}
          order={order} promote={promote}
          resetOrder={() => setOrders((o) => ({ ...o, [mode]: DEFAULT_ORDER[mode] }))}
          isDefaultOrder={order.join("") === DEFAULT_ORDER[mode].join("")}
          tt={tt} copied={copied} copy={copy}
          panel={panel} togglePanel={() => setPanel((v) => !v)}
        />

        {panel && (
          <SettingsPanel
            comps={comps} mode={mode} customs={customs} setCustoms={setCustoms}
            copied={copied} copy={copy}
            exportState={{ tt, comps, pace, mode, capacity, orders, customs, routeOrder }}
            importConfig={importConfig}
            farmBuilt={farm.built} entries={orderedEntries}
            routeOrder={routeOrder} setRouteOrder={setRouteOrder}
            routeIsCustom={routeIsCustom} defaultRoute={DEFAULT_ROUTE}
          />
        )}

        <LockedSection
          locked={locked} meta={ROUTE.meta} stepOf={stepOf}
          showAll={showAll} setShowAll={setShowAll}
          copied={copied} copy={copy}
        />

        {finished.length > 0 && (
          <div className="sec">
            <div className="sechead">
              <h2>Cleared</h2>
              <div className="rule" />
            </div>
            <div className="empty">
              {finished.map((r) => `EC${r.ec}`).join(", ")} — all 5 completions done.
            </div>
          </div>
        )}

        <div className="foot">
          <span>
            Route, TT numbers and study trees from the community sheet “Antimatter Dimensions — Eternity and Eternity Challenges”.
            Trees are recommendations, not the only way through.
          </span>
          <button
            className="more"
            style={confirmReset ? { color: "var(--warn)" } : undefined}
            onClick={resetTracker}
          >
            {confirmReset ? "really reset TT & completions?" : "reset tracker"}
          </button>
        </div>
      </div>
    </div>
  );
}
