import { TS, EC_COST } from "../data/studies.js";
import { CHAIN, PACE_CHAIN, ALL_CHAIN } from "./constants.js";

export function parseTree(s) {
  const [body, ec] = String(s).split("|");
  return {
    ids: body.split(",").map((x) => Number(String(x).trim())).filter((n) => !isNaN(n) && n > 0),
    ec: Number(ec || 0),
  };
}

export function joinTree(ids, ec) {
  return ids.join(",") + "|" + (ec || 0);
}

export function treeCost(ids) {
  return ids.reduce((s, i) => s + (TS.cost[i] || 0), 0);
}

export function whichOf(ids, map) {
  for (const k of Object.keys(map)) if (ids.includes(map[k][0])) return k;
  return null;
}

export function pathsIn(ids) {
  return Object.keys(CHAIN).filter((k) => ids.includes(CHAIN[k][0]));
}

export function swapChain(ids, map, from, to) {
  if (!from || from === to) return ids;
  const a = map[from];
  const b = map[to];
  return ids.map((i) => {
    const k = a.indexOf(i);
    return k === -1 ? i : b[k];
  });
}

// Rebuild with an explicit ordered path list; extra paths land after TS201 so the import buys them.
export function setPaths(ids, paths) {
  if (!paths || !paths.length) return ids;
  const firstIdx = ids.findIndex((i) => ALL_CHAIN.includes(i));
  if (firstIdx === -1) return ids;
  const rest = ids.filter((i) => !ALL_CHAIN.includes(i));
  const out = rest.slice(0, firstIdx).concat(CHAIN[paths[0]], rest.slice(firstIdx));
  const extra = paths.slice(1).reduce((a, p) => a.concat(CHAIN[p]), []);
  if (!extra.length) return out;
  const i201 = out.indexOf(201);
  if (i201 === -1) return out.concat(extra);
  return out.slice(0, i201 + 1).concat(extra, out.slice(i201 + 1));
}

function ancestorsPresent(id, set) {
  let n = 0;
  const seen = new Set();
  const stack = [id];
  while (stack.length) {
    const x = stack.pop();
    (TS.req[x] || []).forEach((r) => {
      if (set.has(r)) n++;
      if (!seen.has(r)) {
        seen.add(r);
        stack.push(r);
      }
    });
  }
  return n;
}

// Clean a tree while preserving the author's purchase order. The importer buys
// left to right and skips what you can't afford, so the sequence carries intent:
// only move a study when a prerequisite would otherwise come after it.
export function repairTree(raw) {
  const { ids, ec } = parseTree(raw);
  const notes = [];
  let seq = [];
  ids.forEach((i) => {
    if (!TS.cost[i]) notes.push(`dropped unknown study ${i}`);
    else if (seq.includes(i)) notes.push(`dropped duplicate ${i}`);
    else seq.push(i);
  });
  const enforce = (group, label, limit) => {
    const have = seq.filter((i) => group.includes(i));
    have.slice(limit).forEach((i) => {
      const name = Object.keys(CHAIN).find((k) => CHAIN[k][0] === i);
      const chain = name ? CHAIN[name] : Object.values(PACE_CHAIN).find((c) => c[0] === i) || [i];
      seq = seq.filter((x) => !chain.includes(x));
      notes.push(`dropped ${name || i} (${label})`);
    });
  };
  if (!seq.includes(201)) enforce([71, 72, 73], "needs TS201 for a second path", 1);
  else {
    enforce([71, 72, 73], "max three paths", 3);
    if (seq.filter((i) => [71, 72, 73].includes(i)).length > 2) {
      notes.push("three dimension paths need the 1e10 DT upgrade");
    }
  }
  enforce([121, 122, 123], "one pace path only", 1);
  TS.pairs.forEach(([a, b]) => {
    if (seq.includes(a) && seq.includes(b)) {
      const drop = seq.indexOf(a) < seq.indexOf(b) ? b : a;
      seq = seq.filter((i) => i !== drop);
      notes.push(`dropped ${drop} (light/dark pair)`);
    }
  });
  // Stable topological pass over the author's sequence.
  const out = [];
  let pending = seq.slice();
  for (let guard = 0; pending.length && guard < 600; guard++) {
    let progressed = false;
    pending.slice().forEach((x) => {
      const r = TS.req[x] || [];
      if (!r.length || r.some((q) => out.includes(q))) {
        out.push(x);
        pending = pending.filter((y) => y !== x);
        progressed = true;
      }
    });
    if (progressed) continue;
    // Everything left is waiting; the real blocker is the first item whose own
    // prerequisites aren't themselves pending.
    const block = pending.find((x) => !(TS.req[x] || []).some((q) => pending.includes(q))) || pending[0];
    const avail = (TS.req[block] || []).filter((q) => !pending.includes(q));
    if (!avail.length) {
      pending = pending.filter((y) => y !== block);
      notes.push(`dropped ${block} (unsatisfiable)`);
      continue;
    }
    const set = new Set(out);
    const pick = avail.slice().sort((x, y) =>
      ancestorsPresent(y, set) - ancestorsPresent(x, set) || TS.cost[x] - TS.cost[y] || x - y)[0];
    pending.splice(pending.indexOf(block), 0, pick);
    notes.push(`added ${pick} (required by ${block})`);
  }
  return { tree: joinTree(out, ec), ids: out, ec, cost: treeCost(out) + (ec ? EC_COST[ec] : 0), notes };
}

// EC completions a tree still needs, e.g. TS181 requires EC1-3 at one completion each.
export function unmetReqs(ids, comps) {
  const out = [];
  ids.forEach((i) => {
    (TS.ecReq[i] || []).forEach(([ec, n]) => {
      if ((comps[ec] || 0) < n && !out.some((x) => x[0] === ec)) out.push([ec, n, i]);
    });
  });
  return out;
}
