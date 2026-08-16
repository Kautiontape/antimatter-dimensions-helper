import { PATH_COLOR, PATH_NAME } from "../../ec-route/lib/constants.js";

const PACES = ["Active", "Passive", "Idle"];
const CAPS = [
  { v: 1, label: "one path" },
  { v: 2, label: "TS201" },
  { v: 3, label: "1e10 DT" },
];
const SCOPES = [
  { v: 0, label: "whole route" },
  { v: 6, label: "next 6" },
  { v: 12, label: "next 12" },
];

// Settings for the generated route script. Everything here feeds generateRoute
// and nothing is validated: "1e20 x highest", "5s" and "0 ep" are all things the
// Automator accepts for an autobuyer, so the crunch fields stay free text.
export function GeneratorOptions({ options, setOptions, progress, steps, warnings }) {
  const set = (patch) => setOptions((o) => ({ ...o, ...patch }));
  const promote = (p) => set({ order: [p].concat(options.order.filter((x) => x !== p)) });

  return (
    <div className="row genopts" style={{ "--pc": "var(--go)" }}>
      <div className="rhead">
        <h3 className="rowtitle">Route options</h3>
        <span className="rmeta">{steps} completion{steps === 1 ? "" : "s"} in this script</span>
      </div>

      <div className="segrow">
        <span className="seglabel">Scope</span>
        <div className="seg">
          {SCOPES.map((s) => (
            <button key={s.v} className={options.count === s.v ? "on" : ""} onClick={() => set({ count: s.v })}>
              {s.label}
            </button>
          ))}
        </div>
        <button
          className={`chip${options.useProgress ? " on" : ""}`}
          onClick={() => set({ useProgress: !options.useProgress })}
          disabled={!progress}
          title={progress ? "" : "Track completions in the EC Route Planner first"}
        >
          start from my progress
        </button>
        {options.useProgress && progress && (
          <span className="hint">{progress.done}/60 done, skipping those</span>
        )}
      </div>

      <div className="segrow">
        <span className="seglabel">Pace</span>
        <div className="seg">
          {PACES.map((p) => (
            <button key={p} className={options.pace === p ? "on" : ""} onClick={() => set({ pace: p })}>{p}</button>
          ))}
        </div>
        <span className="seglabel">Paths</span>
        <div className="seg">
          {CAPS.map((c) => (
            <button key={c.v} className={options.capacity === c.v ? "on" : ""} onClick={() => set({ capacity: c.v })}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="chips">
          {options.order.map((p, i) => (
            <button
              key={p}
              className={`pchip${i < options.capacity ? " live" : ""}`}
              style={{ "--pc": PATH_COLOR[p] }}
              onClick={() => promote(p)}
              title={`${PATH_NAME[p]} — click to make it first`}
            >
              <span className="rank">{i + 1}</span>{p}
            </button>
          ))}
        </div>
      </div>

      <div className="formrow">
        <label className="fieldcol">
          <span className="seglabel">Auto-infinity · farming</span>
          <input className="txt mono" value={options.farmCrunch} onChange={(e) => set({ farmCrunch: e.target.value })} />
        </label>
        <label className="fieldcol">
          <span className="seglabel">· in a challenge</span>
          <input className="txt mono" value={options.ecCrunch} onChange={(e) => set({ ecCrunch: e.target.value })} />
        </label>
        <label className="fieldcol">
          <span className="seglabel">· in EC4</span>
          <input className="txt mono" value={options.ec4Crunch} onChange={(e) => set({ ec4Crunch: e.target.value })} />
        </label>
        <label className="fieldcol" style={{ maxWidth: 96 }}>
          <span className="seglabel">Pause (s)</span>
          <input
            className="txt mono" type="number" min="0" max="600" value={options.pause}
            onChange={(e) => set({ pause: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="segrow">
        <button className={`chip${options.notes ? " on" : ""}`} onClick={() => set({ notes: !options.notes })}>
          route sheet notes as comments
        </button>
        <span className="hint">
          EC4 gets its own setting because it caps Infinities per completion; the fifth allows none, so it's forced off.
        </span>
      </div>

      {warnings.length > 0 && (
        <div className="swap">
          {warnings.map((w, i) => <div key={i}>▲ {w}</div>)}
        </div>
      )}
    </div>
  );
}
