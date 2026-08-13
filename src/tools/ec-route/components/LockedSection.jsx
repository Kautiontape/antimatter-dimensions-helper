import { keyOf } from "../lib/keys.js";
import { TreeBar } from "./TreeBar.jsx";

// Next completions you can't afford yet, closest first.
export function LockedSection({ locked, meta, stepOf, showAll, setShowAll, copied, copy }) {
  return (
    <div className="sec">
      <div className="sechead">
        <h2>Locked — TT still needed</h2>
        <div className="rule" />
      </div>
      {locked.length === 0 && <div className="empty">Everything reachable is unlocked. Go farm.</div>}
      {locked.slice(0, showAll ? 12 : 5).map((r) => {
        const e = r.entry;
        const m = meta[r.ec];
        const key = `l${r.ec}`;
        return (
          <div className="row lockrow" key={key}>
            <div className="rhead">
              <span className="stepnum dim">{stepOf[keyOf(e)] + 1}</span>
              <span className="rlabel" style={{ color: "var(--dim)" }}>EC{r.ec}x{r.next}</span>
              <span className="rmeta">needs {e.tt} TT{e.time ? ` · ~${e.time}` : ""}</span>
              <span className="need">+{r.deficit} TT</span>
            </div>
            <div className="goal" style={{ color: "var(--mute)" }}>
              Unlock: {m.req[String(r.next)] || m.reqRaw} · Goal: {m.goal[String(r.next)]}
            </div>
            {e.lead && <div className="lead">Sheet says: {e.lead}</div>}
            <TreeBar tree={e.tree} copyKey={key} copied={copied} copy={copy} ghost />
          </div>
        );
      })}
      {!showAll && locked.length > 5 && (
        <button className="more" onClick={() => setShowAll(true)}>show the rest</button>
      )}
    </div>
  );
}
