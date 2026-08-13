// One tick per route step: green done, amber affordable, dark locked.
export function ProgressRail({ entries, comps, tt, reachIndex, totalDone }) {
  const first = entries[0];
  const last = entries[entries.length - 1];
  return (
    <>
      <div className="rail" role="img" aria-label={`Route progress: ${totalDone} of ${entries.length} completions done`}>
        {entries.map((e, i) => {
          const done = (comps[e.ec] || 0) >= e.comp;
          const isReady = !done && tt >= e.tt;
          const here = i === reachIndex - 1;
          return (
            <div
              key={e.ec + "x" + e.comp}
              className={"tick " + (done ? "done" : isReady ? "ready" : "locked") + (here ? " here" : "")}
              title={`EC${e.ec}x${e.comp} · ${e.tt} TT`}
            />
          );
        })}
      </div>
      <div className="railfoot">
        <span>EC{first.ec}x{first.comp} · {first.tt} TT</span>
        <span className="mono">your {tt} TT reaches step {reachIndex} of {entries.length}</span>
        <span>EC{last.ec}x{last.comp} · {last.tt} TT</span>
      </div>
    </>
  );
}
