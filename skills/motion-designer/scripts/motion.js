#!/usr/bin/env node
// Motion Designer — brief → storyboard → motion graphics video.
//
//   node motion.js styles                      the style catalog (what each is for)
//   node motion.js new <dir> [--style s] [--format 16:9]
//   node motion.js compose <dir>               video.json → build/ (HTML, no render)
//   node motion.js frames <dir>                compose + one real frame per scene (frames/*.jpg + sheet.jpg)
//   node motion.js board <dir> [--open]        the storyboard page: live preview, edits, Approve
//   node motion.js render <dir> [--draft]      compose + render → renders/vN.mp4 and <name>.mp4
//   node motion.js filmcraft <dir> [out]       on-demand multi-track FilmCraft project export (.xml + .otio + isolated stems)
//   node motion.js set <dir> key=value …       change video.json (style=kinetic length=20 format=9:16 …)
//   node motion.js grab <dir> <url>            a website → screenshots, logo, colours, its own words
//   node motion.js restore <dir> vN            go back to the plan behind renders/vN.mp4
//
// Node 22+, ffmpeg, and `npx hyperframes` (installs itself on first use).
import fs from "node:fs";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { compose, readJSON, writeJSON, styleList, loadMD, FORMATS, SKILL, timing, resolveLook } from "./lib/compose.js";

const args = process.argv.slice(2);
const cmd = args[0];
const flags = {};
const pos = [];
for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    const [k, v] = a.slice(2).split("=");
    if (v !== undefined) flags[k] = v;
    else if (args[i + 1] && !args[i + 1].startsWith("--") && !["open", "draft", "alpha", "prores", "4k", "1080p", "json", "quiet", "no-open", "alts", "skip-review", "no-check", "keep"].includes(k)) flags[k] = args[++i];
    else flags[k] = true;
  } else pos.push(a);
}
const die = (m, code = 1) => { console.error(m); process.exit(code); };
const work = pos[0] ? path.resolve(pos[0]) : null;
const vfile = work ? path.join(work, "video.json") : null;
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function need() {
  if (!work) die(`Which project? e.g. node motion.js ${cmd} ./launch-video`);
  if (!fs.existsSync(vfile)) die(`No video.json in ${work}. Start one with: node motion.js new ${pos[0]}`);
}
function printReport(r) {
  const st = r.soundtrack;
  console.log(`${r.styleName} · ${r.format} · ${r.duration.toFixed(1)} s · font ${r.font} · palette ${r.palette} · ${r.sounds} sound cues · music: ${r.music || "none"}${r.bpm ? ` ${r.bpm} bpm` : ""}${st && st.lufs != null ? ` · ${st.lufs.toFixed(1)} LUFS, ${st.truePeak.toFixed(1)} dBTP` : ""}`);
  if (st && st.lufs != null && (st.lufs < -17.5 || st.lufs > -14.8 || st.truePeak > -1.5)) console.log(`  ⚠ soundtrack loudness is off (${st.lufs} LUFS, ${st.truePeak} dBTP) — target −16 LUFS, under −1 dBTP`);
  for (const [i, s] of r.scenes.entries()) console.log(`  ${String(i + 1).padStart(2)}  ${s.t0.toFixed(1).padStart(5)}s  ${s.dur.toFixed(1)}s  ${s.kind.padEnd(10)} ${s.tin !== "cut" || i ? `← ${s.tin}` : ""}`);
  for (const w of r.warnings) console.log(`  ⚠ ${w}`);
}

function hf(argv, opts = {}) {
  const localPy = path.join(SKILL, "scripts/local_renderer.py");
  if (!process.env.MD_USE_NPX_HYPERFRAMES) {
    const r = spawnSync("python3", [localPy, ...argv], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
    if (r.status === 0) return r;
  }
  return spawnSync(npx, ["--yes", "hyperframes", ...argv], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
}

function frames(r, dir, outDir, label = "scene") {
  fs.mkdirSync(outDir, { recursive: true });
  const times = r.scenes.map((s) => s.hero);
  const tmp = path.join(outDir, ".snap");
  fs.rmSync(tmp, { recursive: true, force: true });
  const res = hf(["snapshot", dir, "--at", times.map((t) => t.toFixed(3)).join(","), "--no-end", "-o", tmp, "--json"]);
  const pngs = fs.existsSync(tmp) ? fs.readdirSync(tmp).filter((f) => /^frame-.*\.(png|jpe?g)$/i.test(f)).sort() : [];
  if (pngs.length < times.length) die(`hyperframes snapshot made ${pngs.length}/${times.length} frames.\n${(res.stderr || res.stdout || "").slice(-2000)}`);
  const out = [];
  pngs.slice(0, times.length).forEach((f, i) => {
    const dst = path.join(outDir, `${label}-${String(i + 1).padStart(2, "0")}.jpg`);
    spawnSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(tmp, f), "-vf", "scale=960:-2", "-q:v", "3", dst]);
    out.push(dst);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  const cols = Math.min(4, out.length);
  const sheet = path.join(outDir, "sheet.jpg");
  const inputs = out.flatMap((f) => ["-i", f]);
  const n = out.length;
  const rows = Math.ceil(n / cols);
  const layout = out.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, (_, j) => `w${j}`).join("+") : "0"}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, (_, j) => `h${j}`).join("+") : "0"}`).join("|");
  if (n > 1) spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${out.map((_, i) => `[${i}:v]scale=480:-2[v${i}]`).join(";")};${out.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${n}:layout=${layout}:fill=black[o]`, "-map", "[o]", "-q:v", "3", sheet]);
  else if (n === 1) fs.copyFileSync(out[0], sheet);
  void rows;
  return { files: out, sheet };
}

function checkBuild(r, build) {
  const res = hf(["check", build, "--json"]);
  fs.rmSync(path.join(build, ".hyperframes"), { recursive: true, force: true });
  let d;
  try { d = JSON.parse(res.stdout.slice(res.stdout.indexOf("{"))); } catch { console.log("check: couldn't read the result — run npx hyperframes check yourself"); return; }
  const near = (t) => r.scenes.some((s, i) => i > 0 && Math.abs(t - s.t0) < 0.6);
  const sceneAt = (t) => { const i = r.scenes.findIndex((s, j) => t >= s.t0 && (j === r.scenes.length - 1 || t < r.scenes[j + 1].t0)); return i < 0 ? "" : `scene ${i + 1} (${r.scenes[i].kind}) `; };
  const out = [];
  for (const sec of ["lint", "runtime", "motion", "craft", "contrast", "layout"]) {
    for (const x of (d[sec] && d[sec].findings) || []) {
      if (x.code === "content_overlap" || x.code === "container_overflow" || x.code === "duplicate_media_discovery_risk") continue;
      const t = x.time ?? (x.times && x.times[0]);
      if ((x.code || "").startsWith("contrast") && t != null && near(t)) continue;
      if (x.severity !== "error" && !/unread|below_floor|contrast|clip|offscreen|missing|fail/.test(x.code || "")) continue;
      out.push(`  ${x.severity === "error" ? "✗" : "⚠"} ${t != null ? sceneAt(t) : ""}${x.code}: ${(x.message || "").slice(0, 200)}${x.text ? ` — "${String(x.text).slice(0, 40)}"` : ""}`);
    }
  }
  const uniq = [...new Set(out)];
  console.log(uniq.length ? `check (${uniq.length}):\n${uniq.slice(0, 25).join("\n")}` : "check: clean");
}

switch (cmd) {
  case "styles": {
    const st = styleList();
    if (flags.json) { console.log(JSON.stringify(st.map((s) => ({ id: s.id, name: s.name, tagline: s.tagline, look: s.look, bestFor: s.bestFor, avoid: s.avoid, fonts: s.fonts, palettes: s.palettes, kinds: Object.keys(s.kinds || {}) })), null, 2)); break; }
    for (const s of st) {
      console.log(`\n${s.id.padEnd(10)} ${s.name} — ${s.tagline}`);
      console.log(`           ${s.look}`);
      console.log(`           best for: ${s.bestFor.join(", ")}`);
      console.log(`           not for:  ${s.avoid}`);
      console.log(`           fonts: ${s.fonts.map((f, i) => `${i}=${f.name}`).join("  ")}   palettes: ${s.palettes.map((p, i) => `${i}=${p.name}`).join("  ")}`);
    }
    break;
  }
  case "new": {
    if (!work) die("node motion.js new <dir>");
    if (fs.existsSync(vfile) && !flags.force) die(`${vfile} already exists (--force to start over).`);
    fs.mkdirSync(path.join(work, "assets"), { recursive: true });
    const v = {
      title: flags.title || path.basename(work),
      brief: flags.brief || "",
      purpose: flags.purpose || "",
      style: flags.style || "editorial",
      wpm: flags.wpm ? +flags.wpm : 135,
      alternates: [],
      format: flags.format || "16:9",
      length: flags.length ? +flags.length : null,
      font: 0,
      palette: 0,
      brand: { name: "", url: "", color: null, logo: null },
      sound: { sfx: "on", music: "auto" },
      scenes: [],
    };
    writeJSON(vfile, v);
    console.log(`${vfile}\nPut screenshots, recordings and a logo in ${path.join(work, "assets")}, then write the scenes.`);
    break;
  }
  case "cutout": {
    need();
    const imgPath = pos[1];
    const py = path.join(SKILL, "scripts/polymath_plots.py");
    const argsPy = imgPath ? [py, work, path.resolve(imgPath)] : [py, work];
    const res = spawnSync("python3", argsPy, { encoding: "utf8", stdio: "inherit" });
    if (res.status !== 0) die("Failed to process Vox cutout asset.");
    break;
  }
  case "plot": {
    need();
    const py = path.join(SKILL, "scripts/polymath_plots.py");
    const res = spawnSync("python3", [py, work], { encoding: "utf8", stdio: "inherit" });
    if (res.status !== 0) die("Failed to generate Matplotlib plots.");
    console.log(`Generated dark-mode empirical plots in ${path.join(work, "assets")}`);
    break;
  }
  case "compose": {
    need();
    const r = compose(work);
    printReport(r);
    console.log(`→ ${path.join(work, "build/index.html")}`);
    break;
  }
  case "frames": {
    need();
    const r = compose(work);
    printReport(r);
    const f = frames(r, path.join(work, "build"), path.join(work, "frames"));
    console.log(`frames: ${path.join(work, "frames")} (${f.files.length})\nsheet:  ${f.sheet}`);
    if (!flags["no-check"]) checkBuild(r, path.join(work, "build"));
    break;
  }
  case "alts": {
    need();
    const v = readJSON(vfile);
    const ids = (flags.styles ? String(flags.styles).split(",") : v.alternates || []).filter((x) => x && x !== v.style);
    for (const id of ids) {
      const r = compose(work, { video: { ...v, style: id, font: 0, palette: 0 }, out: path.join(work, ".alts", id) });
      console.log(`${id}: ${r.duration.toFixed(1)} s`);
    }
    break;
  }
  case "board": {
    need();
    const { serveBoard } = await import("./lib/board.js");
    const code = await serveBoard(work, { open: !!flags.open && !flags["no-open"], port: flags.port ? +flags.port : 0 });
    process.exit(code);
  }
  case "fusion": {
    need();
    const outComp = pos[1] ? path.resolve(pos[1]) : path.join(work, "vox_diorama_resolve.comp");
    const py = path.join(SKILL, "scripts/vox_fusion_export.py");
    const res = spawnSync("python3", [py, work, outComp], { encoding: "utf8", stdio: "inherit" });
    if (res.status !== 0) die("Failed to export DaVinci Resolve Fusion (.comp) and cut-out pieces.");
    break;
  }
  case "filmcraft": {
    need();
    const outTarget = pos[1] ? path.resolve(pos[1]) : (flags.out ? path.resolve(String(flags.out)) : null);
    const py = path.join(SKILL, "scripts/filmcraft_export.py");
    const pyArgs = outTarget ? [py, work, "--out", outTarget] : [py, work];
    const res = spawnSync("python3", pyArgs, { encoding: "utf8", stdio: "inherit" });
    if (res.status !== 0) die("Failed to export FilmCraft multi-track project bundle.");
    break;
  }
  case "canvas": {
    need();
    const r = compose(work);
    printReport(r);
    const outHtml = pos[1] ? path.resolve(pos[1]) : path.join(work, "storyboard-canvas.html");
    const py = path.join(SKILL, "scripts/build_canvas.py");
    const res = spawnSync("python3", [py, work, outHtml], { encoding: "utf8", stdio: "inherit" });
    if (res.status !== 0) die("Failed to build self-contained Canvas storyboard HTML.");
    break;
  }
  case "render": {
    need();
    const v = readJSON(vfile);
    if (!flags.draft && !v.approved && !flags["skip-review"]) die(`Nothing renders before the storyboard is approved once.\nRun: node ${path.join(SKILL, "scripts/motion.js")} board ${pos[0]} --open\n(or --skip-review if the person said to skip it)`);
    const r = compose(work);
    printReport(r);
    const build = path.join(work, "build");
    fs.mkdirSync(path.join(work, "renders"), { recursive: true });
    const n = fs.readdirSync(path.join(work, "renders")).filter((f) => /^v\d+\.mp4$/.test(f)).length + 1;
    const out = path.join(work, "renders", flags.draft ? `draft.mp4` : `v${n}.mp4`);
    const t = Date.now();
    const useAlpha = Boolean(flags.alpha || flags.prores || v.transparent);
    if (useAlpha && !v.transparent) { v.transparent = true; writeJSON(vfile, v); compose(work); }
    const resFlag = flags.res ? ["--res", String(flags.res)] : (flags["4k"] ? ["--res", "4k"] : (flags["1080p"] ? ["--res", "1080p"] : []));
    const fpsFlag = flags.fps ? ["--fps", String(flags.fps)] : [];
    const q = [...(flags.draft ? ["--quality", "draft"] : ["--quality", "looks", "--video-bitrate", flags.bitrate || "10M"]), ...(useAlpha ? ["--alpha"] : []), ...resFlag, ...fpsFlag];
    const res = hf(["render", build, "--output", out, ...q], { stdio: ["ignore", "pipe", "inherit"] });
    if (res.status !== 0 || !fs.existsSync(out)) die(`Render failed (exit ${res.status}).\n${(res.stderr || res.stdout || "").slice(-3000)}\nTry: npx hyperframes check ${build}`);
    const mix = path.join(build, "assets/mix.wav");
    if (fs.existsSync(mix)) {
      const tp = (f) => { const x = spawnSync("ffmpeg", ["-hide_banner", "-i", f, "-af", "loudnorm=print_format=json", "-f", "null", "-"], { encoding: "utf8" }); const m = (x.stderr || "").match(/"input_tp"\s*:\s*"([-\d.]+)"/); return m ? +m[1] : null; };
      let gain = 0;
      for (let k = 0; k < 3; k++) {
        const tmp = out.replace(/\.mp4$/, ".mux.mp4");
        const m = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", out, "-i", mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-af", `volume=${gain}dB`, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-t", String(r.duration), "-movflags", "+faststart", tmp]);
        if (m.status !== 0 || !fs.existsSync(tmp)) { console.log("⚠ couldn't put the mastered soundtrack in; the renderer's mix stays"); break; }
        const peak = tp(tmp);
        if (peak != null && peak > -0.3 && k < 2) { gain -= peak + 0.5; fs.rmSync(tmp, { force: true }); continue; }
        fs.renameSync(tmp, out);
        break;
      }
    }
    const secs = ((Date.now() - t) / 1000).toFixed(0);
    if (!flags.draft) {
      const slug = (v.title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
      const final = path.join(work, `${slug}.mp4`);
      fs.rmSync(final, { force: true });
      try { fs.linkSync(out, final); } catch { fs.copyFileSync(out, final); }
      fs.copyFileSync(vfile, out.replace(/\.mp4$/, ".json"));
      v.renders = [...(v.renders || []), { file: path.relative(work, out), at: new Date().toISOString(), style: v.style, format: v.format, duration: r.duration }];
      writeJSON(vfile, v);
      const qa = path.join(work, "qa");
      fs.mkdirSync(qa, { recursive: true });
      const shots = r.scenes.map((s, i) => { const f = path.join(qa, `s${String(i + 1).padStart(2, "0")}.jpg`); spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", s.hero.toFixed(3), "-i", out, "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", f]); return f; });
      const cols = Math.min(4, shots.length);
      const layout = shots.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, (_, j) => `w${j}`).join("+") : "0"}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, (_, j) => `h${j}`).join("+") : "0"}`).join("|");
      if (shots.length > 1) spawnSync("ffmpeg", ["-v", "error", "-y", ...shots.flatMap((f) => ["-i", f]), "-filter_complex", `${shots.map((_, i) => `[${i}:v]`).join("")}xstack=inputs=${shots.length}:layout=${layout}:fill=black[o]`, "-map", "[o]", "-q:v", "3", path.join(qa, "sheet.jpg")]);
      console.log(`rendered in ${secs} s → ${out}\nfinal: ${final}\nQA sheet: ${path.join(qa, "sheet.jpg")}`);
    } else console.log(`draft rendered in ${secs} s → ${out}`);
    break;
  }
  case "grab": {
    const url = pos[1];
    if (!work || !url) die("node motion.js grab <dir> <url>");
    const cap = path.join(work, ".capture");
    fs.rmSync(cap, { recursive: true, force: true });
    fs.mkdirSync(path.join(work, "assets"), { recursive: true });
    console.log(`capturing ${url} (about a minute)…`);
    const res = hf(["capture", url, "-o", cap, "--skip-vision", "--max-screenshots", String(flags.shots || 8), "--json"]);
    const shots = path.join(cap, "screenshots");
    if (!fs.existsSync(shots)) die(`capture failed:\n${(res.stderr || res.stdout || "").slice(-1500)}`);
    const got = [];
    fs.readdirSync(shots).filter((f) => /^scroll-\d+\.png$/.test(f)).sort().forEach((f, i) => {
      const dst = path.join(work, "assets", `site-${i + 1}.png`);
      fs.copyFileSync(path.join(shots, f), dst);
      got.push(path.relative(work, dst));
    });
    const svgDir = path.join(cap, "assets/svgs");
    const logos = [];
    if (fs.existsSync(svgDir)) fs.readdirSync(svgDir).filter((f) => /^logo-.*\.svg$/.test(f)).forEach((f, i) => { const dst = path.join(work, "assets", `logo-${i + 1}.svg`); fs.copyFileSync(path.join(svgDir, f), dst); logos.push(path.relative(work, dst)); });
    for (const f of ["favicon.png", "icon-icon-unsized.png", "apple-touch-icon.png"]) { const p = path.join(cap, "assets", f); if (fs.existsSync(p)) { const dst = path.join(work, "assets", f); fs.copyFileSync(p, dst); logos.push(path.relative(work, dst)); } }
    const tok = readJSON(path.join(cap, "extracted/tokens.json"), {});
    const colours = [...new Set(Object.values(tok.cssVariables || {}).filter((x) => /^#[0-9a-f]{6}$/i.test(x)).map((x) => x.toLowerCase()))].slice(0, 24);
    const fontsUsed = readJSON(path.join(cap, "extracted/fonts-manifest.json"), []);
    const txt = path.join(cap, "extracted/visible-text.txt");
    if (fs.existsSync(txt)) fs.copyFileSync(txt, path.join(work, "assets/site-text.txt"));
    const site = { url, title: tok.title, description: tok.description, colours, fonts: (Array.isArray(fontsUsed) ? fontsUsed : fontsUsed.fonts || []).map((f) => f.family).filter(Boolean).slice(0, 8), screenshots: got, logos, text: "assets/site-text.txt" };
    writeJSON(path.join(work, "assets/site.json"), site);
    if (!flags.keep) fs.rmSync(cap, { recursive: true, force: true });
    console.log(`screenshots: ${got.join(", ") || "none"}  (look at them: crop away cookie banners)\nlogo candidates: ${logos.join(", ") || "none"}  (look at each: some are a "powered by" mark, not theirs)\ncolours: ${colours.slice(0, 10).join(" ")}\ntitle: ${site.title || ""}\nthe site's own words: ${site.text}\n→ ${path.join(work, "assets/site.json")}`);
    break;
  }
  case "restore": {
    need();
    const n = String(pos[1] || "").replace(/^v/, "");
    const src = path.join(work, "renders", `v${n}.json`);
    if (!fs.existsSync(src)) die(`No renders/v${n}.json. Renders: ${fs.readdirSync(path.join(work, "renders")).filter((f) => f.endsWith(".mp4")).join(", ")}`);
    const v = readJSON(src);
    v.approved = true;
    writeJSON(vfile, v);
    console.log(`video.json is back to v${n}. Render to make it the latest, or keep editing from here.`);
    break;
  }
  case "set": {
    need();
    const v = readJSON(vfile);
    for (const kv of pos.slice(1)) {
      const i = kv.indexOf("=");
      if (i < 0) die(`set takes key=value, got "${kv}"`);
      const key = kv.slice(0, i);
      let val = kv.slice(i + 1);
      try { val = JSON.parse(val); } catch {}
      const parts = key.split(".");
      let o = v;
      for (const p of parts.slice(0, -1)) { const k = /^\d+$/.test(p) ? +p : p; if (o[k] == null) o[k] = {}; o = o[k]; }
      o[/^\d+$/.test(parts.at(-1)) ? +parts.at(-1) : parts.at(-1)] = val;
      console.log(`${key} = ${JSON.stringify(val)}`);
    }
    writeJSON(vfile, v);
    break;
  }
  default:
    console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 13).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
}
