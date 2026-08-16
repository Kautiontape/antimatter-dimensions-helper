// Scripts written by other players, decoded from the export strings their
// authors published. Kept verbatim — the point of a repository is that you can
// read what someone else actually shipped, not a paraphrase of it. Each entry
// links back to its source; credit and any corrections belong to the author.
export const COMMUNITY = [
  {
    id: "ninja-preecr",
    name: "Ninja PreECR",
    title: "Ninja PreECR v3.1",
    author: "Ninjatsu",
    source: "https://steamcommunity.com/sharedfiles/filedetails/?id=3040232174",
    sourceLabel: "Ninjatsu's Automators for Antimatter Dimensions (Steam guide)",
    era: "Automator unlock to ~30 Realities",
    tags: ["route","ec","dilation","reality"],
    summary: "The reference progression script for this era: farm TT, clear every Eternity Challenge, unlock Dilation, then loop EP and Dilated Time until Reality. Uses three tree constants and interleaves challenges with TT thresholds rather than doing them in one block.",
    constants: [
      { name: "TREE_MIN", value: "11,22,32,42,51,61,time,111,active,151,161,171,162,21,62,33,31,41" },
      { name: "TREE_MAIN", value: "11-62,time,111,active,151-191,212,211,193,214,213,192,201,infinity,224,232,222,228,234,226,antimatter" },
      { name: "TREE_DIL", value: "11-62,time,111,active,151-201,antimatter,211-214,222,223,225,228,232,233,infinity" },
    ],
    body: `// Ninja Pre ECR v3.1
// Progression Script 1: Automator Unlock to 29~30 Realities

// Next Progression Script: Ninja GlyphSac
// Utility Scripts to use: None

// Thanks to kajfik for initial script

// RECOMMENDATIONS:
// Perks: DILR + ACHNR
// Manually use BH in Dilation Era
// Glyphs: Time with EPx + 3xANY

// HOW TO:
// If no TTS: Press "Buy max" on studies page, hold enter
// If no DU1 to REAL: Buy Dilation upgrades, buy TDs, buy Reality study
// If no ACHNR first Eternity will need to be manual, use R and ? to hold R for RGs
// If no DILR change first EC11 block to >= 5 at line 343 + 345

// ADJUSTMENTS:
// If you have a hard time farming TT, manually pause and resume script during TT farming

//

auto eternity off
auto infinity 1e30 x highest
studies nowait purchase TREE_MIN
until total tt >= 162 {
  studies nowait purchase TREE_MIN
  wait pending ep > ep
  pause 7s
  eternity respec
}
eternity respec

if ec1 completions < 2 {
  notify "STARTING EARLY TT AND ECS"
  auto infinity 1e20 x highest
  auto eternity 14s

  until ec2 completions >= 2 {
    auto eternity off
    studies purchase 11-62,time,111,active,151-171|2!
    auto eternity on
    wait pending completions >= 2
    eternity nowait
  }

  until ec3 completions >= 3 {
    studies purchase 11-62,time,111,active,151-171
    auto eternity off
    unlock ec3
    eternity respec
    studies purchase 11-62,infinity,111,active,151-171|3!
    auto eternity on
    wait pending completions >= 3
    eternity nowait
  }

  until ec1 completions >= 2 {
    auto eternity 0ep
    studies purchase 11-62,infinity,111,active,151-171|1!
    auto eternity 14s
    wait pending completions >= 2
    eternity nowait
  }
}

until total tt >= 192 {
  auto eternity off
  studies purchase 11-62,time,111,active,151-171
  wait pending ep > ep
  pause 6s
  eternity respec
}

if ec7 completions < 3 {
  notify "STARTING MID TT AND ECS UNTIL TS181"
  auto eternity 14s
  auto infinity 1e30 x highest

  until ec5 completions >= 2 {
    auto eternity off
    studies purchase 11-33,42,51,61,infinity,111|5!
    auto eternity on
    wait pending completions >= 2
    eternity nowait
  }

  until ec4 completions >= 2 {
    auto infinity 5s
    auto eternity off
    studies purchase 11-62,time,111,idle,151-171|4!
    auto eternity on
    auto infinity 2s
    wait pending completions >= 2
    eternity nowait
    auto infinity 1e30 x highest
  }

  if total tt < 207 {
    studies purchase 11-62,time,111,active,151-171
    auto eternity off
    until total tt >= 207 {
      wait pending ep > ep
      pause 7s
      eternity
    }
    eternity respec
  }

  until ec6 completions >= 2 {
    auto eternity off
    studies purchase 11-62,infinity,111,active,151-171|6!
    auto eternity on
    wait pending completions >= 2
    eternity nowait
  }

  until ec1 completions >= 5 {
    auto eternity 0ep
    studies purchase 11-62,infinity,111,active,151-171|1!
    auto eternity 14s
    wait pending completions >= 5
    eternity nowait
  }

  until ec3 completions >= 5 {
    studies purchase 11-62,time,111,active,151-171
    auto eternity off
    unlock ec3
    eternity respec
    studies purchase 11-62,infinity,111,active,151-171|3!
    auto eternity on
    wait pending completions >= 5
    eternity nowait
  }

  if total tt < 252 {
    studies purchase 11-62,time,111,active,151-171
    auto eternity off
    until total tt >= 252 {
      wait pending ep > ep
      pause 8s
      eternity
    }
    eternity respec
  }

  until ec5 completions >= 5 {
    auto eternity off
    studies purchase 11-62,infinity,111,active,151-171|5!
    auto eternity on
    wait pending completions >= 5
    eternity nowait
  }

  until ec2 completions >= 5 {
    auto eternity off
    studies purchase 11-62,time,111,active,151-171|2!
    auto eternity on
    wait pending completions >= 5
    eternity nowait
  }

  until ec8 completions >= 1 {
    auto eternity off
    studies purchase 11-62,time,111,idle,151-171|8!
    wait pending completions >= 1
    eternity
  }

  until ec6 completions >= 4 {
    auto eternity off
    studies purchase 11-62,infinity,111,active,151-171|6!
    auto eternity on
    wait pending completions >= 4
    eternity nowait
  }

  until ec7 completions >= 3 {
    studies purchase 11-62,time,111,active,151-171
    auto eternity off
    unlock ec7
    eternity respec
    studies purchase 11-62,antimatter,111,active,151-171|7!
    auto eternity on
    wait pending completions >= 3
    eternity nowait
  }
}

if total tt < 350 {
  studies purchase 11-62,time,111,active,151-171
  auto eternity off
  until total tt >= 322 {
    wait pending ep > ep
    pause 6s
    eternity
  }
  studies purchase 181
  auto infinity off
  auto eternity 14s
  wait total tt >= 350
  eternity respec
}
auto infinity off

if ec9 completions < 5 {
  notify "TS181 BOUGHT"

  until ec8 completions >= 2 {
    auto infinity on
    auto eternity off
    studies purchase 11-62,time,111,idle,151-171|8!
    auto eternity on
    wait pending completions >= 2
    eternity nowait
    auto infinity off
  }

  until ec6 completions >= 5 {
    auto infinity on
    auto eternity off
    studies purchase 11-62,infinity,111,active,151-171|6!
    auto eternity on
    wait pending completions >= 5
    eternity nowait
    auto infinity off
  }

  if total tt < 392 {
    studies purchase 11-62,time,111,active,151-181
    auto eternity on
    wait total tt >= 392
    eternity respec
  }

  until ec4 completions >= 5 {
    auto infinity 5s
    studies purchase 11-62,time,111,idle,151-181|4!
    auto infinity off
    auto eternity on
    wait pending completions >= 5
    eternity nowait
  }

  studies purchase 11-62,time,111,active,151-181
  auto eternity on
  wait total tt >= 567
  pause 3s
  eternity respec

  until ec9 completions >= 2 {
    auto infinity 1e30 x highest
    auto eternity off
    studies purchase 11-62,time,111,active,151-171|9!
    auto eternity on
    wait pending completions >= 2
    eternity nowait
    auto infinity off
  }

  until ec8 completions >= 3 {
    studies purchase 11-62,time,111,idle,151-181|8!
    wait pending completions >= 3
    eternity nowait
  }

  studies purchase 11-62,time,111,active,151-181
  wait total tt >= 800
  pause 3s
  eternity respec

  until ec9 completions >= 5 {
    auto eternity off
    studies purchase 11-62,time,111,active,151-181|9!
    auto eternity on
    wait pending completions >= 5
    eternity nowait
  }

  until ec8 completions >= 5 {
    studies purchase 11-62,time,111,idle,151-181|8!
    wait pending completions >= 5
    eternity nowait
  }
}

if total tt < 885 {
  studies purchase 11-62,time,111,active,151-181
  auto eternity on
  wait total tt >= 885
  eternity respec
}

auto eternity 17s

if ec10 completions < 1 {
  studies purchase 11-62,antimatter,111,active,151-181|10!
  auto infinity 5s
  wait pending completions >= 1
  eternity nowait
  notify "LOWER STUDIES AVAILABLE"
  auto infinity off
}

until ec7 completions >= 5 {
  studies purchase 11-62,antimatter,111,active,151-181,193,214|7!
  wait pending completions >= 5
  eternity nowait
}

if total tt < 3925 {
  while total tt < 2692 {
    studies nowait purchase TREE_MAIN
  }

  eternity nowait respec
  while total tt < 3925 {
    studies purchase TREE_MIN
    studies nowait purchase 181,191,212,223,232,211,222,193,214,213
    studies respec
  }

  eternity nowait
  studies nowait purchase TREE_MAIN
  eternity respec
}

if total tt < 5950 {
  while total tt < 5950 {
    studies purchase TREE_MIN
    studies nowait purchase 181-192,201,infinity,212,224,232,211,222,193,214,213,228,234,226
    studies respec
  }

  eternity nowait
  studies nowait purchase TREE_MAIN
  eternity respec
}

until ec11 completions >= 2 {
  studies purchase 11-62,antimatter,111,active,151-193,211-213,222,223,225,231,233|11!
  wait pending completions >= 2
  eternity nowait
}

if total tt < 8600 {
  while total tt < 8600 {
    studies purchase TREE_MIN
    studies nowait purchase 181-192,201,infinity,212,224,232,211,222,193,214,213,228,234,226
    studies respec
  }

  eternity nowait
  studies nowait purchase TREE_MAIN
  eternity respec
}

until ec10 completions >= 5 {
  studies purchase 11-62,antimatter,111,active,151-214,222,223,225,228,232,234|10!
  auto infinity 5s
  wait pending completions >= 5
  eternity nowait
  auto infinity off
}

until ec12 completions >= 5 {
  studies purchase 11-62,time,111,passive,151-191,193,211-214,222,224,226,227,232,234|12!
  studies nowait purchase 192,201,infinity
  wait pending completions >= 5
  eternity nowait
}

if tp < 1 {
  studies nowait purchase TREE_MAIN
  wait total tt >=  12858
  eternity respec
  studies nowait purchase TREE_DIL
  unlock dilation
  notify "BUY DILATION UPGRADES & TIME DIMS"
  start dilation
  pause 1s
  eternity respec
}

auto eternity 12s
studies nowait purchase TREE_MAIN
until pending ep > 1e2000 {
  studies nowait purchase TREE_MAIN
}
eternity respec

until ec11 completions >= 5 {
  studies purchase 11-62,antimatter,111,active,151-193,211-213,222,223,225,231,233|11!
  wait pending completions >= 5
  eternity nowait
}

auto infinity off
auto eternity off

notify "PREPARE FOR BH & REALITY"
while 1 > 0 {
  if dt < 1e80 {
    eternity nowait respec
    studies purchase TREE_DIL
    start dilation
    pause 1s
    eternity respec
  }

  if pending ep > ep {
    eternity
  }

  studies purchase TREE_MAIN
  pause 4s
}`,
  },
  {
    id: "tovion-all-ecs",
    name: "MyECScript",
    title: "First script after unlocking the Automator",
    author: "u/tovion",
    source: "https://reddit.com/r/AntimatterDimensions/comments/13o48j3/first_script_after_unlocking_automator/",
    sourceLabel: "r/AntimatterDimensions",
    era: "Automator unlock through all 60 EC completions",
    tags: ["route","ec"],
    summary: "All 60 completions as one deeply nested ladder of TT gates — no farming loops, it simply falls through to whichever challenges your Time Theorem total already allows, then farms EP and Dilation at the end. A useful contrast with the generated route script.",
    constants: [],
    body: `if total TT < 350{
auto infinity 1 seconds
}
auto eternity off
eternity respec
if ec7 completions < 2{
IF TOTAL TT > 130 {
IF EC1 COMPLETIONS < 1  {
studies purchase 11,22,32,42,51,61,72,82,92,102,111,active,151,161,171|1
start ec 1
eternity
}
IF TOTAL TT > 140 {
IF EC2 COMPLETIONS < 1  {
studies purchase 11,22,32,42,51,61,73,83,93,103,111,active,151,161,171|2
start ec 2
eternity
}
IF TOTAL TT > 142{
IF EC4 COMPLETIONS < 1{
auto infinity 10 seconds
studies purchase 11,22,32,33,42,51,61,73,83,93,103,111,idle |4
start ec 4
eternity
auto infinity 1 seconds
}
IF TOTAL TT > 147 {
IF EC5 COMPLETIONS < 1  {
studies purchase 11,21,22,32,42,51|5
start ec 5
eternity
}
IF TOTAL TT > 150 {
IF EC1 COMPLETIONS < 2  {
studies purchase 11,21,22,32,42,51,61,72,82,92,102,111,active,151,161,162,171|1
start ec 1
eternity
}
IF TOTAL TT > 157 {
IF EC2 COMPLETIONS < 2  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|2
start ec 2
eternity
}
IF EC1 COMPLETIONS < 3  {
studies purchase 11,21,22,32,33,42,51,61,62,72,82,92,102,111,active,151,161,162,171|1
start ec 1
eternity
}
IF TOTAL TT > 160 {
IF EC3 COMPLETIONS < 1  {
studies purchase 11,22,32,42,51,61,71,81,91,101,111,active,151,161,162,171|3
start ec 3
eternity
}
IF EC6 COMPLETIONS < 1  {
auto infinity 10 x highest
studies purchase 11,22,32,33,42,51,61,62,72,82,92,102,111,active |6
start ec 6
eternity
}
IF TOTAL TT > 166 {
IF EC7 COMPLETIONS < 1  {
studies purchase 11,21,22,32,42,51,61,62,71,81,91,101,111|7
start ec 7
eternity
}
IF TOTAL TT > 173 {
IF EC1 COMPLETIONS < 4  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,72,82,92,102,111,active,151,161,162,171|1
start ec 1
eternity
}
IF TOTAL TT > 175{
IF EC4 COMPLETIONS < 2{
auto infinity 10 seconds
studies purchase 11,22,32,33,42,51,61,62,73,83,93,103,111,idle,151,162,171|4
start ec 4
eternity
studies purchase 11,22,32,33,42,51,61,62,73,83,93,103,111,idle,151,162,171|4
start ec 4
eternity
auto infinity 1 seconds
}
IF TOTAL TT > 176 {
IF EC6 COMPLETIONS < 2  {
auto infinity 10 x highest
studies purchase 11,21,22,32,42,51,61,62,72,82,92,102,111,active,151,162|6
start ec 6
eternity
}
IF TOTAL TT > 180 {
IF EC3 COMPLETIONS < 2  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|3
start ec 3
eternity
}
IF TOTAL TT > 182 {
IF EC2 COMPLETIONS < 3  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|2
start ec 2
eternity
}
IF EC5 COMPLETIONS < 2  {
studies purchase 11,22,32,42,51,61,72,82,92,102,111|5
start ec 5
eternity
}
IF TOTAL TT > 186 {
IF EC1 COMPLETIONS < 5  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,72,82,92,102,111,active,151,161,162,171|1
start ec 1
eternity
}
IF TOTAL TT > 193 {
IF EC7 COMPLETIONS < 2  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active |7
start ec 7
eternity
}}}}}}}}}}}}}}}}}

if ec8 completions < 4{
IF TOTAL TT > 200 {
IF EC2 COMPLETIONS < 4  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|2
start ec 2
eternity
  }
IF EC3 COMPLETIONS < 3  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|3
start ec 3
eternity
}
IF EC3 COMPLETIONS < 4  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|3
start ec 3
eternity
}
IF EC5 COMPLETIONS < 3  {
studies purchase 11,22,32,42,51,61,72,82,92,102,111,active |5
start ec 5
eternity
}
IF EC6 COMPLETIONS < 3  {
auto infinity 10 x highest
studies purchase 11,21,22,32,33,42,51,61,62,72,82,92,102,111,active,151,161,162,171|6
start ec 6
eternity
}
IF EC8 COMPLETIONS < 1  {
studies purchase 11,22,32,42,51,61,73,83,93,103,111,idle,151,162|8
start ec 8
eternity
}
IF TOTAL TT > 215 {
IF EC5 COMPLETIONS < 4  {
studies purchase 11,21,22,32,42,51,61,62,72,82,92,102,111,active,151|5
start ec 5
eternity
}
IF TOTAL TT > 220 {
IF EC3 COMPLETIONS < 5  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|3
start ec 3
eternity
}
IF TOTAL TT > 240 {
IF EC7 COMPLETIONS < 3  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|7
start ec 7
eternity
}
IF EC2 COMPLETIONS < 5  {
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|2
start ec 2
eternity
}
IF TOTAL TT > 245{
IF EC4 COMPLETIONS < 4{
auto infinity 10 seconds
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,idle,151,161,162,171|4
start ec 4
eternity
auto infinity 1 seconds
}
IF EC5 COMPLETIONS < 5  {
auto infinity 10 x highest
studies purchase 11,21,22,32,33,42,51,61,62,72,82,92,102,111,active,151,161,162,171|5
start ec 5
eternity
}
IF TOTAL TT > 264 {
IF EC6 COMPLETIONS < 4  {
auto infinity 10 x highest
studies purchase 11,21,22,31,32,33,41,42,51,61,62,72,82,92,102,111,active,151,161,162,171|6
start ec 6
eternity
}
IF EC7 COMPLETIONS < 4{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171|7
start ec 7
eternity
}
IF TOTAl TT > 310{
IF EC8 COMPLETIONS < 2{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111, idle,151,161,162,171|8
start ec 8
eternity
}
IF TOTAL TT > 320{
IF EC6 COMPLETIONS < 5{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,72,82,92,102,111,active,151,161,162,171|6
auto infinity 10 x highest
start ec 6
eternity
}
IF TOTAL TT > 370{
IF EC4 COMPLETIONS < 5{
studies purchase 11,22,32,42,51,61,73,83,93,103,111,idle,151,162,171,181|4
auto infinity off
start ec 4
eternity
}
IF TOTAl TT > 450{
IF EC8 COMPLETIONS < 3{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,idle,151,161,162,171,181|8
auto infinity off
start ec 8
eternity
}
IF TOTAl TT > 522{
IF EC9 COMPLETIONS < 1{
auto infinity 5 seconds
studies purchase 11,22,32,42,51,61,73,83,93,103,111,active,151,161,162,171|9
start ec 9
eternity
}
IF TOTAl TT > 575{
IF EC9 COMPLETIONS < 2{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|9
start ec 9
eternity
}
IF TOTAl TT > 600{
IF EC8 COMPLETIONS < 4{
studies purchase 11,21,22,31,32,33,42,51,61,62,73,83,93,103,111,idle,151,161,162,171,181|8
auto infinity off
start ec 8
eternity
  }}}}}}}}}}}}}}}
IF TOTAl TT > 660{
IF EC9 COMPLETIONS < 3{
auto infinity 5 seconds
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171|9
start ec 9
eternity
}
auto infinity off
IF TOTAl TT > 760{
IF EC9 COMPLETIONS < 4{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171,181|9
start ec 9
eternity
}
IF TOTAl TT > 825{
IF EC8 COMPLETIONS < 5{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,idle,151,161,162,171,181|8
start ec 8
eternity
}
IF TOTAl TT > 830{
IF EC9 COMPLETIONS < 5{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171,181|9
start ec 9
eternity
}
IF TOTAL TT > 858{
IF EC10 Completions < 1{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,171,181|10
start ec10
eternity
IF EC7 COMPLETIONS < 5{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171,181,193,214|7
start ec 7
eternity
}}
IF total TT > 1820{
if ec10 completions <2{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,171,181,191,193,211,214|10
start ec10
eternity
}
IF total TT > 2050{
if ec10 completions <3{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,171,181,191,193,211,214|10
start ec10
eternity
}
IF total TT > 2740{
if ec10 completions <4{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,171,181,191,192,193,211,213,214|10
start ec10
eternity
}
IF total TT > 4135{
if ec10 completions <5{
studies purchase 11,21,22,31,32,33,41,42,51,61,62,71,81,91,101,111,active,151,161,171,181,191,192,193,211,213,214,222,231|10
start ec10
eternity
}
if total TT > 10800{
while ec12 completions <5{
auto eternity off
studies purchase 11,21,22,31,32,41,42,51,61,62,73,83,93,103,111,active,151,161,162,171,181,191,193,211,212,213,214,222,224,226,227,232,234|12
start ec12
auto eternity 0 seconds
  }
while ec11 completions < 5{
auto eternity off
studies purchase 11,21,22,31,32,41,42,51,61,62,71,81,91,101,111,active,151,161,162,171,181,191,192,193,211,212,213,222,223,225,231,233|11
start ec 11
auto eternity 0 seconds
wait eternity
}}}}}}}}}}}
if total TT < 350{
AUTO INFINITY 100 x highest
}
AUTO ETERNITY 10 x highest
if ep > 1e400{
auto eternity 30 seconds
}
STUDIES NOWAIT LOAD ID 3
WAIT ETERNITY
STUDIES NOWAIT LOAD ID 3
wait eternity 
STUDIES NOWAIT LOAD ID 3
wait eternity
while total completions >= 60{
  auto eternity 30 seconds
  wait eternity
  STUDIES NOWAIT LOAD ID 3
  unlock dilation
  start dilation
  auto eternity 10 seconds
  wait eternity

}`,
  },
];
