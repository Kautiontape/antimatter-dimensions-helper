import { PATH_COLOR } from "../lib/constants.js";

// Reorder the route with up/down moves. Adjacent completions of the same EC can't
// swap — EC-x2 before EC-x1 is impossible in game — which is enough to keep every
// EC's completions in sequence since moves are single adjacent swaps.
export function RouteEditor({ entries, routeOrder, setRouteOrder, routeIsCustom, defaultRoute }) {
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= routeOrder.length) return;
    if (entries[i].ec === entries[j].ec) return;
    const next = routeOrder.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setRouteOrder(next);
  }

  return (
    <div className="row" style={{ "--pc": "var(--warn)" }}>
      <div className="rhead">
        <span className="rlabel" style={{ fontSize: 14 }}>Route order</span>
        {routeIsCustom && <span className="tag" style={{ color: "var(--warn)" }}>customized</span>}
        {routeIsCustom && (
          <button className="more" style={{ marginLeft: "auto", padding: 0 }} onClick={() => setRouteOrder(defaultRoute)}>
            reset to sheet order
          </button>
        )}
      </div>
      <div className="note">
        The default order comes from the community sheet. Guides only disagree on a couple of spots (flagged ◆) —
        move steps if you'd rather follow a different call. Completions of the same EC always stay in sequence.
      </div>
      <div className="routelist">
        {entries.map((e, i) => {
          const moved = defaultRoute[i] !== routeOrder[i];
          const upBlocked = i === 0 || entries[i - 1].ec === e.ec;
          const downBlocked = i === entries.length - 1 || entries[i + 1].ec === e.ec;
          return (
            <div className={"routerow" + (moved ? " moved" : "")} key={routeOrder[i]}>
              <span className="stepnum dim">{i + 1}</span>
              <span className="mono routename" style={{ color: PATH_COLOR[e.path] || "var(--ink)" }}>
                EC{e.ec}x{e.comp}
              </span>
              <span className="rmeta">{e.tt} TT</span>
              {e.contest && <span title={e.contest} style={{ color: "var(--warn)", cursor: "help" }}>◆</span>}
              <span className="routebtns">
                <button className="stepbtn" disabled={upBlocked} onClick={() => move(i, -1)}
                  aria-label={`Move EC${e.ec}x${e.comp} earlier`}>▲</button>
                <button className="stepbtn" disabled={downBlocked} onClick={() => move(i, 1)}
                  aria-label={`Move EC${e.ec}x${e.comp} later`}>▼</button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
