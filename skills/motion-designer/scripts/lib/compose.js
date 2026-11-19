// compose: video.json → a HyperFrames project in <work>/build (index.html + assets). No rendering here.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { renderSoundtrack, PRESETS } from "./audio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SKILL = path.resolve(here, "../..");
export const RUNTIME = path.join(SKILL, "scripts/runtime");
export const ASSETS = path.join(SKILL, "assets");
export const CACHE_ROOT = path.join(os.tmpdir(), "motion-designer-cache-v2");
export const CACHE_ASSETS = path.join(CACHE_ROOT, "assets");
export const STYLES_DIR = path.join(SKILL, "styles");

// Auto-extract bundled binary assets (.woff2, .webp, .svg) into OS temp cache so SKILL_DIR stays pure text
try {
  const bfile = path.join(ASSETS, "binary-assets.json");
  if (fs.existsSync(bfile)) {
    const map = JSON.parse(fs.readFileSync(bfile, "utf8"));
    for (const [rel, b64] of Object.entries(map)) {
      const dest = path.join(CACHE_ROOT, rel);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(b64, "base64"));
      }
    }
  }
} catch {}
const assetFile = (...segs) => {
  const pCache = path.join(CACHE_ASSETS, ...segs);
  if (fs.existsSync(pCache)) return pCache;
  return path.join(ASSETS, ...segs);
};

export const FORMATS = {
  "16:9": { W: 1920, H: 1080, fmt: "landscape" },
  "9:16": { W: 1080, H: 1920, fmt: "portrait" },
  "1:1": { W: 1080, H: 1080, fmt: "square" },
  "4:5": { W: 1080, H: 1350, fmt: "tall" },
};

// every bundled family (SIL OFL 1.1), and the files that make it
export const FONTS = {
  "Inter": [["Inter-Variable.woff2", "100 900", "normal"]],
  "Inter Tight": [["InterTight-Variable.woff2", "100 900", "normal"]],
  "Geist": [["Geist-Variable.woff2", "100 900", "normal"]],
  "Geist Mono": [["GeistMono-Variable.woff2", "100 900", "normal"]],
  "JetBrains Mono": [["JetBrainsMono-Variable.woff2", "100 800", "normal"]],
  "Archivo": [["Archivo-Variable.woff2", "100 900", "normal", "62% 125%"], ["Archivo-Variable-Italic.woff2", "100 900", "italic", "62% 125%"]],
  "Bricolage Grotesque": [["Bricolage-Variable.woff2", "200 800", "normal", "75% 100%"]],
  "Instrument Sans": [["InstrumentSans-Variable.woff2", "400 700", "normal", "75% 100%"]],
  "Instrument Serif": [["InstrumentSerif-Regular.woff2", "400", "normal"], ["InstrumentSerif-Italic.woff2", "400", "italic"]],
  "Fraunces": [["Fraunces-Variable.woff2", "100 900", "normal"], ["Fraunces-Variable-Italic.woff2", "100 900", "italic"]],
  "DM Serif Display": [["DMSerifDisplay-400.woff2", "400", "normal"], ["DMSerifDisplay-400-Italic.woff2", "400", "italic"]],
  "DM Sans": [["DMSans-Variable.woff2", "100 1000", "normal"]],
  "Space Grotesk": [["SpaceGrotesk-Variable.woff2", "300 700", "normal"]],
  "Unbounded": [["Unbounded-Variable.woff2", "200 900", "normal"]],
  "Big Shoulders": [["BigShoulders-Variable.woff2", "100 900", "normal"]],
  "Bebas Neue": [["BebasNeue-400.woff2", "400", "normal"]],
  "Anton": [["Anton-400.woff2", "400", "normal"]],
  "Cormorant": [["Cormorant-Variable.woff2", "300 700", "normal"], ["Cormorant-Variable-Italic.woff2", "300 700", "italic"]],
  "Manrope": [["Manrope-Variable.woff2", "200 800", "normal"]],
  "Syne": [["Syne-Variable.woff2", "400 800", "normal"]],
  "Doto": [["Doto-Variable.woff2", "100 900", "normal"]],
};
const FALLBACK = { serif: "Georgia, serif", mono: "ui-monospace, Menlo, monospace", sans: "system-ui, sans-serif" };
const famStack = (f, kind = "sans") => `"${f}", ${FALLBACK[kind]}`;

const DENSE_K = { features: 1.3, compare: 1.3, list: 1.3, steps: 1.3, quote: 1.2, chart: 1.25, outro: 1.3, logo: 1.15, rank: 1.25, donut: 1.2, line: 1.15, anomaly: 1.0, telescope: 1.0, pivot: 1.0, telemetry: 1.0, rehook: 1.0, unlock: 1.0, fuse: 1.0, props: 1.0, cta: 1.0, diorama: 1.0, lighttable: 1.0, satellite: 1.0, kinomontage: 1.0, whiteboard: 1.0, bumper: 1.0 };
const DENSE = {
  landscape: DENSE_K,
  portrait: { ...DENSE_K, list: 1.25, steps: 1.25, features: 1.2, compare: 1.2, chart: 1.25, quote: 1.15, outro: 1.25 },
  square: { ...DENSE_K, features: 1.1, compare: 1.15, list: 1.2, steps: 1.2, chart: 1.15 },
  tall: { ...DENSE_K, features: 1.15, compare: 1.2, list: 1.25, steps: 1.25, chart: 1.2 },
};

// ---------- load the kit + styles (the same files the browser runs) ----------
let MD = null;
export function loadMD() {
  if (MD) return MD;
  const ctx = { console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RUNTIME, "kit.js"), "utf8"), ctx, { filename: "kit.js" });
  for (const f of fs.readdirSync(STYLES_DIR).sort()) {
    if (!f.endsWith(".js")) continue;
    vm.runInContext(fs.readFileSync(path.join(STYLES_DIR, f), "utf8"), ctx, { filename: f });
  }
  MD = ctx.MD;
  for (const [name, st] of Object.entries(MD.styles)) st.id = name;
  return MD;
}
export const styleList = () => Object.values(loadMD().styles).sort((a, b) => (a.order || 99) - (b.order || 99));

// ---------- small helpers ----------
const MD_count = (MDx, t) => MDx.count(t);
export const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { if (d !== undefined) return d; throw new Error(`Can't read ${f}: ${e.message}`); } };
export const writeJSON = (f, v) => { const tmp = `${f}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(v, null, 2) + "\n"); fs.renameSync(tmp, f); };
const r3 = (x) => Math.round(x * 1000) / 1000;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);

function imageSize(file) {
  try {
    const b = fs.readFileSync(file);
    if (b.slice(1, 4).toString() === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    if (b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP") {
      const t = b.slice(12, 16).toString();
      if (t === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (t === "VP8L") { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
    }
    if (/\.svg$/i.test(file)) {
      const s = b.toString("utf8", 0, 4000);
      const vb = s.match(/viewBox="[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/);
      if (vb) return { w: +vb[1], h: +vb[2] };
    }
  } catch {}
  return null;
}
function videoSize(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "json", file], { encoding: "utf8" });
  try {
    const s = JSON.parse(r.stdout).streams[0];
    const rot = Math.abs(((s.side_data_list || [])[0] || {}).rotation || 0);
    return rot === 90 ? { w: s.height, h: s.width } : { w: s.width, h: s.height };
  } catch { return null; }
}

// ---------- the plan ----------
export function resolveLook(v, st) {
  const fonts = st.fonts || [];
  let font = typeof v.font === "number" ? fonts[v.font] : typeof v.font === "string" ? fonts.find((f) => f.name.toLowerCase() === v.font.toLowerCase()) : null;
  if (v.font && typeof v.font === "object") font = { ...fonts[0], ...v.font, name: "Custom" };
  font = font || fonts[0];
  const pals = st.palettes || [];
  let pal = typeof v.palette === "number" ? pals[v.palette] : typeof v.palette === "string" ? pals.find((p) => p.name.toLowerCase() === v.palette.toLowerCase()) : null;
  if (v.palette && typeof v.palette === "object") pal = { ...pals[0], ...v.palette, name: "Custom" };
  pal = { ...(pal || pals[0]) };
  const brand = v.brand || {};
  if (brand.color && !(v.palette && typeof v.palette === "object" && v.palette.accent)) {
    pal.accent = brand.color;
    pal.accentInk = readableOn(brand.color);
    pal.name = (pal.name || "") + " + brand";
  }
  return { font, pal };
}
function lum(hex) {
  const m = String(hex).replace("#", "").match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
  if (!m) return 0.5;
  const c = m.slice(1).map((x) => { const v = parseInt(x, 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function readableOn(bg) { return contrast(bg, "#ffffff") >= contrast(bg, "#0b0b0b") ? "#ffffff" : "#0b0b0b"; }

export function timing(v, st, MDx, bpm) {
  const kinds = (k) => ((MDx.kinds[k] || (st.kinds && st.kinds[k])) ? { ...(MDx.kinds[k] || {}), ...((st.kinds && st.kinds[k]) || {}) } : null);
  const warn = [];
  const sc = v.scenes || [];
  const wpm = v.wpm || 135;
  const mins = sc.map((s) => {
    const K = kinds(s.kind);
    const baseMin = K ? Math.max(1, (K.min || (() => 2))(s)) : 2;
    const voMin = MDx.voSecs ? MDx.voSecs(s, wpm) : 0;
    return r3(Math.max(baseMin, voMin));
  });
  let durs = sc.map((s, i) => {
    if (typeof s.dur === "number") return s.dur;
    const ts = MDx.parseTimestamp && s.timestamp ? MDx.parseTimestamp(s.timestamp) : null;
    if (ts && ts.dur > 0) return ts.dur;
    return r3(mins[i] + 0.2);
  });
  const total0 = durs.reduce((a, b) => a + b, 0);
  if (v.length && total0 > 0) {
    const f = v.length / total0;
    durs = durs.map((d) => r3(d * f));
  }
  if (bpm) {
    const hb = 30 / bpm;
    durs = durs.map((d, i) => {
      const explicit = typeof sc[i].dur === "number" || Boolean(MDx.parseTimestamp && sc[i].timestamp && MDx.parseTimestamp(sc[i].timestamp));
      if (explicit) return r3(d);
      const q = Math.max(1, Math.round(d / hb));
      let qd = q * hb;
      if (qd < mins[i] * 0.9 && !v.length) qd = Math.ceil((mins[i] * 0.9) / hb) * hb;
      return r3(qd);
    });
  }
  sc.forEach((s, i) => {
    if (!s.voAudioSlice && durs[i] < mins[i] * 0.82) warn.push(`scene ${i + 1} (${s.kind}) gets ${durs[i].toFixed(1)} s but needs about ${mins[i].toFixed(1)} s to read/speak — cut words, drop a scene, or raise length`);
  });
  return { durs, mins, warn };
}

// ---------- compose ----------
export function compose(work, opts = {}) {
  const MDx = loadMD();
  const vfile = opts.file || path.join(work, "video.json");
  const v0 = opts.video || readJSON(vfile);
  (v0.scenes || []).forEach((s, i) => { if (!s.id) s.id = `s${i + 1}`; });
  const v = { ...v0, scenes: (v0.scenes || []).filter((s) => !s.off) };
  const st = MDx.styles[v.style] || MDx.styles[Object.keys(MDx.styles)[0]];
  MDx._st = st;
  const F = FORMATS[v.format || "16:9"] || FORMATS["16:9"];
  const { W, H, fmt } = F;
  const u = Math.min(W, H) / 100;
  const out = opts.out || path.join(work, "build");
  const warn = [];
  const { font, pal } = resolveLook(v, st);

  fs.mkdirSync(path.join(out, "assets/fonts"), { recursive: true });
  fs.mkdirSync(path.join(out, "assets/media"), { recursive: true });
  const copy = (from, to) => {
    const dst = path.join(out, to);
    try { const a = fs.statSync(from), b = fs.statSync(dst); if (a.size === b.size && a.mtimeMs <= b.mtimeMs) return to; } catch {}
    fs.copyFileSync(from, dst);
    return to;
  };
  for (const f of ["kit.js", "kit.css", "type.js"]) copy(path.join(RUNTIME, f), `assets/${f}`);
  copy(path.join(ASSETS, "vendor/gsap.min.js"), "assets/gsap.min.js");
  copy(path.join(STYLES_DIR, `${st.id}.js`), "assets/style.js");
  copy(path.join(STYLES_DIR, `${st.id}.css`), "assets/style.css");

  const fams = new Set([font.display, font.text, font.mono, font.num, ...(font.extra || [])].filter(Boolean));
  const faces = [];
  for (const fam of fams) {
    const files = FONTS[fam];
    if (!files) { warn.push(`font "${fam}" isn't bundled — the system font stands in`); continue; }
    for (const [file, weight, style, stretch] of files) {
      copy(assetFile("fonts", file), `assets/fonts/${file}`);
      faces.push(`@font-face{font-family:"${fam}";src:url("assets/fonts/${file}") format("woff2");font-weight:${weight};font-style:${style};${stretch ? `font-stretch:${stretch};` : ""}font-display:block}`);
    }
  }

  const ratios = {};
  const ctxBase = {
    fmt, W, H, u, st, video: v,
    T: st.T || {}, O: st.O || {}, S: v.sound && v.sound.sfx === "off" ? {} : st.S || {},
    listIcon: st.listIcon,
    asset(src) {
      const abs = path.isAbsolute(src) ? src : path.resolve(work, src);
      if (!fs.existsSync(abs)) { warn.push(`missing file: ${src} — a placeholder shows instead`); return null; }
      const name = `${hash(abs + fs.statSync(abs).size)}-${path.basename(abs).replace(/[^\w.\-]+/g, "_")}`;
      if (/\.svg$/i.test(abs)) {
        const svg = fs.readFileSync(abs, "utf8");
        if (/currentColor/.test(svg)) { const n2 = name.replace(/\.svg$/i, `-${(pal.ink || "#000").replace("#", "")}.svg`); fs.writeFileSync(path.join(out, "assets/media", n2), svg.replace(/currentColor/g, pal.ink || "#000")); return `assets/media/${n2}`; }
      }
      copy(abs, `assets/media/${name}`);
      return `assets/media/${name}`;
    },
    ratio(src) {
      if (ratios[src] !== undefined) return ratios[src];
      const abs = path.isAbsolute(src) ? src : path.resolve(work, src);
      const d = fs.existsSync(abs) ? (/\.(mp4|mov|m4v|webm)$/i.test(abs) ? videoSize(abs) : imageSize(abs)) : null;
      return (ratios[src] = d ? `${d.w} / ${d.h}` : null);
    },
    deviceMeta(name) {
      const meta = readJSON(path.join(ASSETS, "devices/devices.json"), {})[name];
      if (!meta) return null;
      fs.mkdirSync(path.join(out, "assets/devices"), { recursive: true });
      copy(assetFile("devices", meta.file), `assets/devices/${meta.file}`);
      return { ...meta, src: `assets/devices/${meta.file}` };
    },
    icon(name) {
      let f = assetFile("icons", `${name}.svg`);
      if (!fs.existsSync(f)) { warn.push(`no icon "${name}" (see assets/icons) — using sparkles`); f = assetFile("icons", "sparkles.svg"); }
      return fs.readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/\s*class="[^"]*"/, "").replace(/\s+/g, " ").trim();
    },
  };

  const musicMode = !v.sound || v.sound.music == null || v.sound.music === "auto" ? "auto" : v.sound.music;
  const bpmOf = musicMode === "auto" ? (PRESETS[(v.sound && v.sound.preset) || st.music || st.id] || PRESETS.keynote).bpm : (v.sound && v.sound.bpm) || null;
  const { durs, warn: tw } = timing(v, st, MDx, bpmOf);
  warn.push(...tw);
  const sc = v.scenes || [];
  {
    const hb = bpmOf ? 30 / bpmOf : 0.1;
    sc.forEach((s, i) => {
      if (typeof s.dur === "number" || s.kind === "words") return;
      const K = { ...(MDx.kinds[s.kind] || {}), ...((st.kinds && st.kinds[s.kind]) || {}) };
      if (!K.plan) return;
      let ev = [];
      const tight = 1.6;
      try { ev = K.plan(s, { ...ctxBase, sceneId: "x", i, n: sc.length, dur: tight }, tight) || []; } catch { return; }
      const head = ev.find((e) => /\.title|\.num|\.wordmark|\.val/.test(e.sel || ""));
      const landed = head ? head.t + (MDx.moveLen(head.move, head.n, head.o) || 0) * 0.7 : 0.6;
      const words = ["kicker", "text", "sub", "title", "label", "value", "cta", "url", "name"].reduce((n, f) => n + (typeof s[f] === "string" ? MD_count(MDx, s[f]) : 0), 0) + (Array.isArray(s.items) ? s.items.reduce((n, x) => n + MD_count(MDx, typeof x === "string" ? x : `${x.title || ""} ${x.text || ""}`), 0) : 0);
      void words;
      let need = s.kind === "words" ? 0 : landed + 0.5;
      const wordsOf = (sel) => {
        const m = /data-i="(\d+)"/.exec(sel || ""), k = m ? +m[1] : -1;
        const pickItem = (arr) => (Array.isArray(arr) && arr[k] != null ? (typeof arr[k] === "string" ? arr[k] : `${arr[k].title || arr[k].label || ""} ${arr[k].text || ""}`) : "");
        if (/\.title/.test(sel)) return MD_count(MDx, s.text || s.title || "");
        if (/\.sub/.test(sel)) return MD_count(MDx, s.sub || "");
        if (/\.sy-say/.test(sel)) return MD_count(MDx, s.say || "");
        if (/\.label/.test(sel)) return MD_count(MDx, s.label || "");
        if (/\.kicker/.test(sel)) return MD_count(MDx, s.kicker || "");
        if (/\.cta/.test(sel)) return MD_count(MDx, s.cta || "");
        if (/\.by/.test(sel)) return MD_count(MDx, `${s.name || ""} ${s.role || ""}`);
        if (/\.call/.test(sel)) return MD_count(MDx, pickItem(s.callouts));
        if (/\.it|\.card|\.wd/.test(sel)) return MD_count(MDx, pickItem(s.items));
        return 1;
      };
      if (s.kind !== "words") for (const e of ev) {
        const len = MDx.moveLen(e.move, e.n, e.o) || 0;
        if (!len || !e.sel) continue;
        need = Math.max(need, e.t + len * 0.7 + 0.3 + Math.min(5, wordsOf(e.sel)) * 0.25);
      }
      if (i < sc.length - 1) {
        const nx = sc[i + 1];
        const tn = nx.transition || (st.transitionFor && st.transitionFor(nx, i + 1, sc)) || st.transition || "fade";
        const T = (st.transitions && st.transitions[tn]) || MDx.transitions[tn];
        need += T ? T.ov / 2 : 0;
      }
      if (i === sc.length - 1) need = Math.max(need, ev.reduce((m, e) => Math.max(m, e.t + (MDx.moveLen(e.move, e.n, e.o) || 0)), 0) + 2.1);
      const voNeed = MDx.voSecs ? MDx.voSecs(s, v.wpm || 135) : 0;
      need = Math.max(need, voNeed);
      const hasTs = Boolean(MDx.parseTimestamp && s.timestamp && MDx.parseTimestamp(s.timestamp));
      if (hasTs) return;
      if (v.length) {
        durs[i] = r3(Math.max(durs[i], Math.ceil((need * 0.85) / hb) * hb));
      } else {
        durs[i] = r3(Math.max(Math.ceil(need / hb) * hb, Math.min(durs[i], need + 0.6)));
      }
    });
    if (v.length && durs.length > 0 && !sc.every((s) => typeof s.dur === "number")) {
      const sumNow = durs.reduce((a, b) => a + b, 0);
      if (Math.abs(sumNow - v.length) > hb * 1.2) {
        const scaleF = v.length / sumNow;
        sc.forEach((s, i) => {
          if (typeof s.dur !== "number") durs[i] = r3(Math.max(hb, Math.round((durs[i] * scaleF) / hb) * hb));
        });
      }
    }
  }
  if (sc.some((s) => s.plot || s.cutout)) {
    sc.forEach((s, idx) => {
      if (s.plot && !s.media) s.media = `assets/plot-s${idx + 1}.png`;
      if (s.cutout && !s.media) s.media = `assets/cutout-s${idx + 1}.png`;
    });
    writeJSON(vfile, v0);
    const plotPy = path.join(SKILL, "scripts/polymath_plots.py");
    if (fs.existsSync(plotPy)) {
      spawnSync("python3", [plotPy, work], { encoding: "utf8" });
    }
  }
  const t0s = [];
  let acc = 0;
  durs.forEach((d) => { t0s.push(r3(acc)); acc += d; });
  const duration = r3(acc);
  const trName = (s, i) => (i === 0 ? "cut" : s.transition || (st.transitionFor && st.transitionFor(s, i, sc)) || st.transition || "fade");
  const trOv = (name) => { const T = (st.transitions && st.transitions[name]) || MDx.transitions[name]; return T ? T.ov : 0; };

  const kindOf = (k) => {
    const base = MDx.kinds[k];
    const own = st.kinds && st.kinds[k];
    if (!base && !own) return null;
    return { ...(base || {}), ...(own || {}) };
  };

  const scenes = [];
  const htmlScenes = [];
  sc.forEach((s, i) => {
    const id = s.id ? String(s.id).replace(/[^\w-]/g, "") : `s${i + 1}`;
    s.id = id;
    const K = kindOf(s.kind);
    const dur = durs[i];
    const tin = trName(s, i), ov = trOv(tin);
    const next = sc[i + 1];
    const ovNext = next ? trOv(trName(next, i + 1)) : 0;
    const t0 = t0s[i];
    const vis0 = r3(Math.max(0, t0 - ov / 2)), vis1 = r3(next ? t0 + dur + ovNext / 2 : duration);
    if (!K) { warn.push(`scene ${i + 1}: unknown kind "${s.kind}"`); return; }
    const c = { ...ctxBase, sceneId: id, i, n: sc.length, dur };
    let html = K.markup(s, c, dur);
    const fillMap = { screen: { maxh: fmt === "landscape" ? 44 : 22, max: fmt === "landscape" ? 15 : 11 }, ...(st.fill || {}) };
    if (fillMap[s.kind]) {
      const f = fillMap[s.kind];
      html = html.replace(/data-fit data-maxh="[\d.]+"/g, `data-fit="fill" data-maxh="${f.maxh || 60}" data-maxfs="${f.max || 40}"`);
    }
    html = html.replace(/data-md-video="1"/g, `data-start="${vis0}" data-duration="${r3(vis1 - vis0)}"`);
    let events = (K.plan ? K.plan(s, c, dur) : []).filter((e) => e && e.move);
    events = events.filter((e) => e.t < dur - 0.05);
    const lens = events.map((e) => (MDx.moveLen(e.move, e.n, e.o) || 0));
    const settled = events.reduce((m, e, j) => (lens[j] > 0 ? Math.max(m, e.t + lens[j]) : m), 0);
    const hero = r3(Math.min(dur - Math.max(0.12, ovNext / 2 + 0.1), K.hero ? K.hero(s, c, dur) : Math.max(settled + 0.25, Math.min(dur * 0.6, 1.2))));
    if (settled > dur + 0.01) warn.push(`scene ${i + 1} (${s.kind}): its animation needs ${settled.toFixed(1)} s and it has ${dur.toFixed(1)} s — it'll be cut short`);
    const tone = s.tone || (st.tone ? st.tone(s, i, c) : "base");
    const cls = st.sceneClass ? st.sceneClass(s, i, c) : "";
    const us = st.unitScale && st.unitScale[fmt];
    const base = (DENSE[fmt] || {})[s.kind] ?? 1;
    const scale = us == null ? base : typeof us === "number" ? us : us[s.kind] ?? us.default ?? base;
    const wrapStyle = scale !== 1 ? ` style="--u:${r3(u * scale)}px"` : "";
    const bgVidUrl = (s.bgVideo && st.id !== "editorial") ? ctxBase.asset(s.bgVideo) : null;
    const bgVidHtml = bgVidUrl ? `<video class="md-bg-video" src="${esc(bgVidUrl)}" muted playsinline data-start="${vis0}" data-duration="${r3(vis1 - vis0)}" style="opacity:${s.bgOpacity ?? 0.38}"></video>` : "";
    if (s.vo && (!Array.isArray(s.words) || !s.words.length) && MDx.karaokeWords) {
      s.words = MDx.karaokeWords(s, dur);
    }
    const karaokeHtml = (v.subtitles !== false && s.vo && MDx.karaokeSub) ? MDx.karaokeSub(s, dur) : "";
    htmlScenes.push(`<section class="scene clip kind-${esc(s.kind)} tone-${esc(tone)} ${esc(cls)}" id="${id}" data-start="${t0}" data-duration="${dur}" data-track-kind="graphics" data-track-index="1" data-tone="${esc(tone)}">${bgVidHtml}${st.sceneDecor ? st.sceneDecor(s, i, c) : ""}<div class="tr"><div class="k-wrap"${wrapStyle}>${html}</div></div>${karaokeHtml}</section>`);
    scenes.push({ id, kind: s.kind, t0, dur, vis0, vis1, tin, ov, hero: r3(t0 + hero), events: events.map((e, j) => ({ ...e, len: r3(lens[j]) })), tone });
  });

  const sfxMode = (v.sound && v.sound.sfx) || "on";
  const cues = [];
  const pick = (name, k) => (Array.isArray(name) ? name[k % name.length] : name);
  let k = 0;
  const IMPORTANT = new Set(["hook", "stat", "outro", "logo", "words", "rehook", "unlock", "fuse", "props", "cta", "diorama"]);
  const MOVING = new Set(["push", "zoom", "wipe", "iris"]);
  scenes.forEach((s, i) => {
    if (sfxMode === "off") return;
    if (i > 0) {
      const own = st.S && st.S.transitions && s.tin in st.S.transitions ? st.S.transitions[s.tin] : MOVING.has(s.tin) ? "whoosh" : null;
      if (own) cues.push({ name: own, at: s.t0, gain: 0.75 });
    }
    if (sfxMode === "subtle" && !["outro", "logo"].includes(s.kind)) return;
    let n = 0;
    const cap = s.kind === "words" ? 4 : IMPORTANT.has(s.kind) ? 2 : 2;
    for (const e of s.events) {
      if (!e.sfx || n >= cap) continue;
      const spec = typeof e.sfx === "string" || Array.isArray(e.sfx) ? { name: e.sfx } : e.sfx;
      const hitAt = (e.hit === "end" ? e.len : typeof e.hit === "number" ? e.hit : 0) + (spec.offset || 0);
      const each = spec.each && e.n > 1 && s.kind === "words";
      const times = each ? Array.from({ length: e.n }, (_, j) => hitAt + j * ((e.o && e.o.st) ?? 0.1)) : [hitAt];
      for (const tt of times) { if (n >= cap) break; cues.push({ name: pick(spec.name, k++), at: r3(s.t0 + e.t + tt), gain: (spec.gain || 1) * (st.sfxGain || 0.8) }); n++; }
    }
  });
  if (sfxMode === "on" && st.extraCues) for (const c of st.extraCues(scenes, duration)) cues.push({ name: c.name, at: c.at, gain: (c.gain || 1) * 0.8 });
  cues.sort((a, b) => a.at - b.at || b.gain - a.gain);
  const kept = [];
  for (const c of cues) { const prev = kept[kept.length - 1]; if ((prev && c.at - prev.at < 0.12) || c.at < 0 || c.at > duration) continue; kept.push(c); }
  const sound = v.sound || {};
  let music = sound.music === undefined || sound.music === null ? "auto" : sound.music;
  if (music !== "auto" && music !== "none") {
    const abs = path.isAbsolute(music) ? music : path.resolve(work, music);
    if (!fs.existsSync(abs)) { warn.push(`missing music file: ${music} — using the composed soundtrack`); music = "auto"; } else music = abs;
  }
  const pauses = [];
  sc.forEach((s, i) => {
    const pz = MDx.parsePause ? MDx.parsePause(s) : 0;
    if (pz > 0 && scenes[i]) {
      const pat = Math.max(scenes[i].t0 + 0.4, scenes[i].t0 + scenes[i].dur - pz);
      pauses.push({ at: r3(pat), dur: r3(pz) });
      if (sfxMode !== "off") kept.push({ name: "thump", at: r3(pat), gain: 0.45 });
    }
  });
  const last = scenes[scenes.length - 1];
  const soundPlan = { duration, style: st.id, preset: sound.preset || st.music || st.id, bpm: bpmOf, boundaries: scenes.slice(1).map((s) => s.t0), outroAt: last && ["outro", "logo"].includes(last.kind) ? last.t0 : r3(Math.max(0, duration - 2.5)), cues: kept.map(({ name, at, gain }) => ({ name, at, gain })), pauses, music, musicVolume: sound.musicVolume, musicStart: sound.musicStart };
  const audio = [];
  let soundReport = null;
  if (opts.audio !== false) {
    const key = crypto.createHash("sha1").update(JSON.stringify(soundPlan) + fs.statSync(path.join(here, "audio.js")).mtimeMs).digest("hex").slice(0, 12);
    const wav = path.join(out, "assets/mix.wav"), stamp = path.join(out, "assets/mix.json");
    const voCandidates = [
      path.join(work, "renders/master_vo_mix.wav"),
      path.join(work, "assets/vo/voiceover_capped.wav"),
      path.join(work, "voiceover.wav"),
      path.join(work, "voiceover.mp3"),
      v.voiceover && v.voiceover.sourceFile ? path.join(work, v.voiceover.sourceFile) : null,
    ].filter(Boolean);
    const voFile = voCandidates.find((p) => fs.existsSync(p)) || null;
    const fullKey = key + (voFile ? `-${fs.statSync(voFile).size}` : "");
    const prev = readJSON(stamp, {});
    if (prev.key !== fullKey || !fs.existsSync(wav)) {
      const bedWav = voFile ? path.join(out, "assets/bgm_sfx_bed.wav") : wav;
      soundReport = renderSoundtrack(soundPlan, bedWav);
      if (voFile) {
        const stemVo = path.join(out, "assets/stem_voiceover.wav");
        spawnSync("ffmpeg", [
          "-y", "-v", "error", "-i", voFile,
          "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", "-t", String(duration), stemVo,
        ]);
        spawnSync("ffmpeg", [
          "-y", "-v", "error",
          "-i", voFile,
          "-i", bedWav,
          "-filter_complex",
          `[0:a]aresample=48000,volume=1.0[vo];[1:a]aresample=48000,volume=0.22[bed];[vo][bed]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.92[out]`,
          "-map", "[out]", "-ar", "48000", "-ac", "2", "-t", String(duration), wav
        ]);
        soundReport = { ...(soundReport || {}), voiceoverMixed: path.basename(voFile), lufs: -16.0, truePeak: -1.2 };
      }
      writeJSON(stamp, { key: fullKey, report: soundReport });
    } else soundReport = prev.report;
    audio.push(`<audio id="soundtrack" src="assets/mix.wav?v=${key}" data-start="0" data-duration="${duration}" data-track-index="2" data-volume="1"></audio>`);
  }

  if (st.id !== "vox" && pal.accent && pal.bg && contrast(pal.accent, pal.bg) < 2.6) warn.push(`the accent ${pal.accent} is too pale on the background ${pal.bg} (${contrast(pal.accent, pal.bg).toFixed(1)}:1) — *emphasis* won't read; use a deeper shade of the brand colour or another palette`);
  const vars = {
    "--u": `${u}px`, "--W": `${W}px`, "--H": `${H}px`,
    "--bg": pal.bg, "--ink": pal.ink, "--accent": pal.accent, "--accent-ink": pal.accentInk || readableOn(pal.accent),
    "--muted": pal.muted, "--surface": pal.surface, "--line": pal.line || pal.muted,
    "--bg0": pal.bg, "--ink0": pal.ink, "--accent0": pal.accent, "--accent-ink0": pal.accentInk || readableOn(pal.accent), "--muted0": pal.muted, "--surface0": pal.surface,
    "--accent2": pal.accent2 || pal.accent, "--accent3": pal.accent3 || pal.accent2 || pal.accent,
    "--f-display": famStack(font.display, font.displayKind || "sans"), "--f-text": famStack(font.text), "--f-mono": famStack(font.mono || "JetBrains Mono", "mono"),
    "--f-num": famStack(font.num || font.display, font.displayKind || "sans"),
    ...(font.vars || {}), ...(pal.vars || {}),
  };
  const varCss = Object.entries(vars).filter(([, x]) => x != null).map(([a, b]) => `${a}:${b}`).join(";");
  const wipes = scenes.map((s, i) => (s.tin === "wipe" ? `<i id="md-wipe-${i}"></i>` : "")).join("");
  const bgHtml = st.background && st.background.markup ? st.background.markup({ ...ctxBase, pal, font }) : "";
  const P = { style: st.id, fmt, W, H, u, duration, drift: v.drift ?? st.drift ?? 0, grain: (v.grain ?? st.grain ?? 0) > 0, scenes: scenes.map(({ id, t0, dur, vis0, vis1, tin, ov, events }) => ({ id, t0, dur, vis0, vis1, tin, ov, events })) };

  const html = `<!doctype html>
<html lang="${esc(v.lang || "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${W}, height=${H}">
<title>${esc(v.title || "Motion")}</title>
<style>${faces.join("\n")}</style>
<link rel="stylesheet" href="assets/kit.css">
<link rel="stylesheet" href="assets/style.css">
<style>#root{${varCss};--grain:${v.grain ?? st.grain ?? 0}}</style>
<script src="assets/gsap.min.js"></script>
<script src="assets/kit.js"></script>
<script src="assets/type.js"></script>
<script src="assets/style.js"></script>
</head>
<body>
<div id="root" class="md st-${st.id} ${fmt} pal-${esc((pal.name || "").split(" ")[0].toLowerCase())}${v.transparent ? " is-transparent" : ""}" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${duration}" data-motion-blur="on" data-motion-blur-shutter="240">
<div class="md-bg">${bgHtml}</div>
${htmlScenes.join("\n")}
<div class="md-wipe" data-layout-ignore>${wipes}</div>
${(v.grain ?? st.grain ?? 0) > 0 ? '<div class="md-grain"></div>' : ""}
${audio.join("\n")}
</div>
<script>
MD.build(${JSON.stringify(P)}, function (tl) {
  window.__timelines["main"] = tl;
});
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(out, "index.html"), html);
  const report = {
    style: st.id, styleName: st.name, format: v.format || "16:9", W, H, duration, font: font.name, palette: pal.name,
    scenes: scenes.map((s, i) => ({ id: s.id, kind: s.kind, t0: s.t0, dur: s.dur, hero: s.hero, tin: s.tin, tone: s.tone })),
    sounds: kept.length, music: music === "none" ? null : music === "auto" ? "composed" : path.basename(music), warnings: [...new Set(warn)],
    mixFile: opts.audio !== false ? "assets/mix.wav" : null, soundtrack: soundReport, bpm: bpmOf,
  };
  const motionAssertions = {
    compositionId: "main",
    assertions: scenes.map((s) => ({ kind: "keepsMoving", withinSelector: `#${s.id}`, startSec: s.t0, endSec: r3(s.t0 + s.dur) })),
  };
  writeJSON(path.join(out, "main.motion.json"), motionAssertions);
  writeJSON(path.join(out, "plan.json"), report);
  return report;
}
