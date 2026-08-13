import { useEffect, useState } from "react";

// TT entry with a local draft so clearing the field doesn't snap back to 0
// mid-edit. Buttons jump ±10 (route steps are 5–1000+ TT apart); arrow keys
// on the input still do ±1 for fine adjustment.
export function TtInput({ tt, setTt }) {
  const [draft, setDraft] = useState(String(tt));

  // Adopt outside changes (steppers, import, reset).
  useEffect(() => { setDraft(String(tt)); }, [tt]);

  function onChange(e) {
    const v = e.target.value;
    setDraft(v);
    if (v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) setTt(Math.max(0, Math.floor(n)));
    }
  }

  return (
    <div className="ttbox">
      <span className="eyebrow" style={{ marginRight: 2 }}>Total TT</span>
      <button className="stepbtn wide" onClick={() => setTt(Math.max(0, tt - 10))} aria-label="Decrease TT by 10">−10</button>
      <input
        type="number"
        value={draft}
        min="0"
        onChange={onChange}
        onBlur={() => setDraft(String(tt))}
        aria-label="Total time theorems"
      />
      <button className="stepbtn wide" onClick={() => setTt(tt + 10)} aria-label="Increase TT by 10">+10</button>
    </div>
  );
}
