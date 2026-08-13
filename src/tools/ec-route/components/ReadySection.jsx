import { useState } from "react";
import { PATH_COLOR } from "../lib/constants.js";
import { keyOf } from "../ECRoutePlanner.jsx";
import { TreeBar } from "./TreeBar.jsx";

// Challenges affordable at the current TT, in route order.
export function ReadySection({
  ready, meta, tt, stepOf, copied, copy,
  markDone, lastMark, undoMark, dismissMark, ec8farm, routeIsCustom,
}) {
  const [open, setOpen] = useState(null);
  const total = Object.keys(stepOf).length;
  return (
    <div className="sec">
      <div className="sechead">
        <h2>Run these now</h2>
        <div className="rule" />
        <span className="stat">{ready.length} available at {tt} TT</span>
      </div>
      <div className="lede">
        Listed in route order, not by number — step {ready.length ? stepOf[keyOf(ready[0].entry)] + 1 : "–"} of {total} is next.
        {routeIsCustom
          ? " You're on a customized route order."
          : " The Steam guide agrees with this route except for one swap; namu differs on two, both flagged below."}
      </div>
      {lastMark && (
        <div className="undobar">
          <span>
            EC{lastMark.ec}x{lastMark.comp} marked complete
            {lastMark.comp === 5 ? " — that's all five." : ""}
          </span>
          <button className="more" onClick={undoMark}>undo</button>
          <button className="more" onClick={dismissMark}>dismiss</button>
        </div>
      )}
      {ready.length === 0 && <div className="empty">Nothing affordable yet — see the next gate below.</div>}
      {ready.map((r) => {
        const e = r.entry;
        const best = r.best;
        const m = meta[r.ec];
        const key = `r${r.ec}`;
        const pc = PATH_COLOR[best.path] || "var(--go)";
        return (
          <div className="row" key={key} style={{ "--pc": pc }}>
            <div className="rhead">
              <span className="stepnum">{stepOf[keyOf(e)] + 1}</span>
              <span className="rlabel">EC{r.ec}x{r.next}</span>
              <span className="tag">{best.path}</span>
              <span className="rmeta">
                needs {e.tt} TT{e.time ? ` · ~${e.time}` : ""}
              </span>
              <span className="need short">{tt - e.tt} TT spare</span>
            </div>
            <div className="goal">
              Unlock: <b>{m.req[String(r.next)] || m.reqRaw}</b> &nbsp;·&nbsp; Goal: <b>{m.goal[String(r.next)]}</b>
            </div>
            <TreeBar tree={best.tree} copyKey={key} copied={copied} copy={copy}>
              <button
                className="btn mark"
                onClick={() => markDone(r.ec, r.next)}
                title={`Record EC${r.ec}x${r.next} as complete`}
              >✓ Done</button>
            </TreeBar>
            {best.comp !== r.next && (
              <div className="swap">
                ▲ Using the EC{r.ec}x{best.comp} tree ({best.tt} TT) instead of the EC{r.ec}x{r.next} one ({e.tt} TT) — same challenge, strictly more studies at your TT.
              </div>
            )}
            {e.contest && <div className="swap">◆ Guides disagree here. {e.contest}</div>}
            {e.note && <div className="note">{e.note}</div>}
            {best.comp !== r.next && best.note && <div className="note">EC{r.ec}x{best.comp} note: {best.note}</div>}
            {r.ec === 8 && (
              <div className="note">
                Requirement-farm tree (buy EC8, then respec): <span className="mono" style={{ color: "var(--warn)" }}>{ec8farm}</span>
                <button className="btn ghost" style={{ marginLeft: 8, height: 22 }} onClick={() => copy(ec8farm, key + "f")}>
                  {copied === key + "f" ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            <button className="more" onClick={() => setOpen(open === key ? null : key)}>
              {open === key ? "hide EC" + r.ec + " notes" : "EC" + r.ec + " notes"}
            </button>
            {open === key && (
              <div className="detail">
                <p><b>Restriction:</b> {m.restriction}</p>
                <p>{m.tips}</p>
                {best.comp !== r.next && (
                  <p><b>Exact EC{r.ec}x{r.next} tree:</b> <span className="mono">{e.tree}</span></p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
