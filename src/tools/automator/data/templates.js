// The Automator's own five templates, as the in-game template panel writes them
// (script-templates.js in the game source). The inputs are ours — each entry
// says which ones produced the text — but the structure and command order are
// the game's, which makes these the safest reference for what idiomatic
// Automator code looks like.
export const TEMPLATES = [
  {
    id: "tmpl-climb-ep",
    name: "Climb EP",
    title: "Template: Climb EP",
    author: "Antimatter Dimensions",
    source: "https://antimatter-dimensions.fandom.com/wiki/The_Automator",
    sourceLabel: "in-game template panel",
    era: "any time you need a bigger EP number",
    tags: ["template", "farm"],
    summary:
      "Respec into one tree and Eternity over and over until EP reaches a target. Generated with a TD/Active tree, 1e2000 EP, Infinity at 1e10 times highest, Eternity at 5 times highest.",
    constants: [],
    body: `// Template: Climb EP
notify "Running Template Climb EP (to 1.00e2000)"
auto infinity 1e10 x highest
auto eternity 5 x highest
while ep < 1.00e2000 {
 studies purchase 11,22,32,42,51,61,73,83,93,103,111,121,131,141,151,161,171
 studies respec
 wait eternity
}`,
  },
  {
    id: "tmpl-grind-eternities",
    name: "GrindEternity",
    title: "Template: Grind Eternities",
    author: "Antimatter Dimensions",
    source: "https://antimatter-dimensions.fandom.com/wiki/The_Automator",
    sourceLabel: "in-game template panel",
    era: "whenever an EC unlock is gated on Eternity count",
    tags: ["template", "farm"],
    summary:
      "Eternity as fast as possible to a target count — what EC1's unlock requirement needs. Generated for 100,000 Eternities at 2 crunches per Eternity; the game computes the times-highest multiplier from that number, so it changes if you change the crunch count.",
    constants: [],
    body: `// Template: Grind Eternities
notify "Running Template Grind Eternities (to 100,000)"
studies purchase 11,22,32,42,51,61,73,83,93,103,111,121,131,141,151,161,171
auto eternity 0 ep
auto infinity 3.00e154 x highest
wait eternities > 100000
auto eternity off`,
  },
  {
    id: "tmpl-grind-infinities",
    name: "GrindInfinity",
    title: "Template: Grind Infinities",
    author: "Antimatter Dimensions",
    source: "https://antimatter-dimensions.fandom.com/wiki/The_Automator",
    sourceLabel: "in-game template panel",
    era: "whenever an EC unlock is gated on Infinity count",
    tags: ["template", "farm"],
    summary:
      "Crunch on a five second timer until total Infinities reach a target — EC4's unlock wants 1e8 of them. Generated for 1e6 Infinities, unbanked.",
    constants: [],
    body: `// Template: Grind Infinities
notify "Running Template Grind Infinities (to 1.00e6)"
studies purchase 11,22,32,42,51,61,73,83,93,103,111,121,131,141,151,161,171
auto eternity off
auto infinity 5s
wait infinities > 1.00e6`,
  },
  {
    id: "tmpl-complete-ec",
    name: "Complete EC",
    title: "Template: Complete Eternity Challenge",
    author: "Antimatter Dimensions",
    source: "https://antimatter-dimensions.fandom.com/wiki/The_Automator",
    sourceLabel: "in-game template panel",
    era: "any single Eternity Challenge",
    tags: ["template", "ec"],
    summary:
      "One challenge, start to finish. Note that it turns auto-Eternity off before starting: with it on, the autobuyer can leave the challenge after the first completion and the script waits forever for completions that will never come. Generated for EC5, 3 completions, Infinity at 10 times highest.",
    constants: [],
    body: `// Template: Complete Eternity Challenge
notify "Running Template Complete Eternity Challenge (EC5)"
eternity respec
studies purchase 11,21,22,32,42,51
unlock ec 5
auto infinity 10 x highest
auto eternity off
start ec 5
wait pending completions >= 3
eternity`,
  },
  {
    id: "tmpl-unlock-dilation",
    name: "UnlockDilation",
    title: "Template: Unlock Dilation",
    author: "Antimatter Dimensions",
    source: "https://antimatter-dimensions.fandom.com/wiki/The_Automator",
    sourceLabel: "in-game template panel",
    era: "after the Eternity Challenges",
    tags: ["template", "dilation"],
    summary:
      "Farm to the 12,900 total Time Theorems that Dilation requires, then buy it. The 12,900 is read from the game, not typed in; the tree is yours and has to reach one of TS231-234.",
    constants: [],
    body: `// Template: Unlock Dilation
notify "Running Template Unlock Dilation"
auto infinity off
auto eternity 5 x highest
while total tt < 12900 {
 studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,121,131,141,151,161,162,171,181,191,192,193,201,71,81,91,101,211,212,213,214,222,223,225,228,232,233
 studies respec
 wait eternity
}
unlock dilation`,
  },
];
