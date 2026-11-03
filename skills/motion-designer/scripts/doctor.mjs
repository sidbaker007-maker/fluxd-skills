#!/usr/bin/env node
// doctor: is this computer ready to make videos? Checks Node, ffmpeg and HyperFrames, then makes a real
// two-second video from a two-scene plan (compose → frames → render) and says it worked.
//
//   node doctor.mjs          check, and say what to fix
//   node doctor.mjs --quick  skip the test render
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const motion = path.join(here, "motion.mjs");
const quick = process.argv.includes("--quick");
const win = process.platform === "win32";
let bad = 0;
const ok = (m) => console.log(`  ok  ${m}`);
const no = (m, fix) => { bad++; console.log(`  !!  ${m}${fix ? `\n      fix: ${fix}` : ""}`); };
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: "utf8", shell: win, maxBuffer: 1 << 26, ...o });

console.log("Motion Designer — checking this computer\n");

const major = +process.versions.node.split(".")[0];
if (major >= 22) ok(`Node ${process.versions.node}`);
else no(`Node ${process.versions.node} — HyperFrames (the renderer) needs Node 22 or newer`, "install the current LTS from https://nodejs.org, then run this again");

const ff = run("ffmpeg", ["-version"]);
const fp = run("ffprobe", ["-version"]);
if (ff.status === 0 && fp.status === 0) ok(`ffmpeg ${(ff.stdout.match(/ffmpeg version (\S+)/) || [])[1] || ""}`.trim());
else no("ffmpeg isn't installed (it measures sound and pulls frames)", process.platform === "darwin" ? "brew install ffmpeg" : win ? "winget install Gyan.FFmpeg   (then open a new terminal)" : "sudo apt install ffmpeg   (or your distro's ffmpeg package)");

const hf = run("npx", ["--yes", "hyperframes", "--version"], { timeout: 240000 });
const ver = (hf.stdout || "").trim().split(/\s+/).pop();
if (hf.status === 0 && ver) ok(`HyperFrames ${ver} (the renderer, via npx)`);
else no("HyperFrames didn't start", "check your internet connection (npx downloads it once), then run this again");

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
const steps = [["compose", ["compose", dir]], ["render", ["render", dir, "--skip-review"]]];
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
console.log("\nReady. Motion Designer can make videos on this computer.");
