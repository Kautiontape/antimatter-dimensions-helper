import { useEffect, useRef, useState } from "react";

// Clipboard helper: copy(text, key) copies and flags `key` as copied for 1.5s.
export function useCopy() {
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* nothing else to fall back to */ }
      ta.remove();
    }
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1500);
  }
  return [copied, copy];
}
