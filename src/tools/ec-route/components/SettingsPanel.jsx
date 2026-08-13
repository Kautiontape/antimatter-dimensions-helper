import { useState } from "react";
import { repairTree, unmetReqs } from "../lib/tree.js";
import { RouteEditor } from "./RouteEditor.jsx";

// Custom trees, config export/import, and the route order editor.
export function SettingsPanel({
  comps, mode, customs, setCustoms, copied, copy,
  exportState, importConfig, farmBuilt, entries,
  routeOrder, setRouteOrder, routeIsCustom, defaultRoute,
}) {
  const [draft, setDraft] = useState({ label: "", tree: "" });
  const [portText, setPortText] = useState("");
  const [portStatus, setPortStatus] = useState(null); // { ok, message }

  const draftRepair = draft.tree.trim() ? repairTree(draft.tree) : null;
  const draftInvalid = draftRepair !== null && draftRepair.ids.length === 0;

  function addCustom() {
    if (!draftRepair || draftInvalid) return;
    setCustoms((c) => c.concat([{
      label: (draft.label.trim() || "custom") + ` (${draftRepair.cost} TT)`,
      tree: draftRepair.tree, notes: draftRepair.notes, mode,
    }]));
    setDraft({ label: "", tree: "" });
  }

  function runImport() {
    let v;
    try {
      v = JSON.parse(portText);
    } catch {
      setPortStatus({ ok: false, message: "That isn't valid JSON — paste the whole exported block." });
      return;
    }
    const applied = importConfig(v);
    if (applied.length === 0) {
      setPortStatus({ ok: false, message: "Valid JSON, but nothing in it looked like planner config — nothing was changed." });
      return;
    }
    setPortText("");
    setPortStatus({ ok: true, message: `Imported: ${applied.join(", ")}.` });
  }

  return (
    <div className="sec">
      <div className="sechead">
        <h2>Settings</h2>
        <div className="rule" />
        <span className="stat">saved on this device</span>
      </div>

      <div className="row" style={{ "--pc": "var(--id)" }}>
        <div className="rhead"><h3 className="rowtitle">Add a custom tree</h3></div>
        <div className="note">
          Paste a study string. It gets checked against the real prerequisite and split rules, missing prereqs are added,
          the cost is computed, and it slots into the {mode === "ep" ? "EP farming" : "dilation"} tier list by that cost —
          so it only shows up once you can afford it. Leave the label blank and it's named "custom".
        </div>
        <div className="formrow">
          <label className="fieldcol" style={{ maxWidth: 190 }}>
            <span className="seglabel">Label</span>
            <input
              className="txt" placeholder="e.g. my EP push"
              value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </label>
          <label className="fieldcol">
            <span className="seglabel">Study string</span>
            <input
              className="txt mono" placeholder="11,22,32,42,...|0"
              value={draft.tree} onChange={(e) => setDraft({ ...draft, tree: e.target.value })}
            />
          </label>
          <button className="btn" onClick={addCustom} disabled={!draftRepair || draftInvalid}>Check &amp; add</button>
        </div>
        {draftRepair && (
          <div className="detail">
            {draftInvalid ? (
              <p style={{ color: "var(--warn)" }}>
                Couldn't read any studies in that — expected a comma-separated list like <span className="mono">11,21,22,32|0</span>.
              </p>
            ) : (
              <>
                <p><b>{draftRepair.cost} TT</b> · <span className="mono">{draftRepair.tree}</span></p>
                {draftRepair.notes.length > 0 && (
                  <p style={{ color: "var(--warn)" }}>Repairs: {draftRepair.notes.join("; ")}</p>
                )}
                {unmetReqs(draftRepair.ids, comps).length > 0 && (
                  <p style={{ color: "var(--warn)" }}>
                    Gated behind {unmetReqs(draftRepair.ids, comps).map(([e, n]) => `EC${e}x${n}`).join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {customs.length > 0 && (
          <div className="detail">
            {customs.map((c, i) => (
              <p key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <b style={{ minWidth: 130 }}>{c.label}</b>
                <span className="rmeta">{(c.mode || "ep") === "ep" ? "EP" : "dilation"}</span>
                <span className="mono" style={{ flex: 1, wordBreak: "break-all" }}>{c.tree}</span>
                <button className="more" onClick={() => setCustoms((x) => x.filter((_, j) => j !== i))}>remove</button>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="row" style={{ "--pc": "var(--td)" }}>
        <div className="rhead"><h3 className="rowtitle">Export / import</h3></div>
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
            aria-label="Config JSON to import"
            value={portText} onChange={(e) => { setPortText(e.target.value); setPortStatus(null); }}
          />
          <button className="btn" onClick={runImport}>Import</button>
        </div>
        {portStatus && (
          <div className={portStatus.ok ? "note" : "swap"} style={portStatus.ok ? { color: "var(--go)" } : undefined}>
            {portStatus.ok ? "✓" : "▲"} {portStatus.message}
          </div>
        )}
        <div className="note">Everything saves automatically to this browser's localStorage.</div>
      </div>

      <RouteEditor
        entries={entries} routeOrder={routeOrder} setRouteOrder={setRouteOrder}
        routeIsCustom={routeIsCustom} defaultRoute={defaultRoute}
      />
    </div>
  );
}
