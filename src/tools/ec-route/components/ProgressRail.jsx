import { keyOf } from "../lib/keys.js";

// One tick per route step: green done, amber affordable, dark locked.
// hereIndex marks the furthest step the current TT affords (-1 for none).
export function ProgressRail({ entries, comps, tt, hereIndex, totalDone }) {
  const first = entries[0];
  const last = entries[entries.length - 1];
  return (
    <>
      <div className="rail" role="img" aria-label={`Route progress: ${totalDone} of ${entries.length} completions done`}>
        {entries.map((e, i) => {
          const done = (comps[e.ec] || 0) >= e.comp;
          const isReady = !done && tt >= e.tt;
          return (
            <div
              key={keyOf(e)}
              className={"tick " + (done ? "done" : isReady ? "ready" : "locked") + (i === hereIndex ? " here" : "")}
              title={`EC${e.ec}x${e.comp} · ${e.tt} TT`}
            />
          );
        })}
      </div>
      <div className="railfoot">
        <span className="railend">EC{first.ec}x{first.comp} · {first.tt} TT</span>
        <span className="mono">
          {tt > 0 ? `your ${tt} TT reaches step ${hereIndex + 1} of ${entries.length}` : `${entries.length} steps to full completion`}
        </span>
        <span className="railend">EC{last.ec}x{last.comp} · {last.tt} TT</span>
      </div>
    </>
  );
}
