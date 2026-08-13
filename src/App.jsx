import ECRoutePlanner from "./tools/ec-route/ECRoutePlanner.jsx";

// One tool for now; when more arrive this becomes a registry with simple routing.
const TOOLS = [
  { id: "ec-route", name: "EC Route Planner", component: ECRoutePlanner },
];

export default function App() {
  const tool = TOOLS[0];
  const Tool = tool.component;
  return (
    <div className="site">
      <header className="sitehead">
        <div className="sitehead-inner">
          <span className="sitemark">⚛︎</span>
          <span className="sitename">Antimatter Dimensions Helper</span>
          <nav className="sitenav">
            <span className="sitetool on">{tool.name}</span>
          </nav>
          <a
            className="sitelink"
            href="https://github.com/Kautiontape/antimatter-dimensions-helper"
            target="_blank" rel="noreferrer"
          >GitHub</a>
        </div>
      </header>
      <Tool />
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
