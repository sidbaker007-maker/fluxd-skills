#!/usr/bin/env node
// doctor: is this environment ready to make videos? Checks Node (18+), ffmpeg, and Chromium,
// then makes a real two-second video from a two-scene plan (compose → frames → render) and verifies it.
//
//   node doctor.js          check, and say what to fix
//   node doctor.js --quick  skip the test render
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { findChromium } from "./lib/headless.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const motion = path.join(here, "motion.js");
const quick = process.argv.includes("--quick");
const win = process.platform === "win32";
let bad = 0;
const ok = (m) => console.log(`  ok  ${m}`);
const no = (m, fix) => { bad++; console.log(`  !!  ${m}${fix ? `\n      fix: ${fix}` : ""}`); };
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: "utf8", shell: win, maxBuffer: 1 << 26, ...o });

console.log("Motion Designer — checking environment\n");

const major = +process.versions.node.split(".")[0];
if (major >= 18) ok(`Node ${process.versions.node}`);
else no(`Node ${process.versions.node} — needs Node 18 or newer`, "install current Node LTS");

const ff = run("ffmpeg", ["-version"]);
const fp = run("ffprobe", ["-version"]);
if (ff.status === 0 && fp.status === 0) ok(`ffmpeg ${(ff.stdout.match(/ffmpeg version (\S+)/) || [])[1] || ""}`.trim());
else no("ffmpeg isn't installed (it measures sound and encodes video)", "install ffmpeg");

const chr = findChromium();
if (chr) {
  const cv = run(chr, ["--version"]);
  ok(`Chromium renderer (${(cv.stdout || chr).trim()})`);
} else {
  no("Chromium isn't installed (needed to render HTML compositions to MP4)", "install chromium");
}

if (bad) {
  console.log(`\n${bad} thing${bad > 1 ? "s" : ""} to fix first (above).`);
  process.exit(1);
}
if (quick) { console.log("\nReady (test render skipped)."); process.exit(0); }

// a real video, start to finish
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "motion-designer-check-"));
fs.writeFileSync(path.join(dir, "video.json"), JSON.stringify({
  title: "Check", style: "kinetic", format: "16:9", sound: { sfx: "on", music: "auto" },
  scenes: [{ kind: "hook", text: "It *works*.", dur: 1.2 }, { kind: "outro", text: "Motion Designer", dur: 1.2 }],
}, null, 2));
const steps = [["compose", ["compose", dir]], ["frames", ["frames", dir]], ["render", ["render", dir, "--skip-review"]]];
for (const [name, args] of steps) {
  const r = run(process.execPath, [motion, ...args], { timeout: 600000 });
  if (r.status !== 0) {
    no(`test ${name} failed`, (r.stderr || r.stdout || "").trim().split("\n").slice(-6).join("\n      "));
    console.log(`\nThe test project is in ${dir} if you want to look.`);
    process.exit(1);
  }
}
const mp4 = fs.readdirSync(path.join(dir, "renders")).find((f) => f.endsWith(".mp4"));
const size = mp4 ? fs.statSync(path.join(dir, "renders", mp4)).size : 0;
if (size > 10000) ok(`made a test video (${Math.round(size / 1024)} KB, with its soundtrack)`);
else { no("the test video came out empty"); process.exit(1); }
fs.rmSync(dir, { recursive: true, force: true });
console.log("\nReady. Motion Designer can make videos in this environment.");
