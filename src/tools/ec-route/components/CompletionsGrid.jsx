import { PATH_COLOR, PATH_NAME } from "../lib/constants.js";

// Per-EC completion counters, colored by the path the next completion wants.
export function CompletionsGrid({ rows, meta, setComp, hideDone, setHideDone, showAll, setShowAll }) {
  return (
    <div className="sec">
      <div className="sechead">
        <h2>Your completions</h2>
        <div className="rule" />
        <button className={"chip" + (hideDone ? " on" : "")} onClick={() => setHideDone((s) => !s)} aria-pressed={hideDone}>
          hide finished
        </button>
        <button className={"chip" + (showAll ? " on" : "")} onClick={() => setShowAll((s) => !s)} aria-pressed={showAll}>
          show out-of-range
        </button>
      </div>
      <div className="lede">
        Tags show the dimension path each challenge's tree uses — AD antimatter, ID infinity, TD time.
      </div>
      <div className="grid">
        {rows.map((r) => {
          const m = meta[r.ec];
          const pc = PATH_COLOR[r.entry ? r.entry.path : "-"] || "var(--dim)";
          return (
            <div className="ecard" key={r.ec} style={{ "--pc": pc }}>
              <div className="name">
                <span className="ecname">EC{r.ec}</span>
                {r.entry ? (
                  <span className="tag" title={PATH_NAME[r.entry.path] || ""}>{r.entry.path || "—"}</span>
                ) : (
                  <span className="tag" style={{ color: "var(--go)" }}>done</span>
                )}
              </div>
              <div className="restr">{m.restriction}</div>
              <div className="pips">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={"pip" + (r.done === n ? " on" : "")}
                    onClick={() => setComp(r.ec, n)}
                    aria-label={`EC${r.ec} at ${n} completions`}
                    aria-pressed={r.done === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
