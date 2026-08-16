import { useState } from "react";
import { decodeScript, codecSupported } from "../lib/codec.js";
import { sanitizeScript } from "../lib/sanitize.js";

// Two kinds of transfer share one box, because from the outside they are the
// same gesture: paste something in, get scripts out. A library export is JSON;
// anything starting with AntimatterDimensions… is a script straight from the
// game and gets decoded.
export function TransferPanel({ mine, onImport, copied, copy }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null); // { ok, message }
  const [busy, setBusy] = useState(false);

  const exportPayload = JSON.stringify({ format: "adh-automator", version: 1, scripts: mine }, null, 2);

  function download() {
    const url = URL.createObjectURL(new Blob([exportPayload], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "automator-scripts.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function run() {
    const raw = text.trim();
    if (!raw) return;
    setBusy(true);
    setStatus(null);
    try {
      if (raw.startsWith("AntimatterDimensions")) {
        const parsed = await decodeScript(raw);
        if (!parsed) throw new Error("That looks like a game export string but doesn't parse — copy the whole thing.");
        const script = sanitizeScript({
          name: parsed.name,
          title: parsed.name,
          author: "imported",
          sourceLabel: "imported from the game",
          body: parsed.body,
          constants: parsed.constants,
        });
        if (!script) throw new Error("The decoded script was empty.");
        onImport([script]);
        setText("");
        setStatus({ ok: true, message: `Imported “${script.name}”${parsed.constants.length ? ` with ${parsed.constants.length} constants` : ""}.` });
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Not JSON, and not a game export string — paste one or the other.");
      }
      const list = Array.isArray(parsed) ? parsed : parsed.scripts;
      const scripts = (Array.isArray(list) ? list : []).map(sanitizeScript).filter(Boolean);
      if (!scripts.length) throw new Error("Valid JSON, but nothing in it looked like a script.");
      onImport(scripts);
      setText("");
      setStatus({ ok: true, message: `Imported ${scripts.length} script${scripts.length === 1 ? "" : "s"}.` });
    } catch (e) {
      setStatus({ ok: false, message: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sec">
      <div className="sechead">
        <h2>Export / import</h2>
        <div className="rule" />
        <span className="stat">your scripts live in this browser's localStorage</span>
      </div>

      <div className="row" style={{ "--pc": "var(--td)" }}>
        <div className="segrow">
          <button className="btn ghost" style={{ height: 26 }} onClick={() => copy(exportPayload, "lib")} disabled={!mine.length}>
            {copied === "lib" ? "Copied" : "Copy library JSON"}
          </button>
          <button className="btn ghost" style={{ height: 26 }} onClick={download} disabled={!mine.length}>
            Download .json
          </button>
          <span className="hint">
            {mine.length ? `${mine.length} of your own script${mine.length === 1 ? "" : "s"}` : "nothing saved yet — duplicate one to start"}
          </span>
        </div>

        <div className="formrow">
          <textarea
            className="txt mono porttext"
            aria-label="Paste library JSON or a game export string"
            placeholder={
              codecSupported
                ? "paste library JSON, or an AntimatterDimensionsAutomatorScriptFormat… string from the game"
                : "paste library JSON"
            }
            value={text}
            onChange={(e) => { setText(e.target.value); setStatus(null); }}
          />
          <button className="btn" onClick={run} disabled={busy || !text.trim()}>
            {busy ? "…" : "Import"}
          </button>
        </div>

        {status && (
          <div className={status.ok ? "note" : "swap"} style={status.ok ? { color: "var(--go)" } : undefined}>
            {status.ok ? "✓" : "▲"} {status.message}
          </div>
        )}

        <div className="note">
          Game strings run both ways: “Copy import string” on any script here produces one the Automator's import box
          accepts, and pasting one back in adds it to your scripts, constants included.
        </div>
      </div>
    </div>
  );
}
