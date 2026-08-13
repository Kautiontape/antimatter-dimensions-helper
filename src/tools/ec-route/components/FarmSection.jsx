import { PATH_COLOR, PATH_NAME, CAP_NOTE } from "../lib/constants.js";
import { TreeBar } from "./TreeBar.jsx";

// The best farming tree you can afford right now, with pace / path controls.
export function FarmSection({
  farm, mode, setMode, pace, setPace, capacity, setCapacity,
  order, promote, resetOrder, isDefaultOrder,
  tt, copied, copy, panel, togglePanel,
}) {
  const best = farm.best;
  return (
    <div className="sec">
      <div className="sechead">
        <h2>{mode === "ep" ? "EP farming tree" : "Dilation tree"}</h2>
        <div className="rule" />
        <div className="seg">
          <button className={mode === "ep" ? "on" : ""} onClick={() => setMode("ep")}>EP / TT</button>
          <button className={mode === "dilation" ? "on" : ""} onClick={() => setMode("dilation")}>Dilation (TP)</button>
        </div>
      </div>
      <div className="lede">
        {mode === "ep"
          ? "Between challenges, undilated. You're pushing EP, which is what buys TT."
          : "Inside dilation. TP comes from the antimatter you reach, and TP produces DT — which is why AD earns a slot here and doesn't in EP farming. Unlocks at 12,900 TT."}
      </div>
      {best ? (
        <div className="row" style={{ "--pc": PATH_COLOR[best.shownPaths[best.shownPaths.length - 1]] || "var(--go)" }}>
          <div className="rhead">
            <span className="seglabel">Tree tier</span>
            <span className="rlabel">{best.cost} TT</span>
            {best.delta !== 0 && (
              <span className="rmeta mono">
                {best.baseCost} sourced {best.delta > 0 ? "+" : "−"}{Math.abs(best.delta)}
              </span>
            )}
            <span className="tag" title={best.shownPaths.map((p) => PATH_NAME[p]).join(" + ")}>
              {best.shownPaths.join("+") || "—"}
            </span>
            <span className="rmeta">{best.label}</span>
            <span className="need short">{tt - best.cost} TT spare</span>
          </div>
          <div className="segrow">
            <span className="seglabel">Pace</span>
            <div className="seg">
              {["Active", "Passive", "Idle"].map((p) => (
                <button key={p} className={pace === p ? "on" : ""} onClick={() => setPace(p)}>{p}</button>
              ))}
            </div>
            <span className="seglabel">Paths owned</span>
            <div className="seg">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={capacity === n ? "on" : ""}
                  onClick={() => setCapacity(n)}
                  title={CAP_NOTE[n]}
                >{n}</button>
              ))}
            </div>
          </div>
          <div className="segrow">
            <span className="seglabel">Priority</span>
            <div className="chips">
              {order.map((p, i) => {
                const live = i < best.slots;
                return (
                  <button
                    key={p}
                    className={"pchip" + (live ? " live" : "")}
                    style={{ "--pc": PATH_COLOR[p] }}
                    onClick={() => promote(p)}
                    title={`${PATH_NAME[p]} — ${live ? `priority ${i + 1}` : "not bought at this capacity"}`}
                  >
                    <span className="rank">{live ? i + 1 : "–"}</span>{p}
                  </button>
                );
              })}
            </div>
            <span className="hint">click to promote</span>
            {!isDefaultOrder && (
              <button className="more" onClick={resetOrder}>reset order</button>
            )}
          </div>
          {best.treeCap > 0 && capacity > best.treeCap && (
            <div className="swap">
              ▲ This tier has no TS201, so it can only run one path — the extra {capacity - best.treeCap} will
              apply once you're on a tree that has it.
            </div>
          )}
          <TreeBar tree={best.tree} copyKey="farm" copied={copied} copy={copy} />
          {best.slots > 1 && (
            <div className="note">
              Extra paths are written after TS201 — the importer buys left to right and skips what it can't afford,
              so priority order is what actually decides them on a thin TT buffer.
              {mode === "ep"
                ? " ID beats AD almost everywhere and TD overtakes both once TS171 is bought. AD is only right where IDs and TDs are nerfed — EC7, EC10, EC11."
                : " Dilated, you're chasing antimatter for TP, so AD earns its slot early."}
            </div>
          )}
          {capacity === 3 && (
            <div className="note">Three paths need the 1e10 DT dilation upgrade.</div>
          )}
          {farm.next && (
            <div className="note">
              Next tier: <span className="mono">{farm.next.cost} TT</span> ({farm.next.label}) —
              {farm.next.cost > tt ? ` +${farm.next.cost - tt} TT to go` : farm.next.unmet.length === 0 ? " affordable" : " affordable, but gated"}
              {farm.next.unmet.length > 0 && ` · mark ${farm.next.unmet.map(([e, n]) => `EC${e}x${n}`).join(", ")} done above to unlock`}
            </div>
          )}
          <button className="more" onClick={togglePanel}>
            {panel ? "close settings" : "settings, custom trees & route order"}
          </button>
        </div>
      ) : (
        <div className="empty">
          No {mode === "ep" ? "EP farming" : "dilation"} tree fits {tt} TT yet.
          <button className="more" style={{ marginLeft: 8 }} onClick={togglePanel}>
            {panel ? "close settings" : "settings, custom trees & route order"}
          </button>
        </div>
      )}
    </div>
  );
}
