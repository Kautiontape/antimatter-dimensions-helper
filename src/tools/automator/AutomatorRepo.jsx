import { useEffect, useMemo, useState } from "react";
import { LIMITS } from "./lib/generate.js";
import { builtinScripts } from "./data/library.js";
import { sanitizeState, sanitizeScript, sanitizeOptions } from "./lib/sanitize.js";
import { loadSaved, saveState } from "./lib/storage.js";
import { loadSaved as loadPlanner } from "../ec-route/lib/storage.js";
import { sanitizeConfig } from "../ec-route/lib/sanitize.js";
import { useCopy } from "../ec-route/hooks/useCopy.js";
import { ScriptList, GROUPS } from "./components/ScriptList.jsx";
import { ScriptDetail } from "./components/ScriptDetail.jsx";
import { GeneratorOptions } from "./components/GeneratorOptions.jsx";
import { TransferPanel } from "./components/TransferPanel.jsx";

// Same untrusted shape as a pasted import.
const saved = sanitizeState(loadSaved());

// The planner tracks completions in its own storage; reading it lets the route
// script start where the playthrough actually is instead of at completion one.
function plannerProgress() {
  const config = sanitizeConfig(loadPlanner());
  if (!config.comps) return null;
  const done = Object.values(config.comps).reduce((s, n) => s + n, 0);
  return { comps: config.comps, done };
}

let seq = 0;
const newId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

export default function AutomatorRepo() {
  const [mine, setMine] = useState(saved.scripts || []);
  const [options, setOptions] = useState(saved.options || sanitizeOptions(null));
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(saved.selected || "route-1");
  const [copied, copy] = useCopy();

  const progress = useMemo(plannerProgress, []);

  useEffect(() => {
    const id = setTimeout(() => saveState({ scripts: mine, options, selected: selectedId }), 400);
    return () => clearTimeout(id);
  }, [mine, options, selectedId]);

  const built = useMemo(
    () => builtinScripts({ ...options, comps: options.useProgress && progress ? progress.comps : undefined }),
    [options, progress]
  );

  const scripts = useMemo(
    () => built.all.concat(mine.map((s) => ({ ...s, group: "mine" }))),
    [built, mine]
  );

  const counts = useMemo(() => {
    const out = { all: scripts.length };
    GROUPS.forEach((g) => { if (g.id !== "all") out[g.id] = scripts.filter((s) => s.group === g.id).length; });
    return out;
  }, [scripts]);

  const shown = filter === "all" ? scripts : scripts.filter((s) => s.group === filter);
  // Regenerating the route can drop the part that was selected.
  const selected = scripts.find((s) => s.id === selectedId) || shown[0] || scripts[0];
  const editable = selected ? selected.group === "mine" : false;

  const totalChars = scripts
    .filter((s) => s.group === "route" || s.group === "mine")
    .reduce((sum, s) => sum + s.body.length, 0);

  function updateSelected(patch) {
    setMine((list) => list.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
  }

  function addScripts(list) {
    const stamped = list.map((s) => ({ ...s, id: newId() }));
    setMine((current) => current.concat(stamped));
    if (stamped.length) setSelectedId(stamped[stamped.length - 1].id);
  }

  function duplicate() {
    if (!selected) return;
    addScripts([{
      ...selected,
      title: `${selected.title || selected.name} (copy)`,
      name: selected.name.slice(0, LIMITS.nameChars),
    }]);
  }

  function blank() {
    addScripts([sanitizeScript({
      name: "New script",
      title: "New script",
      author: "",
      body: "// A new script.\nauto eternity off\n",
    })]);
  }

  function remove() {
    setMine((list) => list.filter((s) => s.id !== selected.id));
    setSelectedId("route-1");
  }

  return (
    <div className="wrap">
      <div className="inner">
        <div className="top">
          <div>
            <div className="eyebrow">Automator</div>
            <h1>Script repository</h1>
          </div>
          <div className="topstats">
            <div className="stat"><b>{scripts.length}</b> scripts · <b>{mine.length}</b> yours</div>
            <div className="stat">
              <b className={totalChars > LIMITS.totalChars ? "over" : undefined}>{totalChars.toLocaleString()}</b>
              {" / "}{LIMITS.totalChars.toLocaleString()} chars if you paste them all
            </div>
          </div>
        </div>

        <p className="lede">
          The EC route as an Automator script, plus scripts other players have published. Nothing here is checked
          against the game's parser — it's a place to keep, read and hand around scripts. Yours are saved in this
          browser; the generated ones are rebuilt from the route data every time you change an option.
        </p>

        <div className="repo">
          <ScriptList
            scripts={shown} counts={counts} selectedId={selected ? selected.id : null}
            onSelect={setSelectedId} filter={filter} setFilter={setFilter}
          />

          {selected && (
            <ScriptDetail
              script={selected} editable={editable} onChange={updateSelected}
              onDuplicate={duplicate} onDelete={remove}
              copied={copied} copy={copy}
            >
              {selected.group === "route" && (
                <GeneratorOptions
                  options={options} setOptions={setOptions} progress={progress}
                  steps={built.steps} warnings={built.warnings}
                />
              )}
            </ScriptDetail>
          )}
        </div>

        <div className="segrow">
          <button className="btn ghost" style={{ height: 26 }} onClick={blank}>New script</button>
          <span className="hint">
            Built-in scripts are read-only — copy one to your scripts to edit it.
          </span>
        </div>

        <TransferPanel mine={mine} onImport={addScripts} copied={copied} copy={copy} />

        <div className="foot">
          <span>
            Command syntax and the 10,000 / 60,000 character limits follow the game's own automator source.
            Community scripts belong to their authors and are linked back to where they were published.
          </span>
        </div>
      </div>
    </div>
  );
}
