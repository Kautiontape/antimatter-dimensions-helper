// The game's own script transfer format, so scripts can move between here and
// the Automator's import/export boxes without a round trip through the clipboard
// as plain text.
//
// A script string is deflate-compressed, base64'd, and then wrapped:
//
//   AntimatterDimensionsAutomatorScriptFormat AAB <payload> EndOfAutomatorScript
//
// where the payload has +, / and = swapped out (a save you double-click should
// select in one go). Inside the compressed blob, fields are concatenated with a
// 5-digit length in front of each — "00004blob0000811,21,31" — because comments
// can contain any delimiter you might otherwise pick.
//
// The "data" variant carries study presets and constants alongside the script;
// we read those but only ever write the plain "script" variant, since presets
// belong to a save file we know nothing about.

const START = {
  script: "AntimatterDimensionsAutomatorScriptFormat",
  data: "AntimatterDimensionsAutomatorDataFormat",
};
const END = {
  script: "EndOfAutomatorScript",
  data: "EndOfAutomatorData",
};
const VERSION = "AAB";

// Compression rides on the browser's own deflate; nothing to bundle.
export const codecSupported =
  typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

async function pipe(bytes, stream) {
  const body = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(body).arrayBuffer());
}

const toBinary = (bytes) => Array.from(bytes, (b) => String.fromCharCode(b)).join("");
const fromBinary = (str) => Uint8Array.from(Array.from(str), (c) => c.charCodeAt(0));

const pad = (n) => `0000${n}`.slice(-5);

function serialize(fields) {
  return fields.map((f) => `${pad(f.length)}${f}`).join("");
}

function deserialize(str) {
  const out = [];
  let rest = str;
  while (rest.length > 0) {
    const len = Number(rest.slice(0, 5));
    rest = rest.slice(5);
    if (!Number.isFinite(len) || rest.length < len) throw new Error("malformed automator data");
    out.push(rest.slice(0, len));
    rest = rest.slice(len);
  }
  return out;
}

/** Wrap a name and body into a string the game's import box accepts. */
export async function encodeScript(name, body) {
  if (!codecSupported) throw new Error("This browser cannot compress; copy the script as text instead.");
  const payload = serialize([String(name).slice(0, 15), String(body).trim()]);
  const deflated = await pipe(new TextEncoder().encode(payload), new CompressionStream("deflate"));
  const packed = btoa(toBinary(deflated))
    .replace(/=+$/gu, "")
    .replace(/0/gu, "0a")
    .replace(/\+/gu, "0b")
    .replace(/\//gu, "0c");
  return `${START.script}${VERSION}${packed}${END.script}`;
}

/**
 * Read an exported script or full script-data string.
 *
 * @returns {Promise<{name: string, body: string, constants: {name: string, value: string}[]}|null>}
 *   null when the text isn't a script string at all — callers show that as a
 *   message rather than an exception.
 */
export async function decodeScript(text) {
  const raw = String(text || "").trim();
  const kind = raw.startsWith(START.script) ? "script" : raw.startsWith(START.data) ? "data" : null;
  if (!kind) return null;
  if (!codecSupported) throw new Error("This browser cannot decompress; paste the script as plain text instead.");

  const version = raw.slice(START[kind].length, START[kind].length + 3);
  let payload = raw.slice(START[kind].length + 3);
  if (version >= VERSION) {
    if (!payload.endsWith(END[kind])) throw new Error("The string is cut off — copy the whole thing, ending in " + END[kind]);
    payload = payload.slice(0, -END[kind].length);
  }
  payload = payload.replace(/0b/gu, "+").replace(/0c/gu, "/").replace(/0a/gu, "0");
  payload += "=".repeat((4 - (payload.length % 4)) % 4);

  let fields;
  try {
    const inflated = await pipe(fromBinary(atob(payload)), new DecompressionStream("deflate"));
    fields = deserialize(new TextDecoder().decode(inflated));
  } catch {
    throw new Error("That doesn't decode as an Automator script — check it was copied whole.");
  }

  if (kind === "script") {
    if (fields.length < 2) return null;
    return { name: fields[0], body: fields[1], constants: [] };
  }
  if (fields.length !== 4) return null;
  const constants = fields[2]
    .split("*")
    .filter(Boolean)
    .map((entry) => {
      const at = entry.indexOf(":");
      return { name: entry.slice(0, at), value: entry.slice(at + 1) };
    });
  return { name: fields[0], body: fields[3], constants };
}
