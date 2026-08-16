import { LIMITS } from "../lib/generate.js";

export const GROUPS = [
  { id: "all", label: "All" },
  { id: "route", label: "EC route" },
  { id: "mine", label: "Mine" },
  { id: "snippet", label: "Snippets" },
  { id: "template", label: "Templates" },
  { id: "community", label: "Community" },
];

const GROUP_COLOR = {
  route: "var(--go)",
  mine: "var(--id)",
  snippet: "var(--id)",
  template: "var(--td)",
  community: "var(--ad)",
};

export function ScriptList({ scripts, counts, selectedId, onSelect, filter, setFilter }) {
  return (
    <div className="listcol">
      <div className="chips listfilter">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            className={`chip${filter === g.id ? " on" : ""}`}
            onClick={() => setFilter(g.id)}
            disabled={g.id !== "all" && !counts[g.id]}
          >
            {g.label} {counts[g.id] ? <span className="mono">{counts[g.id]}</span> : null}
          </button>
        ))}
      </div>

      <div className="listbox">
        {scripts.length === 0 && (
          <div className="empty" style={{ padding: "10px 12px" }}>Nothing here yet.</div>
        )}
        {scripts.map((s) => (
          <button
            key={s.id}
            className={`listrow${s.id === selectedId ? " on" : ""}`}
            style={{ "--pc": GROUP_COLOR[s.group] || "var(--dim)" }}
            onClick={() => onSelect(s.id)}
          >
            <span className="listname">{s.name}</span>
            <span className={`listchars mono${s.body.length > LIMITS.scriptChars ? " over" : ""}`}>
              {s.body.length.toLocaleString()}
            </span>
            <span className="listmeta">{s.author || "unattributed"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
