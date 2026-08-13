const STORE_KEY = "adh_ec_route_v1";

export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable; the tool still works, it just won't persist.
  }
}
