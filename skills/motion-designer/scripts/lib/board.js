// board: builds a 100% self-contained interactive Storyboard HTML for Gemini Canvas (and also supports --serve on localhost).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compose, readJSON, writeJSON, styleList, loadMD, FORMATS, ASSETS, FONTS, RUNTIME, STYLES_DIR } from "./compose.js";
import { PRESETS } from "./audio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(here, "../board/page.html");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif", ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/mp4", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4" };

const TOP = ["style", "format", "length", "font", "palette", "direction"];
const fieldsOf = (st, kinds, kind) => ((st.kinds && st.kinds[kind] && st.kinds[kind].fields) || (kinds[kind] && kinds[kind].fields) || []);
const EDITABLE = (v) => typeof v === "string" || typeof v === "number" || (Array.isArray(v) && v.every((x) => typeof x === "string" || typeof x === "number"));

function applyPatch(v, p) {
  const MD = loadMD();
  const st = MD.styles[v.style] || {};
  for (const k of ["font", "palette"]) {
    if (!(k in p)) continue;
    if (v[k] && typeof v[k] === "object") v[`brand_${k}`] = v[k];
    if (p[k] === "brand") { if (v[`brand_${k}`]) p[k] = v[`brand_${k}`]; else delete p[k]; }
  }
  for (const k of TOP) if (k in p) v[k] = p[k];
  if (p.brandColor !== undefined) v.brand = { ...(v.brand || {}), color: p.brandColor || null };
  if (p.sfx !== undefined) v.sound = { ...(v.sound || {}), sfx: p.sfx };
  if (Array.isArray(p.scenes)) {
    for (const ps of p.scenes) {
      const s = (v.scenes || []).find((x) => String(x.id) === String(ps.id));
      if (!s) continue;
      if (typeof ps.ask === "string") s.ask = ps.ask;
      for (const k of fieldsOf(st, MD.kinds, s.kind)) {
        if (!(k in ps) || k === "ask") continue;
        const val = ps[k];
        if (k === "items" && s.kind === "features" && Array.isArray(val)) s.items = val.map((t, i) => ({ ...((s.items || [])[i] || {}), title: String(t) }));
        else if (Array.isArray(val)) { const old = s[k]; s[k] = val.map((x) => (Array.isArray(old) && typeof old[0] === "number" && !isNaN(+x) ? +x : String(x))); }
        else if (typeof val === "string") s[k] = val;
      }
      if (typeof ps.remove === "boolean") s.off = ps.remove;
    }
  }
  if (Array.isArray(p.order)) {
    const by = new Map((v.scenes || []).map((s) => [String(s.id), s]));
    const next = p.order.map((id) => by.get(String(id))).filter(Boolean);
    if (next.length === (v.scenes || []).length) v.scenes = next;
  }
}

function view(work, v, report) {
  const MD = loadMD();
  const st = MD.styles[v.style] || {};
  const kinds = MD.kinds;
  return {
    title: v.title, brief: v.brief || "", purpose: v.purpose || "", direction: v.direction || "",
    style: v.style, format: v.format || "16:9", length: v.length || null,
    font: typeof v.font === "object" ? "brand" : v.font ?? 0, palette: typeof v.palette === "object" ? "brand" : v.palette ?? 0,
    brandFont: typeof v.font === "object" ? v.font : v.brand_font || null, brandPalette: typeof v.palette === "object" ? v.palette : v.brand_palette || null,
    brandColor: (v.brand && v.brand.color) || "", sfx: (v.sound && v.sound.sfx) || "on",
    why: v.why || {}, alternates: (v.choices || v.alternates || []).filter((x) => MD.styles[x] && x !== v.style),
    approved: !!v.approved,
    report,
    W: FORMATS[v.format || "16:9"].W, H: FORMATS[v.format || "16:9"].H,
    styles: styleList().map((s) => ({ id: s.id, name: s.name, tagline: s.tagline, bestFor: s.bestFor, fonts: s.fonts.map((f) => ({ name: f.name, display: f.display, vars: f.vars || {} })), palettes: s.palettes.map((p) => ({ name: p.name, bg: p.bg, ink: p.ink, accent: p.accent })) })),
    fontFaces: Object.entries(FONTS).map(([fam, files]) => files.map(([file, weight, style, stretch]) => ({ fam, file, weight, style, stretch }))).flat(),
    scenes: (v.scenes || []).map((s, i) => ({
      id: s.id, kind: s.kind, label: (st.kinds && st.kinds[s.kind] && st.kinds[s.kind].label) || null,
      fields: fieldsOf(st, kinds, s.kind).filter((f) => f === "items" ? Array.isArray(s.items) || s.items == null : EDITABLE(s[f]) || (s[f] == null && ["text", "title"].includes(f))),
      values: Object.fromEntries(fieldsOf(st, kinds, s.kind).filter((f) => f !== "items" && EDITABLE(s[f]) && !["media", "html"].includes(f)).map((f) => [f, s[f]])),
      items: Array.isArray(s.items) ? s.items.map((x) => (typeof x === "string" ? x : x.title || x.label || "")) : undefined,
      media: s.media ? [].concat(s.media) : [], plan: s.plan || "", why: s.why || "", ask: s.ask || "",
      at: report.scenes[i] || null,
    })),
  };
}

function toDataUri(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase();
  const mime = TYPES[ext] ? TYPES[ext].split(";")[0] : "application/octet-stream";
  const b64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${b64}`;
}

export async function buildStandaloneBoard(work, { out = null } = {}) {
  const vfile = path.join(work, "video.json");
  let v = readJSON(vfile);
  (v.scenes || []).forEach((s, i) => { if (!s.id) s.id = `s${i + 1}`; });
  if (!Array.isArray(v.choices)) v.choices = [...new Set([v.style, ...(v.alternates || [])])];
  v.approved = true;
  v.approvedAt = v.approvedAt || new Date().toISOString();
  writeJSON(vfile, v);

  const report = compose(work);

  // Compress mix.wav to compact AAC m4a data URI for Canvas audio playback
  let mixDataUri = null;
  const wavPath = path.join(work, "build/assets/mix.wav");
  if (fs.existsSync(wavPath)) {
    const tmpM4a = path.join(os.tmpdir(), `md-mix-${process.pid}.m4a`);
    const ff = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", wavPath, "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", tmpM4a]);
    if (ff.status === 0 && fs.existsSync(tmpM4a)) {
      mixDataUri = `data:audio/mp4;base64,${fs.readFileSync(tmpM4a).toString("base64")}`;
      fs.rmSync(tmpM4a, { force: true });
    }
  }

  // Collect runtime & style files
  const runtime = {
    gsap: fs.readFileSync(path.join(ASSETS, "vendor/gsap.min.js"), "utf8"),
    kitJs: fs.readFileSync(path.join(RUNTIME, "kit.js"), "utf8"),
    kitCss: fs.readFileSync(path.join(RUNTIME, "kit.css"), "utf8"),
    typeJs: fs.readFileSync(path.join(RUNTIME, "type.js"), "utf8"),
  };
  const stylesBundle = {};
  for (const st of styleList()) {
    stylesBundle[st.id] = {
      js: fs.readFileSync(path.join(STYLES_DIR, `${st.id}.js`), "utf8"),
      css: fs.readFileSync(path.join(STYLES_DIR, `${st.id}.css`), "utf8"),
    };
  }

  // Collect icons
  const icons = {};
  const iconsDir = path.join(ASSETS, "icons");
  for (const f of fs.readdirSync(iconsDir)) {
    if (!f.endsWith(".svg")) continue;
    const name = f.slice(0, -4);
    icons[name] = fs.readFileSync(path.join(iconsDir, f), "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/\s*class="[^"]*"/, "").replace(/\s+/g, " ").trim();
  }

  // Collect hardware devices
  const devJson = readJSON(path.join(ASSETS, "devices/devices.json"), {});
  const devices = {};
  for (const [k, meta] of Object.entries(devJson)) {
    devices[k] = { ...meta, src: toDataUri(path.join(ASSETS, "devices", meta.file)) };
  }

  // Collect project media assets referenced in video.json
  const mediaMap = {};
  const addMedia = (src) => {
    if (!src || typeof src !== "string" || mediaMap[src]) return;
    const abs = path.isAbsolute(src) ? src : path.resolve(work, src);
    if (!fs.existsSync(abs)) return;
    mediaMap[src] = {
      dataUri: toDataUri(abs),
      svgText: /\.svg$/i.test(abs) ? fs.readFileSync(abs, "utf8") : null,
    };
  };
  if (v.brand && v.brand.logo) addMedia(v.brand.logo);
  for (const s of v.scenes || []) {
    if (s.media) [].concat(s.media).forEach(addMedia);
  }

  // Embed fonts used by chosen style + alternates so they work offline & in Canvas
  const MD = loadMD();
  const activeStyleIds = new Set([v.style, ...(v.choices || v.alternates || [])]);
  const fontFams = new Set(["Inter", "JetBrains Mono"]);
  for (const sid of activeStyleIds) {
    const st = MD.styles[sid];
    if (!st) continue;
    for (const f of st.fonts || []) {
      if (f.display) fontFams.add(f.display);
      if (f.text) fontFams.add(f.text);
      if (f.mono) fontFams.add(f.mono);
    }
  }
  const fontFacesCss = [];
  for (const fam of fontFams) {
    const files = FONTS[fam];
    if (!files) continue;
    for (const [file, weight, style, stretch] of files) {
      const uri = toDataUri(path.join(ASSETS, "fonts", file));
      if (uri) {
        fontFacesCss.push(`@font-face{font-family:"${fam}";src:url("${uri}") format("woff2");font-weight:${weight};font-style:${style};${stretch ? `font-stretch:${stretch};` : ""}font-display:block}`);
      }
    }
  }

  const presetBpms = Object.fromEntries(Object.entries(PRESETS).map(([k, p]) => [k, p.bpm]));
  const bundlePayload = {
    video: v,
    initialState: view(work, v, report),
    runtime,
    styles: stylesBundle,
    icons,
    devices,
    media: mediaMap,
    fontFacesCss: fontFacesCss.join("\n"),
    mixDataUri,
    presetBpms,
  };

  // Escape </script> inside JSON payload
  const safeJson = JSON.stringify(bundlePayload).replace(/<\/script/gi, "<\\/script");
  const pageTemplate = fs.readFileSync(PAGE, "utf8");
  const html = pageTemplate.replace("<!--__MD_STANDALONE_BUNDLE__-->", () => `<script>window.__MD_STANDALONE = ${safeJson};</script>`);

  const slug = (v.title || "video").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
  const boardFile = out ? path.resolve(out) : path.join(work, "storyboard.html");
  fs.writeFileSync(boardFile, html);

  let canvasFile = null;
  for (const base of [process.cwd(), work]) {
    const m = base.match(/^(\/working_dir\/[^/]+)/);
    if (m) {
      const outDir = path.join(m[1], "artifacts/file_generation/ttl=63d/output");
      fs.mkdirSync(outDir, { recursive: true });
      canvasFile = path.join(outDir, `${slug}-storyboard.html`);
      fs.copyFileSync(boardFile, canvasFile);
      break;
    }
  }
  return { boardFile, canvasFile };
}

export async function serveBoard(work, { open = false, port = 0 } = {}) {
  const vfile = path.join(work, "video.json");
  let v = readJSON(vfile);
  (v.scenes || []).forEach((s, i) => { if (!s.id) s.id = `s${i + 1}`; });
  if (!Array.isArray(v.choices)) v.choices = [...new Set([v.style, ...(v.alternates || [])])];
  writeJSON(vfile, v);
  const orig = JSON.parse(JSON.stringify(v));
  const warn = [];
  let report = compose(work);
  const alts = () => {
    for (const id of (v.choices || v.alternates || []).filter((x) => x !== v.style)) {
      try { compose(work, { video: { ...v, style: id, font: typeof v.font === "object" ? v.font : 0, palette: typeof v.palette === "object" ? v.palette : 0, brand: { ...(v.brand || {}) } }, out: path.join(work, ".alts", id), audio: false }); } catch (e) { warn.push(`${id}: ${e.message}`); }
    }
  };
  alts();

  let finish;
  const done = new Promise((r) => (finish = r));

  const send = (res, code, body, type = "application/json") => {
    res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
    res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
  };
  const file = (res, f, req) => {
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return send(res, 404, "not found", "text/plain");
    const type = TYPES[path.extname(f).toLowerCase()] || "application/octet-stream";
    const size = fs.statSync(f).size;
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range) {
      const a = range[1] ? +range[1] : 0, b = range[2] ? +range[2] : size - 1;
      res.writeHead(206, { "content-type": type, "content-range": `bytes ${a}-${b}/${size}`, "accept-ranges": "bytes", "content-length": b - a + 1, "cache-control": "no-store" });
      return fs.createReadStream(f, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, { "content-type": type, "content-length": size, "accept-ranges": "bytes", "cache-control": "no-store" });
    fs.createReadStream(f).pipe(res);
  };
  const inside = (root, rel) => { const f = path.resolve(root, rel); return f.startsWith(path.resolve(root) + path.sep) ? f : null; };
  const body = (req) => new Promise((r) => { let b = ""; req.on("data", (d) => (b += d)); req.on("end", () => { try { r(JSON.parse(b || "{}")); } catch { r({}); } }); });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    const p = decodeURIComponent(url.pathname);
    try {
      if (p === "/" || p === "/index.html") return file(res, PAGE, req);
      if (p === "/api/state") return send(res, 200, view(work, v, report));
      if (p === "/api/patch" && req.method === "POST") {
        const patch = await body(req);
        applyPatch(v, patch);
        writeJSON(vfile, v);
        report = compose(work);
        if (patch.style !== undefined || patch.scenes || patch.format !== undefined || patch.length !== undefined || patch.brandColor !== undefined) alts();
        return send(res, 200, view(work, v, report));
      }
      if (p === "/api/approve" && req.method === "POST") {
        const b = await body(req);
        if (typeof b.direction === "string") v.direction = b.direction;
        v.approved = true;
        v.approvedAt = new Date().toISOString();
        writeJSON(vfile, v);
        send(res, 200, { ok: true });
        setTimeout(() => finish(0), 300);
        return;
      }
      if (p.startsWith("/build/")) { const f = inside(path.join(work, "build"), p.slice(7)); return f ? file(res, f, req) : send(res, 403, "no"); }
      if (p.startsWith("/alts/")) { const f = inside(path.join(work, ".alts"), p.slice(6)); return f ? file(res, f, req) : send(res, 403, "no"); }
      if (p.startsWith("/fonts/")) { const f = inside(path.join(ASSETS, "fonts"), p.slice(7)); return f ? file(res, f, req) : send(res, 403, "no"); }
      if (p.startsWith("/media/")) { const f = inside(work, p.slice(7)); return f ? file(res, f, req) : send(res, 403, "no"); }
      return send(res, 404, "not found", "text/plain");
    } catch (e) {
      return send(res, 500, { error: e.message });
    }
  });

  await new Promise((r) => server.listen(port || 0, "127.0.0.1", r));
  const addr = `http://127.0.0.1:${server.address().port}/`;
  console.log(`Storyboard: ${addr}`);
  for (const w of report.warnings) console.log(`  ⚠ ${w}`);
  if (open) {
    const opener = process.platform === "darwin" ? ["open", [addr]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", addr]] : ["xdg-open", [addr]];
    try { spawn(opener[0], opener[1], { stdio: "ignore", detached: true }).unref(); } catch {}
  }
  const code = await done;
  server.close();
  const changes = [];
  for (const k of ["style", "format", "length", "font", "palette"]) if (JSON.stringify(orig[k]) !== JSON.stringify(v[k])) changes.push(`${k}: ${JSON.stringify(orig[k])} → ${JSON.stringify(v[k])}`);
  if (JSON.stringify((orig.brand || {}).color) !== JSON.stringify((v.brand || {}).color)) changes.push(`brand colour → ${(v.brand || {}).color || "none"}`);
  if (JSON.stringify((orig.sound || {}).sfx) !== JSON.stringify((v.sound || {}).sfx)) changes.push(`sound effects → ${(v.sound || {}).sfx}`);
  for (const s of v.scenes || []) {
    const o = (orig.scenes || []).find((x) => String(x.id) === String(s.id)) || {};
    for (const k of Object.keys(s)) if (!["ask", "off", "id"].includes(k) && JSON.stringify(o[k]) !== JSON.stringify(s[k])) changes.push(`scene ${s.id} ${k}: ${JSON.stringify(s[k]).slice(0, 120)}`);
    if (s.off && !o.off) changes.push(`scene ${s.id} removed`);
    if (!s.off && o.off) changes.push(`scene ${s.id} brought back`);
    if ((s.ask || "").trim() && (s.ask || "") !== (o.ask || "")) changes.push(`scene ${s.id} NOTE: ${s.ask.trim()}`);
  }
  if ((v.direction || "").trim() && v.direction !== orig.direction) changes.push(`NOTE for the whole video: ${v.direction.trim()}`);
  console.log(`Approved.${changes.length ? "\n" + changes.map((c) => "  - " + c).join("\n") : " No changes."}`);
  return code;
}
