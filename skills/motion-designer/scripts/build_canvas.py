import os, sys, tempfile
import json
import base64
import subprocess

SKILL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE_ROOT = os.path.join(tempfile.gettempdir(), "motion-designer-cache-v2")
WORK_DIR = sys.argv[1] if len(sys.argv) > 1 else "."
OUT_HTML = sys.argv[2] if len(sys.argv) > 2 else os.path.join(WORK_DIR, "storyboard-canvas.html")

# Ensure binary-assets.json is unpacked in CACHE_ROOT
bfile = os.path.join(SKILL_DIR, "assets/binary-assets.json")
if os.path.exists(bfile):
    try:
        with open(bfile, "r", encoding="utf-8") as bf:
            bmap = json.load(bf)
        for rel, b64 in bmap.items():
            dest = os.path.join(CACHE_ROOT, rel)
            if not os.path.exists(dest):
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, "wb") as df:
                    df.write(base64.b64decode(b64))
    except Exception:
        pass

def asset_path(rel):
    p_cache = os.path.join(CACHE_ROOT, rel)
    if os.path.exists(p_cache):
        return p_cache
    return os.path.join(SKILL_DIR, rel)

def b64_file(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")

def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

# Convert mix.wav to 128kbps mp3 for compact inline audio in Canvas
mix_wav = os.path.join(WORK_DIR, "build/assets/mix.wav")
mix_mp3 = os.path.join(WORK_DIR, "build/assets/mix.mp3")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mix_wav, "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", mix_mp3], check=True)
mix_data_uri = "data:audio/mpeg;base64," + b64_file(mix_mp3)

# Collect media assets as data URIs
media_uris = {}
for fn in os.listdir(os.path.join(WORK_DIR, "assets")):
    p = os.path.join(WORK_DIR, "assets", fn)
    if fn.endswith(".jpg"):
        media_uris[f"assets/{fn}"] = "data:image/jpeg;base64," + b64_file(p)
    elif fn.endswith(".png"):
        media_uris[f"assets/{fn}"] = "data:image/png;base64," + b64_file(p)
    elif fn.endswith(".svg"):
        media_uris[f"assets/{fn}"] = "data:image/svg+xml;base64," + b64_file(p)

# Collect device mockups as data URIs
devices_json = json.loads(read_text(os.path.join(SKILL_DIR, "assets/devices/devices.json")))
for k, meta in devices_json.items():
    webp_path = asset_path(os.path.join("assets/devices", meta["file"]))
    if os.path.exists(webp_path):
        meta["src"] = "data:image/webp;base64," + b64_file(webp_path)

# Collect icons SVG map
icons_map = {}
icons_dir = asset_path("assets/icons")
if os.path.exists(icons_dir):
    for fn in os.listdir(icons_dir):
        if fn.endswith(".svg"):
            icons_map[fn[:-4]] = read_text(os.path.join(icons_dir, fn)).strip()

font_face_rules = []
font_map_spec = {
    "Inter": [("Inter-Variable.woff2", "100 900", "normal", None)],
    "Inter Tight": [("InterTight-Variable.woff2", "100 900", "normal", None)],
    "JetBrains Mono": [("JetBrainsMono-Variable.woff2", "100 800", "normal", None)],
    "Space Grotesk": [("SpaceGrotesk-Variable.woff2", "300 700", "normal", None)],
    "Instrument Serif": [("InstrumentSerif-Regular.woff2", "400", "normal", None), ("InstrumentSerif-Italic.woff2", "400", "italic", None)],
    "Geist": [("Geist-Variable.woff2", "100 900", "normal", None)],
    "Syne": [("Syne-Variable.woff2", "400 800", "normal", None)],
}
for fam, entries in font_map_spec.items():
    for (fn, weight, style, stretch) in entries:
        fp = asset_path(os.path.join("assets/fonts", fn))
        if os.path.exists(fp):
            duri = "data:font/woff2;base64," + b64_file(fp)
            st_rule = f"font-stretch:{stretch};" if stretch else ""
            font_face_rules.append(f'@font-face{{font-family:"{fam}";src:url("{duri}") format("woff2");font-weight:{weight};font-style:{style};{st_rule}font-display:block}}')

fonts_css = "\n".join(font_face_rules)

# Read runtime and styles
gsap_js = read_text(os.path.join(SKILL_DIR, "assets/vendor/gsap.min.js"))
kit_js = read_text(os.path.join(SKILL_DIR, "scripts/runtime/kit.js"))
type_js = read_text(os.path.join(SKILL_DIR, "scripts/runtime/type.js"))
kit_css = read_text(os.path.join(SKILL_DIR, "scripts/runtime/kit.css"))

styles_js = {}
styles_css = {}
styles_dir = os.path.join(SKILL_DIR, "styles")
for fn in sorted(os.listdir(styles_dir)):
    if fn.endswith(".js"):
        styles_js[fn[:-3]] = read_text(os.path.join(styles_dir, fn))
    elif fn.endswith(".css"):
        css_txt = read_text(os.path.join(styles_dir, fn))
        # Strip external relative url("fonts/...") if any, since fonts_css provides them
        styles_css[fn[:-4]] = css_txt

video_json = json.loads(read_text(os.path.join(WORK_DIR, "video.json")))
plan_json = json.loads(read_text(os.path.join(WORK_DIR, "build/plan.json")))

# Patch kit_js so storyboardMode also activates when window.__SB_MODE is set
kit_js_patched = kit_js.replace(
    'if (/[?&]sb=1/.test(location.search)) storyboardMode(tl, P);',
    'if (window.__SB_MODE || /[?&]sb=1/.test(location.search)) storyboardMode(tl, P);'
).replace(
    'seek(+(new URLSearchParams(location.search).get("t") || 0));',
    'seek(window.__INITIAL_T != null ? +window.__INITIAL_T : +(new URLSearchParams(location.search).get("t") || 0));'
)

page_html = read_text(os.path.join(SKILL_DIR, "scripts/board/page.html"))

# Build the self-contained browser engine script that replaces network calls in page.html
bundle_payload = {
    "video": video_json,
    "initialReport": plan_json,
    "mixDataUri": mix_data_uri,
    "mediaUris": media_uris,
    "devices": devices_json,
    "icons": icons_map,
    "fontsCss": fonts_css,
    "kitCss": kit_css,
    "stylesCss": styles_css,
    "stylesJs": styles_js,
    "gsapJs": gsap_js,
    "kitJs": kit_js_patched,
    "typeJs": type_js,
}

payload_json = json.dumps(bundle_payload).replace("</script>", "<\\/script>")

shim_script = f"""<script>
window.__MD_BUNDLE = {payload_json};
</script>
<script>
(() => {{
  const B = window.__MD_BUNDLE;
  // Load kit.js and all styles into window.MD in the parent window so we can compose in-memory
  const runScript = (code) => {{ const s = document.createElement("script"); s.text = code; document.head.appendChild(s); }};
  runScript(B.kitJs);
  for (const [id, code] of Object.entries(B.stylesJs)) {{
    runScript(code);
    if (window.MD && window.MD.styles && window.MD.styles[id]) window.MD.styles[id].id = id;
  }}

  // Inject bundled fonts into parent document
  const fst = document.createElement("style");
  fst.textContent = B.fontsCss;
  document.head.appendChild(fst);

  const FORMATS = {{
    "16:9": {{ W: 1920, H: 1080, fmt: "landscape" }},
    "9:16": {{ W: 1080, H: 1920, fmt: "portrait" }},
    "1:1": {{ W: 1080, H: 1080, fmt: "square" }},
    "4:5": {{ W: 1080, H: 1350, fmt: "tall" }},
  }};
  const DENSE_K = {{ features: 1.3, compare: 1.3, list: 1.3, steps: 1.3, quote: 1.2, chart: 1.25, outro: 1.3, logo: 1.15, rank: 1.25, donut: 1.2, line: 1.15 }};
  const DENSE = {{
    landscape: DENSE_K,
    portrait: {{ ...DENSE_K, list: 1.25, steps: 1.25, features: 1.2, compare: 1.2, chart: 1.25, quote: 1.15, outro: 1.25 }},
    square: {{ ...DENSE_K, features: 1.1, compare: 1.15, list: 1.2, steps: 1.2, chart: 1.15 }},
    tall: {{ ...DENSE_K, features: 1.15, compare: 1.2, list: 1.25, steps: 1.25, chart: 1.2 }},
  }};
  const BPM_MAP = {{ kinetic: 118, keynote: 100, aura: 78, paper: 104, terminal: 112, data: 86, story: 96 }};
  const FALLBACK = {{ serif: "Georgia, serif", mono: "ui-monospace, Menlo, monospace", sans: "system-ui, sans-serif" }};
  const famStack = (f, kind = "sans") => `"${{f}}", ${{FALLBACK[kind] || FALLBACK.sans}}`;
  const r3 = (x) => Math.round(x * 1000) / 1000;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }})[c]);

  function lum(hex) {{
    const m = String(hex).replace("#", "").match(/^([\\da-f]{{2}})([\\da-f]{{2}})([\\da-f]{{2}})/i);
    if (!m) return 0.5;
    const c = m.slice(1).map((x) => {{ const v = parseInt(x, 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }});
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }}
  function contrast(a, b) {{ const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }}
  function readableOn(bg) {{ return contrast(bg, "#ffffff") >= contrast(bg, "#0b0b0b") ? "#ffffff" : "#0b0b0b"; }}

  function resolveLook(v, st) {{
    const fonts = st.fonts || [];
    let font = typeof v.font === "number" ? fonts[v.font] : fonts[0];
    if (v.font && typeof v.font === "object") font = {{ ...fonts[0], ...v.font, name: "Custom" }};
    font = font || fonts[0];
    const pals = st.palettes || [];
    let pal = typeof v.palette === "number" ? pals[v.palette] : pals[0];
    if (v.palette && typeof v.palette === "object") pal = {{ ...pals[0], ...v.palette, name: "Custom" }};
    pal = {{ ...(pal || pals[0]) }};
    const brand = v.brand || {{}};
    if (brand.color && !(v.palette && typeof v.palette === "object" && v.palette.accent)) {{
      pal.accent = brand.color;
      pal.accentInk = readableOn(brand.color);
      pal.name = (pal.name || "") + " + brand";
    }}
    return {{ font, pal }};
  }}

  function composeInBrowser(v, seekTime = 0) {{
    const MDx = window.MD;
    const sc = (v.scenes || []).filter((s) => !s.off);
    const st = MDx.styles[v.style] || MDx.styles.data;
    MDx._st = st;
    const F = FORMATS[v.format || "16:9"] || FORMATS["16:9"];
    const {{ W, H, fmt }} = F;
    const u = Math.min(W, H) / 100;
    const {{ font, pal }} = resolveLook(v, st);
    const bpm = BPM_MAP[st.id] || 86;
    const hb = 30 / bpm;

    const kindOf = (k) => {{
      const base = MDx.kinds[k];
      const own = st.kinds && st.kinds[k];
      if (!base && !own) return null;
      return {{ ...(base || {{}}), ...(own || {{}}) }};
    }};

    const mins = sc.map((s) => {{ const K = kindOf(s.kind); return K ? Math.max(1, (K.min || (() => 2))(s)) : 2; }});
    let durs = sc.map((s, i) => (typeof s.dur === "number" ? s.dur : r3(mins[i] + 0.2)));
    const total0 = durs.reduce((a, b) => a + b, 0);
    if (v.length && total0 > 0) {{
      const f = v.length / total0;
      durs = durs.map((d) => r3(d * f));
    }}
    durs = durs.map((d, i) => {{
      if (typeof sc[i].dur === "number") return r3(d);
      const q = Math.max(1, Math.round(d / hb));
      let qd = q * hb;
      if (qd < mins[i] * 0.9) qd = Math.ceil((mins[i] * 0.9) / hb) * hb;
      return r3(qd);
    }});

    const ctxBase = {{
      fmt, W, H, u, st, video: v,
      T: st.T || {{}}, O: st.O || {{}}, S: v.sound && v.sound.sfx === "off" ? {{}} : st.S || {{}},
      listIcon: st.listIcon,
      asset(src) {{ return B.mediaUris[src] || src; }},
      ratio() {{ return "1600 / 1000"; }},
      deviceMeta(name) {{ return B.devices[name] || null; }},
      icon(name) {{ return B.icons[name] || B.icons["sparkles"] || ""; }},
    }};

    const t0s = [];
    let acc = 0;
    durs.forEach((d) => {{ t0s.push(r3(acc)); acc += d; }});
    const duration = r3(acc);
    const trName = (s, i) => (i === 0 ? "cut" : s.transition || (st.transitionFor && st.transitionFor(s, i, sc)) || st.transition || "fade");
    const trOv = (name) => {{ const T = (st.transitions && st.transitions[name]) || MDx.transitions[name]; return T ? T.ov : 0; }};

    const scenes = [];
    const htmlScenes = [];
    sc.forEach((s, i) => {{
      const id = s.id || `s${{i + 1}}`;
      const K = kindOf(s.kind);
      const dur = durs[i];
      const tin = trName(s, i), ov = trOv(tin);
      const next = sc[i + 1];
      const ovNext = next ? trOv(trName(next, i + 1)) : 0;
      const t0 = t0s[i];
      const vis0 = r3(Math.max(0, t0 - ov / 2)), vis1 = r3(next ? t0 + dur + ovNext / 2 : duration);
      if (!K) return;
      const c = {{ ...ctxBase, sceneId: id, i, n: sc.length, dur }};
      let html = K.markup(s, c, dur);
      const fillMap = {{ screen: {{ maxh: fmt === "landscape" ? 44 : 22, max: fmt === "landscape" ? 15 : 11 }}, ...(st.fill || {{}}) }};
      if (fillMap[s.kind]) {{
        const f = fillMap[s.kind];
        html = html.replace(/data-fit data-maxh="[\\d.]+"/g, `data-fit="fill" data-maxh="${{f.maxh || 60}}" data-maxfs="${{f.max || 40}}"`);
      }}
      let events = (K.plan ? K.plan(s, c, dur) : []).filter((e) => e && e.move && e.t < dur - 0.05);
      const lens = events.map((e) => (MDx.moveLen(e.move, e.n, e.o) || 0));
      const settled = events.reduce((m, e, j) => (lens[j] > 0 ? Math.max(m, e.t + lens[j]) : m), 0);
      const hero = r3(Math.min(dur - Math.max(0.12, ovNext / 2 + 0.1), K.hero ? K.hero(s, c, dur) : Math.max(settled + 0.25, Math.min(dur * 0.6, 1.2))));
      const tone = s.tone || (st.tone ? st.tone(s, i, c) : "base");
      const cls = st.sceneClass ? st.sceneClass(s, i, c) : "";
      const us = st.unitScale && st.unitScale[fmt];
      const base = (DENSE[fmt] || {{}})[s.kind] ?? 1;
      const scale = us == null ? base : typeof us === "number" ? us : us[s.kind] ?? us.default ?? base;
      const wrapStyle = scale !== 1 ? ` style="--u:${{r3(u * scale)}}px"` : "";
      if (s.vo && (!Array.isArray(s.words) || !s.words.length) && MDx.karaokeWords) {{ s.words = MDx.karaokeWords(s, dur); }}
      const karaokeHtml = (v.subtitles !== false && s.vo && MDx.karaokeSub) ? MDx.karaokeSub(s, dur) : "";
      htmlScenes.push(`<section class="scene clip kind-${{esc(s.kind)}} tone-${{esc(tone)}} ${{esc(cls)}}" id="${{id}}" data-start="${{t0}}" data-duration="${{dur}}" data-track-kind="graphics" data-tone="${{esc(tone)}}">${{st.sceneDecor ? st.sceneDecor(s, i, c) : ""}}<div class="tr"><div class="k-wrap"${{wrapStyle}}>${{html}}</div></div>${{karaokeHtml}}</section>`);
      scenes.push({{ id, kind: s.kind, t0, dur, vis0, vis1, tin, ov, hero: r3(t0 + hero), events: events.map((e, j) => ({{ ...e, len: r3(lens[j]) }})), tone }});
    }});

    const vars = {{
      "--u": `${{u}}px`, "--W": `${{W}}px`, "--H": `${{H}}px`,
      "--bg": pal.bg, "--ink": pal.ink, "--accent": pal.accent, "--accent-ink": pal.accentInk || readableOn(pal.accent),
      "--muted": pal.muted, "--surface": pal.surface, "--line": pal.line || pal.muted,
      "--bg0": pal.bg, "--ink0": pal.ink, "--accent0": pal.accent, "--accent-ink0": pal.accentInk || readableOn(pal.accent), "--muted0": pal.muted, "--surface0": pal.surface,
      "--accent2": pal.accent2 || pal.accent, "--accent3": pal.accent3 || pal.accent2 || pal.accent,
      "--f-display": famStack(font.display, font.displayKind || "sans"), "--f-text": famStack(font.text), "--f-mono": famStack(font.mono || "JetBrains Mono", "mono"),
      "--f-num": famStack(font.num || font.display, font.displayKind || "sans"),
      ...(font.vars || {{}}), ...(pal.vars || {{}}),
    }};
    const varCss = Object.entries(vars).filter(([, x]) => x != null).map(([a, b]) => `${{a}}:${{b}}`).join(";");
    const wipes = scenes.map((s, i) => (s.tin === "wipe" ? `<i id="md-wipe-${{i}}"></i>` : "")).join("");
    const bgHtml = st.background && st.background.markup ? st.background.markup({{ ...ctxBase, pal, font }}) : "";
    const P = {{ style: st.id, fmt, W, H, u, duration, drift: v.drift ?? st.drift ?? 0, grain: (v.grain ?? st.grain ?? 0) > 0, scenes: scenes.map(({{ id, t0, dur, vis0, vis1, tin, ov, events }}) => ({{ id, t0, dur, vis0, vis1, tin, ov, events }})) }};

    const docHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>${{B.fontsCss}}</style>
<style>${{B.kitCss}}</style>
<style>${{B.stylesCss[st.id] || ""}}</style>
<style>#root{{${{varCss}};--grain:${{v.grain ?? st.grain ?? 0}}}}</style>
</head>
<body>
<div id="root" class="md st-${{st.id}} ${{fmt}} pal-${{esc((pal.name || "").split(" ")[0].toLowerCase())}}" data-composition-id="main" data-start="0" data-width="${{W}}" data-height="${{H}}" data-duration="${{duration}}">
<div class="md-bg">${{bgHtml}}</div>
${{htmlScenes.join("\\n")}}
<div class="md-wipe" data-layout-ignore>${{wipes}}</div>
${{(v.grain ?? st.grain ?? 0) > 0 ? '<div class="md-grain"></div>' : ""}}
</div>
<script>window.__SB_MODE = true; window.__INITIAL_T = ${{Number(seekTime) || 0}};<\\/script>
<script>${{B.gsapJs}}<\\/script>
<script>${{B.kitJs}}<\\/script>
<script>${{B.typeJs}}<\\/script>
<script>${{B.stylesJs[st.id] || ""}}<\\/script>
<script>
MD.build(${{JSON.stringify(P)}}, function (tl) {{
  window.__timelines = window.__timelines || {{}};
  window.__timelines["main"] = tl;
}});
<\\/script>
</body>
</html>`;

    const report = {{
      style: st.id, styleName: st.name, format: v.format || "16:9", W, H, duration, font: font.name, palette: pal.name,
      scenes: scenes.map((s) => ({{ id: s.id, kind: s.kind, t0: s.t0, dur: s.dur, hero: s.hero, tin: s.tin, tone: s.tone }})),
      sounds: 12, music: "composed", warnings: [], mixFile: B.mixDataUri, bpm
    }};
    return {{ docHtml, report }};
  }}

  const TOP = ["style", "format", "length", "font", "palette", "direction"];
  const fieldsOf = (st, kinds, kind) => ((st.kinds && st.kinds[kind] && st.kinds[kind].fields) || (kinds[kind] && kinds[kind].fields) || []);
  const EDITABLE = (v) => typeof v === "string" || typeof v === "number" || (Array.isArray(v) && v.every((x) => typeof x === "string" || typeof x === "number"));

  let currentVideo = JSON.parse(JSON.stringify(B.video));
  if (!Array.isArray(currentVideo.choices)) currentVideo.choices = [...new Set([currentVideo.style, ...(currentVideo.alternates || [])])];

  function applyPatch(v, p) {{
    const MDx = window.MD;
    const st = MDx.styles[v.style] || {{}};
    for (const k of ["font", "palette"]) {{
      if (!(k in p)) continue;
      if (v[k] && typeof v[k] === "object") v[`brand_${{k}}`] = v[k];
      if (p[k] === "brand") {{ if (v[`brand_${{k}}`]) p[k] = v[`brand_${{k}}`]; else delete p[k]; }}
    }}
    for (const k of TOP) if (k in p) v[k] = p[k];
    if (p.brandColor !== undefined) v.brand = {{ ...(v.brand || {{}}), color: p.brandColor || null }};
    if (p.sfx !== undefined) v.sound = {{ ...(v.sound || {{}}), sfx: p.sfx }};
    if (Array.isArray(p.scenes)) {{
      for (const ps of p.scenes) {{
        const s = (v.scenes || []).find((x) => String(x.id) === String(ps.id));
        if (!s) continue;
        if (typeof ps.ask === "string") s.ask = ps.ask;
        for (const k of fieldsOf(st, MDx.kinds, s.kind)) {{
          if (!(k in ps) || k === "ask") continue;
          const val = ps[k];
          if (k === "items" && s.kind === "features" && Array.isArray(val)) s.items = val.map((t, i) => ({{ ...((s.items || [])[i] || {{}}), title: String(t) }}));
          else if (Array.isArray(val)) {{ const old = s[k]; s[k] = val.map((x) => (Array.isArray(old) && typeof old[0] === "number" && !isNaN(+x) ? +x : String(x))); }}
          else if (typeof val === "string") s[k] = val;
        }}
        if (typeof ps.remove === "boolean") s.off = ps.remove;
      }}
    }}
  }}

  function buildViewState() {{
    const MDx = window.MD;
    const v = currentVideo;
    const st = MDx.styles[v.style] || {{}};
    const kinds = MDx.kinds;
    const {{ report }} = composeInBrowser(v, 0);
    const styleList = Object.values(MDx.styles).sort((a, b) => (a.order || 99) - (b.order || 99));
    return {{
      title: v.title, brief: v.brief || "", purpose: v.purpose || "", direction: v.direction || "",
      style: v.style, format: v.format || "16:9", length: v.length || null,
      font: typeof v.font === "object" ? "brand" : v.font ?? 0, palette: typeof v.palette === "object" ? "brand" : v.palette ?? 0,
      brandFont: typeof v.font === "object" ? v.font : v.brand_font || null, brandPalette: typeof v.palette === "object" ? v.palette : v.brand_palette || null,
      brandColor: (v.brand && v.brand.color) || "", sfx: (v.sound && v.sound.sfx) || "on",
      why: v.why || {{}}, alternates: (v.choices || v.alternates || []).filter((x) => MDx.styles[x] && x !== v.style),
      approved: !!v.approved,
      report,
      W: FORMATS[v.format || "16:9"].W, H: FORMATS[v.format || "16:9"].H,
      styles: styleList.map((s) => ({{ id: s.id, name: s.name, tagline: s.tagline, bestFor: s.bestFor, fonts: s.fonts.map((f) => ({{ name: f.name, display: f.display, vars: f.vars || {{}} }})), palettes: s.palettes.map((p) => ({{ name: p.name, bg: p.bg, ink: p.ink, accent: p.accent }})) }})),
      fontFaces: [],
      scenes: (v.scenes || []).map((s, i) => ({{
        id: s.id, kind: s.kind, label: (st.kinds && st.kinds[s.kind] && st.kinds[s.kind].label) || null,
        fields: fieldsOf(st, kinds, s.kind).filter((f) => f === "items" ? Array.isArray(s.items) || s.items == null : EDITABLE(s[f]) || (s[f] == null && ["text", "title"].includes(f))),
        values: Object.fromEntries(fieldsOf(st, kinds, s.kind).filter((f) => f !== "items" && EDITABLE(s[f]) && !["media", "html"].includes(f)).map((f) => [f, s[f]])),
        items: Array.isArray(s.items) ? s.items.map((x) => (typeof x === "string" ? x : x.title || x.label || "")) : undefined,
        media: s.media ? [].concat(s.media) : [], plan: s.plan || "", why: s.why || "", ask: s.ask || "",
        at: report.scenes[i] || null,
      }})),
    }};
  }}

  window.__buildSrcDoc = function(urlStr) {{
    const u = new URL(urlStr, "http://localhost");
    const t = parseFloat(u.searchParams.get("t") || "0");
    const m = u.pathname.match(/^\\/alts\\/([^/]+)\\//);
    if (m) {{
      const altId = m[1];
      const altV = {{ ...currentVideo, style: altId, font: 0, palette: 0 }};
      return composeInBrowser(altV, t).docHtml;
    }}
    return composeInBrowser(currentVideo, t).docHtml;
  }};

  const origFetch = window.fetch.bind(window);
  window.fetch = async function(url, opts) {{
    const u = typeof url === "string" ? url : url.url;
    if (u === "/api/state") {{
      const state = buildViewState();
      return new Response(JSON.stringify(state), {{ status: 200, headers: {{ "content-type": "application/json" }} }});
    }}
    if (u === "/api/patch") {{
      const body = JSON.parse(opts.body || "{{}}");
      applyPatch(currentVideo, body);
      const state = buildViewState();
      return new Response(JSON.stringify(state), {{ status: 200, headers: {{ "content-type": "application/json" }} }});
    }}
    if (u === "/api/approve") {{
      currentVideo.approved = true;
      return new Response(JSON.stringify({{ ok: true }}), {{ status: 200, headers: {{ "content-type": "application/json" }} }});
    }}
    if (u.startsWith("/build/data:audio") || u.startsWith("data:audio")) {{
      const clean = u.replace(/^\\/build\\//, "").split("?")[0];
      return origFetch(clean);
    }}
    return origFetch(url, opts);
  }};
}})();
</script>"""

# Patch page.html to use window.__buildSrcDoc for iframes and direct mixFile data URI for audio
page_html_patched = page_html.replace(
    'if (f.dataset.src !== src) { f.dataset.src = src; f.src = src; }',
    'if (f.dataset.src !== src) { f.dataset.src = src; f.srcdoc = window.__buildSrcDoc(src); }'
).replace(
    'if (main.dataset.rev !== String(rev)) { main.dataset.rev = rev; main.src = want; }',
    'if (main.dataset.rev !== String(rev)) { main.dataset.rev = rev; main.srcdoc = window.__buildSrcDoc(want); }'
).replace(
    'const list = S.report.mixFile ? [{ url: `/build/${S.report.mixFile}?r=${rev}`, start: 0, gain: 1, music: true }] : [];',
    'const list = S.report.mixFile ? [{ url: S.report.mixFile, start: 0, gain: 1, music: true }] : [];'
).replace(
    '<script>\n(() => {',
    shim_script + '\n<script>\n(() => {'
)

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(page_html_patched)

print("Built self-contained Canvas storyboard:", OUT_HTML, "size:", os.path.getsize(OUT_HTML))
