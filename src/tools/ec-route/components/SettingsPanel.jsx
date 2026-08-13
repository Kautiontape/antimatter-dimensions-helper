import { useState } from "react";
import { repairTree, unmetReqs } from "../lib/tree.js";
import { RouteEditor } from "./RouteEditor.jsx";

// Custom trees, config export/import, and the route order editor.
export function SettingsPanel({
  comps, customs, setCustoms, copied, copy,
  exportState, importConfig, farmBuilt, entries,
  routeOrder, setRouteOrder, routeIsCustom, defaultRoute,
}) {
  const [draft, setDraft] = useState({ label: "", tree: "" });
  const [portText, setPortText] = useState("");
  const [portError, setPortError] = useState("");

  function addCustom() {
    if (!draft.tree.trim()) return;
    const r = repairTree(draft.tree);
    if (!r.ids.length) return;
    setCustoms((c) => c.concat([{
      label: (draft.label.trim() || "custom") + ` (${r.cost} TT)`,
      tree: r.tree, notes: r.notes,
    }]));
    setDraft({ label: "", tree: "" });
  }

  function runImport() {
    try {
      importConfig(JSON.parse(portText));
      setPortText("");
      setPortError("");
    } catch {
      setPortError("That isn't valid JSON — paste the whole exported block.");
    }
  }

  return (
    <div className="sec">
      <div className="sechead">
        <h2>Settings</h2>
        <div className="rule" />
        <span className="stat">saved on this device</span>
      </div>

      <div className="row" style={{ "--pc": "var(--id)" }}>
        <div className="rhead"><span className="rlabel" style={{ fontSize: 14 }}>Add a custom tree</span></div>
        <div className="note">
          Paste a study string. It gets checked against the real prerequisite and split rules, missing prereqs are added,
          the cost is computed, and it slots into the tier list by that cost — so it only shows up once you can afford it.
        </div>
        <div className="formrow">
          <input
            className="txt" style={{ maxWidth: 190 }} placeholder="label (e.g. my EP push)"
            value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            className="txt mono" placeholder="11,22,32,42,...|0"
            value={draft.tree} onChange={(e) => setDraft({ ...draft, tree: e.target.value })}
          />
          <button className="btn" onClick={addCustom}>Check &amp; add</button>
        </div>
        {draft.tree.trim() && (() => {
          const r = repairTree(draft.tree);
          const unmet = unmetReqs(r.ids, comps);
          return (
            <div className="detail">
              <p><b>{r.cost} TT</b> · <span className="mono">{r.tree}</span></p>
              {r.notes.length > 0 && <p style={{ color: "var(--warn)" }}>Repairs: {r.notes.join("; ")}</p>}
              {unmet.length > 0 && (
                <p style={{ color: "var(--warn)" }}>
                  Gated behind {unmet.map(([e, n]) => `EC${e}x${n}`).join(", ")}
                </p>
              )}
            </div>
          );
        })()}
        {customs.length > 0 && (
          <div className="detail">
            {customs.map((c, i) => (
              <p key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <b style={{ minWidth: 130 }}>{c.label}</b>
                <span className="mono" style={{ flex: 1, wordBreak: "break-all" }}>{c.tree}</span>
                <button className="more" onClick={() => setCustoms((x) => x.filter((_, j) => j !== i))}>remove</button>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="row" style={{ "--pc": "var(--td)" }}>
        <div className="rhead"><span className="rlabel" style={{ fontSize: 14 }}>Export / import</span></div>
        <div className="segrow">
          <button className="btn ghost" style={{ height: 26 }} onClick={() =>
            copy(JSON.stringify(exportState, null, 2), "cfg")
          }>{copied === "cfg" ? "Copied" : "Copy config JSON"}</button>
          <button className="btn ghost" style={{ height: 26 }} onClick={() =>
            copy(farmBuilt.map((f) => `${f.cost} TT — ${f.label}\n${f.tree}`).join("\n\n"), "plan")
          }>{copied === "plan" ? "Copied" : "Copy full tier plan"}</button>
          <button className="btn ghost" style={{ height: 26 }} onClick={() =>
            copy(entries.map((e) => `EC${e.ec}x${e.comp} — ${e.tt} TT\n${e.tree}`).join("\n\n"), "ecplan")
          }>{copied === "ecplan" ? "Copied" : "Copy all EC trees"}</button>
        </div>
        <div className="formrow">
          <input
            className="txt mono" placeholder="paste config JSON here to restore"
            value={portText} onChange={(e) => { setPortText(e.target.value); setPortError(""); }}
          />
          <button className="btn" onClick={runImport}>Import</button>
        </div>
        {portError && <div className="swap">▲ {portError}</div>}
        <div className="note">Everything saves automatically to this browser's localStorage.</div>
      </div>

      <RouteEditor
        entries={entries} routeOrder={routeOrder} setRouteOrder={setRouteOrder}
        routeIsCustom={routeIsCustom} defaultRoute={defaultRoute}
      />
    </div>
  );
}
