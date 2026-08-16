import { useState } from "react";
import { LIMITS } from "../lib/generate.js";
import { encodeScript, codecSupported } from "../lib/codec.js";

const isComment = (line) => /^\s*(\/\/|#)/u.test(line);

function Body({ script, editable, onChange }) {
  if (editable) {
    return (
      <textarea
        className="txt mono code"
        spellCheck="false"
        aria-label="Script body"
        value={script.body}
        onChange={(e) => onChange({ body: e.target.value })}
      />
    );
  }
  return (
    <pre className="code mono">
      {script.body.split("\n").map((line, i) => (
        <div key={i} className={isComment(line) ? "cline dim" : "cline"}>{line || " "}</div>
      ))}
    </pre>
  );
}

export function ScriptDetail({ script, editable, onChange, onDuplicate, onDelete, copied, copy, children }) {
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const over = script.body.length > LIMITS.scriptChars;

  async function copyImportString() {
    setError(null);
    try {
      copy(await encodeScript(script.name, script.body), "import");
    } catch (e) {
      setError(e.message);
    }
  }

  const constantsText = script.constants.map((c) => `${c.name} = ${c.value}`).join("\n");

  return (
    <div className="detailcol">
      <div className="top detailhead">
        <div>
          <div className="eyebrow">{script.era || "automator script"}</div>
          {editable ? (
            <input
              className="txt titleinput"
              aria-label="Script title"
              value={script.title}
              placeholder="Untitled script"
              onChange={(e) => onChange({ title: e.target.value })}
            />
          ) : (
            <h2 className="detailtitle">{script.title || script.name}</h2>
          )}
          <div className="rmeta">
            {script.author || "unattributed"}
            {script.source && (
              <>
                {" · "}
                <a href={script.source} target="_blank" rel="noreferrer nofollow">
                  {script.sourceLabel || "source"}
                </a>
              </>
            )}
            {!script.source && script.sourceLabel ? ` · ${script.sourceLabel}` : ""}
          </div>
        </div>
        <div className="topstats">
          <div className="stat">
            <b className={over ? "over" : undefined}>{script.body.length.toLocaleString()}</b>
            {" / "}{LIMITS.scriptChars.toLocaleString()} chars
          </div>
        </div>
      </div>

      {script.summary && <p className="lede">{script.summary}</p>}

      {children}

      <div className="segrow">
        <span className="seglabel">In-game name</span>
        {editable ? (
          <input
            className="txt mono namefield"
            aria-label="In-game script name"
            maxLength={LIMITS.nameChars}
            value={script.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        ) : (
          <span className="mono">{script.name}</span>
        )}
        <span className="hint">{LIMITS.nameChars} characters max</span>
      </div>

      <div className="segrow">
        <button className="btn" onClick={() => copy(script.body, "body")}>
          {copied === "body" ? "Copied" : "Copy script"}
        </button>
        <button className="btn ghost" onClick={copyImportString} disabled={!codecSupported}>
          {copied === "import" ? "Copied" : "Copy import string"}
        </button>
        {script.constants.length > 0 && (
          <button className="btn ghost" onClick={() => copy(constantsText, "consts")}>
            {copied === "consts" ? "Copied" : `Copy ${script.constants.length} constants`}
          </button>
        )}
        <button className="btn ghost" onClick={onDuplicate}>
          {editable ? "Duplicate" : "Copy to my scripts"}
        </button>
        {editable && (
          <button
            className="more"
            style={confirmDelete ? { color: "var(--warn)" } : undefined}
            onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            onBlur={() => setConfirmDelete(false)}
          >
            {confirmDelete ? "really delete?" : "delete"}
          </button>
        )}
      </div>

      {error && <div className="swap">▲ {error}</div>}
      {over && (
        <div className="swap">
          ▲ Over the game's {LIMITS.scriptChars.toLocaleString()} character limit for a single script — the Automator
          will refuse to save edits until it fits. Split it across two slots.
        </div>
      )}
      {!codecSupported && (
        <div className="hint">
          This browser has no CompressionStream, so import strings are unavailable — copy the script as text instead.
        </div>
      )}

      {script.constants.length > 0 && (
        <div className="row constrow" style={{ "--pc": "var(--id)" }}>
          <div className="rhead">
            <h3 className="rowtitle">Constants</h3>
            <span className="rmeta">paste into Automator › Constants before running</span>
          </div>
          {script.constants.map((c) => (
            <div key={c.name} className="constline">
              <b className="mono">{c.name}</b>
              <span className="mono constval">{c.value}</span>
            </div>
          ))}
        </div>
      )}

      <Body script={script} editable={editable} onChange={onChange} />
    </div>
  );
}
