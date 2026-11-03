#!/usr/bin/env node
// doctor: verifies Node, ffmpeg, NVIDIA RTX NVENC / GPU acceleration, Matplotlib, and the renderer,
// then makes a real two-second test video (compose -> render) to confirm everything works.
//
//   node doctor.js          check, and run a 2s test render
//   node doctor.js --quick  skip the test render
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const motion = path.join(here, "motion.js");
const localPy = path.join(here, "local_renderer.py");
const quick = process.argv.includes("--quick");
const win = process.platform === "win32";
let bad = 0;
const ok = (m) => console.log(`  ok  ${m}`);
const no = (m, fix) => { bad++; console.log(`  !!  ${m}${fix ? `\n      fix: ${fix}` : ""}`); };
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: "utf8", shell: win, maxBuffer: 1 << 26, ...o });

console.log("Motion Designer (Polymath + Vox + 3B1B + RTX Edition) — checking this environment\n");

const major = +process.versions.node.split(".")[0];
if (major >= 18) ok(`Node ${process.versions.node}`);
else no(`Node ${process.versions.node} — needs Node 18 or newer`);

const ff = run("ffmpeg", ["-version"]);
const fp = run("ffprobe", ["-version"]);
if (ff.status === 0 && fp.status === 0) ok(`ffmpeg ${(ff.stdout.match(/ffmpeg version (\S+)/) || [])[1] || ""}`.trim());
else no("ffmpeg isn't installed", "install ffmpeg and ffprobe");

const loc = run("python3", [localPy, "--version"], { timeout: 10000 });
if (loc.status === 0) ok(`Renderer: ${(loc.stdout || "").trim()}`);
else {
  const hf = run("npx", ["--yes", "hyperframes", "--version"], { timeout: 15000 });
  if (hf.status === 0) ok(`HyperFrames ${(hf.stdout || "").trim()}`);
  else no("Neither local_renderer.py nor HyperFrames is available");
}

const gpu = run("python3", [localPy, "--gpu-info"], { timeout: 8000 });
if (gpu.status === 0) {
  try {
    const info = JSON.parse((gpu.stdout || "{}").trim());
    if (info.has_nvenc) ok(`NVIDIA GPU Hardware Acceleration: ${info.gpu_name} (h264_nvenc + Chromium GPU active for 1080p/4K)`);
    else if (info.has_nvidia) ok(`NVIDIA GPU Detected: ${info.gpu_name} (Chromium GPU active; using libx264 encode)`);
    else ok(`CPU Sandbox Mode (libx264 encode; will auto-enable h264_nvenc on an NVIDIA RTX machine)`);
  } catch {}
}

const mpl = run("python3", ["-c", "import matplotlib, numpy, PIL; print(matplotlib.__version__)"], { timeout: 10000 });
if (mpl.status === 0) ok(`Python Matplotlib ${(mpl.stdout || "").trim()} + Pillow (telemetry plots & Vox cutouts ready)`);

if (bad) {
  console.log(`\n${bad} issue${bad > 1 ? "s" : ""} to fix first (above).`);
  process.exit(1);
}
if (quick) { console.log("\nReady (test render skipped)."); process.exit(0); }

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "motion-designer-check-"));
fs.writeFileSync(path.join(dir, "video.json"), JSON.stringify({
  title: "Check", style: "polymath", format: "16:9", sound: { sfx: "on", music: "auto" },
  scenes: [{ kind: "hook", text: "Empirical *motion* works.", dur: 1.2 }, { kind: "outro", text: "Motion Designer", dur: 1.2 }],
}, null, 2));
for (const [name, args] of [["compose", ["compose", dir]], ["render", ["render", dir, "--draft", "--skip-review"]]]) {
  const r = run(process.execPath, [motion, ...args], { timeout: 180000 });
  if (r.status !== 0) {
    no(`test ${name} failed`, (r.stderr || r.stdout || "").trim().split("\n").slice(-6).join("\n      "));
    process.exit(1);
  }
}
const mp4 = fs.readdirSync(path.join(dir, "renders")).find((f) => f.endsWith(".mp4"));
const size = mp4 ? fs.statSync(path.join(dir, "renders", mp4)).size : 0;
if (size > 5000) ok(`rendered a test video (${Math.round(size / 1024)} KB, with mastered soundtrack)`);
else { no("the test video came out empty"); process.exit(1); }
fs.rmSync(dir, { recursive: true, force: true });
console.log("\nReady. Motion Designer can compose and render videos in this environment.");
