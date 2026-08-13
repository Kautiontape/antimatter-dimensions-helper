// Dimension path splits: the three 4-study branches after TS61.
export const CHAIN = {
  AD: [71, 81, 91, 101],
  ID: [72, 82, 92, 102],
  TD: [73, 83, 93, 103],
};

// Pace splits after TS111: Active / Passive / Idle.
export const PACE_CHAIN = {
  Active: [121, 131, 141],
  Passive: [122, 132, 142],
  Idle: [123, 133, 143],
};

export const ALL_CHAIN = [...CHAIN.AD, ...CHAIN.ID, ...CHAIN.TD];

// Ordered path priority for multi-path trees; primary first, extras land after TS201.
// Consensus priority: undilated ID>TD>AD; dilated you want antimatter for TP, so AD moves up.
export const DEFAULT_ORDER = { ep: ["ID", "TD", "AD"], dilation: ["TD", "AD", "ID"] };

// What each "paths owned" capacity level corresponds to in game.
export const CAP_NOTE = { 1: "one path", 2: "TS201", 3: "1e10 DT upgrade" };

export const PATH_NAME = {
  AD: "Antimatter Dimension path",
  ID: "Infinity Dimension path",
  TD: "Time Dimension path",
  "-": "No path split",
};

export const PATH_COLOR = {
  AD: "var(--ad)",
  ID: "var(--id)",
  TD: "var(--td)",
  "-": "var(--dim)",
  "": "var(--dim)",
};
