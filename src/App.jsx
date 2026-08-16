import { useEffect, useState } from "react";
import ECRoutePlanner from "./tools/ec-route/ECRoutePlanner.jsx";
import AutomatorRepo from "./tools/automator/AutomatorRepo.jsx";

const TOOLS = [
  { id: "ec-route", name: "EC Route Planner", component: ECRoutePlanner },
  { id: "automator", name: "Automator Scripts", component: AutomatorRepo },
];

// The hash is the whole router: it survives a reload and gives each tool a
// linkable address without pulling in a routing library.
function toolFromHash() {
  const id = window.location.hash.replace(/^#\/?/u, "");
  return TOOLS.find((t) => t.id === id) || TOOLS[0];
}

export default function App() {
  const [tool, setTool] = useState(toolFromHash);

  useEffect(() => {
    const onHash = () => setTool(toolFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const Tool = tool.component;
  return (
    <div className="site">
      <header className="sitehead">
        <div className="sitehead-inner">
          <span className="sitemark">⚛︎</span>
          <span className="sitename">Antimatter Dimensions Helper</span>
          <nav className="sitenav">
            {TOOLS.map((t) => (
              <a
                key={t.id}
                className={`sitetool${t.id === tool.id ? " on" : ""}`}
                href={`#/${t.id}`}
                aria-current={t.id === tool.id ? "page" : undefined}
              >
                {t.name}
              </a>
            ))}
          </nav>
          <a
            className="sitelink"
            href="https://github.com/Kautiontape/antimatter-dimensions-helper"
            target="_blank" rel="noreferrer"
          >GitHub</a>
        </div>
      </header>
      <main>
        <Tool />
      </main>
      <footer className="sitefoot">
        <span>
          A fan-made companion for{" "}
          <a href="https://ivark.github.io/AntimatterDimensions/" target="_blank" rel="noreferrer">Antimatter Dimensions</a>.
          Not affiliated with the game.
        </span>
      </footer>
    </div>
  );
}
