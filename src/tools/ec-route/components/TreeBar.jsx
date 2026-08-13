// A study string with its copy button; `copyKey` distinguishes buttons for the copied flash.
export function TreeBar({ tree, copyKey, copied, copy, ghost = false, children }) {
  return (
    <div className="treebar">
      <div className="tree">{tree}</div>
      <button className={"btn" + (ghost ? " ghost" : "")} onClick={() => copy(tree, copyKey)}>
        {copied === copyKey ? "Copied" : ghost ? "Copy" : "Copy tree"}
      </button>
      {children}
    </div>
  );
}
