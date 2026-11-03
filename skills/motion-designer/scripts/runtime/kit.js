/* Motion Designer kit — shared by the composer (Node) and the video (browser).
 *
 * Node calls the markup + plan side: each scene kind returns its HTML and a list of timed events
 * ({t, sel, move, n, o, sfx}). The browser runs the same events on one paused GSAP timeline.
 * One source of timing, so every sound lands on its picture and the storyboard frames are the video.
 */
(function (G) {
  "use strict";
  const MD = (G.MD = G.MD || {});
  MD.styles = MD.styles || {};
  MD.style = (name, def) => (MD.styles[name] = def);

  // ---------- text ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  MD.esc = esc;

  // "*word*" = emphasis (the style decides: accent colour, italic serif, highlighter…); "|" = line break
  // a word is emphasised if any of it is inside *…*; punctuation stays glued to its word ("*minutes*.")
  function tokens(line) {
    const out = [];
    let em = false;
    for (const raw of String(line).split(/\s+/)) {
      if (!raw) continue;
      let on = em;
      for (const ch of raw) if (ch === "*") { em = !em; if (em) on = true; }
      const w = raw.replace(/\*/g, "");
      if (w) out.push({ w, em: on });
    }
    return out;
  }
  const lines = (str) => String(str == null ? "" : str).split("|").map((s) => s.trim()).filter(Boolean);
  MD.plain = (str) => lines(str).map((l) => tokens(l).map((t) => t.w).join(" ")).join(" ");
  MD.count = (str, split) => {
    const ts = lines(str).flatMap(tokens);
    if (split === "chars") return ts.reduce((n, t) => n + [...t.w].length, 0);
    if (split === "lines") return lines(str).length;
    return ts.length;
  };
  // words → <span class="w"><span class="wi">…</span></span>; chars inside when split = "chars"
  MD.tx = function (str, o = {}) {
    let wi = 0, ci = 0;
    return lines(str)
      .map((l) => {
        const ws = tokens(l).map((t) => {
          const inner = o.split === "chars"
            ? [...t.w].map((ch) => `<span class="c" style="--ci:${ci++}">${esc(ch)}</span>`).join("")
            : esc(t.w);
          return `<span class="w${t.em ? " em" : ""}" style="--wi:${wi++}"><span class="wi">${inner}</span>${t.em ? '<i class="mk"></i>' : ""}</span>`;
        });
        return `<span class="ln">${ws.join(" ")}</span>`;
      })
      .join("");
  };
  // "$1.2M" → {pre:"$", to:1.2, dec:1, suf:"M", sep:true}
  MD.parseNumber = function (v) {
    const s = String(v == null ? "" : v).trim();
    const m = s.match(/^([^\d\-.]*)(-?[\d,]*\.?\d+)(.*)$/);
    if (!m) return null;
    const raw = m[2];
    const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
    return { pre: m[1], to: parseFloat(raw.replace(/,/g, "")), dec, suf: m[3], sep: raw.includes(",") || Math.abs(parseFloat(raw.replace(/,/g, ""))) >= 10000 };
  };
  MD.formatNumber = (v, dec, sep) => {
    let s = Math.abs(v).toFixed(dec);
    if (sep) { const [a, b] = s.split("."); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? "." + b : ""); }
    return (v < 0 ? "-" : "") + s;
  };
  const readSecs = (str) => 0.45 + MD.count(str) * 0.24; // ~4 words a second, plus a beat to land
  // Polymathic Investigative Director: voiceover WPM (~135 WPM = 0.444s/word) + [AUDIO PAUSE: Xs] markers + timestamp ranges
  MD.parsePause = function (s) {
    if (!s || typeof s !== "object") return 0;
    let p = typeof s.pause === "number" ? s.pause : 0;
    const raw = `${s.vo || ""} ${s.text || ""} ${s.sub || ""} ${s.audio || ""}`;
    const re = /\[(?:AUDIO\s+)?PAUSE:\s*([\d.]+)\s*s(?:ec(?:onds?)?)?\]/gi;
    let m;
    while ((m = re.exec(raw)) !== null) p += parseFloat(m[1]) || 0;
    return p;
  };
  MD.parseTimestamp = function (ts) {
    if (!ts || typeof ts !== "string") return null;
    const m = ts.match(/(\d+):(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+):(\d+(?:\.\d+)?)/i);
    if (!m) return null;
    const t0 = parseInt(m[1], 10) * 60 + parseFloat(m[2]);
    const t1 = parseInt(m[3], 10) * 60 + parseFloat(m[4]);
    return t1 > t0 ? { t0, t1, dur: +(t1 - t0).toFixed(3) } : null;
  };
  MD.voSecs = function (s, wpm = 135) {
    if (!s || typeof s !== "object") return 0;
    const pause = MD.parsePause(s);
    if (!s.vo && !pause) return 0;
    const cleanVo = String(s.vo || "").replace(/\[(?:AUDIO\s+)?PAUSE:\s*[\d.]+\s*s(?:ec(?:onds?)?)?\]/gi, "").trim();
    const words = cleanVo ? MD.count(cleanVo) : 0;
    const rate = 60 / Math.max(80, Math.min(220, +wpm || 135));
    return (words > 0 ? 0.35 + words * rate : 0) + pause;
  };

  // ---------- media ----------
  const isVideo = (p) => /\.(mp4|mov|m4v|webm)$/i.test(p || "");
  MD.media = function (src, c, o = {}) {
    const url = src ? (c.asset ? c.asset(src) : src) : null;
    if (!url) return `<div class="ph"><span>${esc(o.label || "Your screenshot goes here")}</span></div>`;
    if (isVideo(src)) {
      const id = `v${(c.vid = (c.vid || 0) + 1)}-${c.sceneId}`;
      // timing is filled by the composer (data-start/data-duration = the scene's window)
      return `<video id="${id}" class="md-vid" src="${esc(url)}" muted playsinline data-md-video="1"></video>`;
    }
    return `<img src="${esc(url)}" alt="" draggable="false">`;
  };
  // real hardware (photographed frames with a measured screen): the default for phones, laptops,
  // displays and tablets; "browser", "window" and "plain" stay drawn in CSS
  MD.REAL = { phone: "iphone", iphone: "iphone", macbook: "macbook", laptop: "macbook", display: "display", monitor: "display", studio: "display", "studio-display": "display", ipad: "ipad", tablet: "ipad" };
  MD.deviceFor = function (src, c, o = {}) {
    if (o.device) return o.device;
    const ar = src && c.ratio ? c.ratio(src) : null;
    if (!ar) return "plain";
    const [w, h] = ar.split("/").map((x) => parseFloat(x));
    return w / h < 0.8 ? "iphone" : w / h > 1.25 ? "macbook" : "plain";
  };
  MD.devAr = (kind, c) => { const m = c.deviceMeta(MD.REAL[kind]); return (m.w / m.h).toFixed(4); };
  MD.isReal = (kind, c) => !!(MD.REAL[kind] && c.deviceMeta && c.deviceMeta(MD.REAL[kind]));
  MD.device = function (src, c, o = {}) {
    const kind = MD.deviceFor(src, c, o);
    const media = MD.media(src, c, o);
    if (MD.isReal(kind, c)) {
      const m = c.deviceMeta(MD.REAL[kind]), sc = m.screen;
      return `<div class="dev real d-${MD.REAL[kind]}" style="--ar:${(m.w / m.h).toFixed(4)};--sx:${sc.x}%;--sy:${sc.y}%;--sw:${sc.w}%;--sh:${sc.h}%;--sr:${sc.r}"><div class="scr"><div class="pan">${media}</div></div><img class="frame" src="${m.src}" alt="" draggable="false"></div>`;
    }
    const url = o.url ? `<span class="url">${esc(o.url)}</span>` : "";
    if (kind === "phone") return `<div class="dev phone"><div class="scr"><div class="pan">${media}</div></div><i class="island"></i></div>`;
    if (kind === "browser") return `<div class="dev browser"><div class="bar"><i></i><i></i><i></i>${url}</div><div class="scr"><div class="pan">${media}</div></div></div>`;
    if (kind === "window") return `<div class="dev window"><div class="bar"><i></i><i></i><i></i></div><div class="scr"><div class="pan">${media}</div></div></div>`;
    const ar = src && c.ratio ? c.ratio(src) : null;
    return `<div class="dev plain"${ar ? ` style="--media-ar:${ar}"` : ""}><div class="scr"><div class="pan">${media}</div></div></div>`;
  };
  MD.icon = (name, c) => (c.icon ? c.icon(name) : "");

  // ---------- moves ----------
  // len(n, o) is how long the move takes for n units (both sides); run() is browser-only.
  const D = (o, k, d) => (o && o[k] != null ? o[k] : d);
  const units = (els, sel) => {
    const out = [];
    els.forEach((el) => { const q = el.querySelectorAll(sel); if (q.length) q.forEach((x) => out.push(x)); });
    return out.length ? out : Array.from(els);
  };
  MD.moves = {
    show: { len: () => 0, run: (tl, els, at) => tl.set(els, { opacity: 1 }, at) },
    hide: { len: () => 0, run: (tl, els, at) => tl.set(els, { opacity: 0 }, at) },
    kcapWord: {
      len: () => 0,
      run: (tl, els, at, o) => {
        const d = D(o, "d", 0.35);
        tl.set(els, { backgroundColor: "var(--accent)", color: "var(--accent-ink)", scale: 1.08 }, at);
        tl.to(els, { scale: 1.0, duration: Math.min(0.15, d * 0.5), ease: "power2.out" }, at);
        tl.set(els, { backgroundColor: "transparent", color: "#F8FAFC", scale: 1 }, at + d);
      },
    },
    fadeIn: {
      len: (n, o) => D(o, "d", 0.6) + D(o, "st", 0.08) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: D(o, "d", 0.6), stagger: D(o, "st", 0.08), ease: "power2.out" }, at),
    },
    fadeUp: {
      len: (n, o) => D(o, "d", 0.7) + D(o, "st", 0.08) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, y: D(o, "y", 28) }, { opacity: 1, y: 0, duration: D(o, "d", 0.7), stagger: D(o, "st", 0.08), ease: D(o, "ease", "power3.out") }, at),
    },
    // words rise out of a mask, one after another
    maskUp: {
      mask: true,
      len: (n, o) => D(o, "d", 0.85) + D(o, "st", 0.06) * (n - 1),
      run: (tl, els, at, o) => {
        els.forEach((e) => e.classList.add("masked"));
        tl.fromTo(units(els, ".wi"), { yPercent: 115 }, { yPercent: 0, duration: D(o, "d", 0.85), stagger: D(o, "st", 0.06), ease: D(o, "ease", "expo.out") }, at);
      },
    },
    // each word lands hard, big to its size — one beat per word
    slam: {
      len: (n, o) => D(o, "d", 0.32) + D(o, "st", 0.16) * (n - 1),
      run: (tl, els, at, o) => {
        const u = units(els, ".w");
        tl.fromTo(u, { opacity: 0, scale: D(o, "from", 1.8) }, { opacity: 1, scale: 1, duration: D(o, "d", 0.32), stagger: D(o, "st", 0.16), ease: "power4.out" }, at);
      },
    },
    blurIn: {
      len: (n, o) => D(o, "d", 1.0) + D(o, "st", 0.07) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(units(els, ".w"), { opacity: 0, filter: `blur(${D(o, "blur", 14)}px)`, y: D(o, "y", 10) }, { opacity: 1, filter: "blur(0px)", y: 0, duration: D(o, "d", 1.0), stagger: D(o, "st", 0.07), ease: "power2.out" }, at),
    },
    charRise: {
      mask: true,
      len: (n, o) => D(o, "d", 0.7) + D(o, "st", 0.025) * (n - 1),
      run: (tl, els, at, o) => {
        els.forEach((e) => e.classList.add("masked"));
        tl.fromTo(units(els, ".c"), { yPercent: 110, rotate: D(o, "rot", 6) }, { yPercent: 0, rotate: 0, duration: D(o, "d", 0.7), stagger: D(o, "st", 0.025), ease: "expo.out" }, at);
      },
    },
    typewriter: {
      len: (n, o) => D(o, "rate", 0.045) * n,
      run: (tl, els, at, o) => {
        const cs = units(els, ".c");
        const rate = D(o, "rate", 0.045);
        tl.set(cs, { opacity: 0 }, Math.max(0, at - 0.001));
        cs.forEach((c, i) => tl.set(c, { opacity: 1 }, at + i * rate));
      },
    },
    scramble: {
      len: (n, o) => D(o, "d", 0.9) + 0.02 * n,
      run: (tl, els, at, o) => {
        const cs = units(els, ".c");
        const finals = cs.map((c) => c.textContent);
        const glyphs = D(o, "glyphs", "ABCDEFGHJKMNPQRSTUVWXYZ0123456789#%&*+=<>/");
        const p = { v: 0 };
        const n = cs.length;
        const draw = () => {
          const step = Math.floor(p.v * 40);
          cs.forEach((c, i) => {
            const done = p.v * (n + 6) - i > 6;
            if (finals[i] === " ") return;
            c.textContent = done ? finals[i] : p.v === 0 ? " " : glyphs[(i * 7 + step * 13 + i * step) % glyphs.length];
          });
        };
        tl.fromTo(p, { v: 0 }, { v: 1, duration: D(o, "d", 0.9) + 0.02 * n, ease: "none", onUpdate: draw, onStart: draw, onReverseComplete: draw }, at);
        draw();
      },
    },
    // letters start wide apart and settle — the trailer title
    trackIn: {
      len: (n, o) => D(o, "d", 1.8),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, letterSpacing: D(o, "from", "0.6em"), filter: "blur(8px)" }, { opacity: 1, letterSpacing: D(o, "to", "0.08em"), filter: "blur(0px)", duration: D(o, "d", 1.8), ease: "power3.out" }, at),
    },
    // Volume-preserving Squash & Stretch pop with 3-frame anticipation compression (Alan Becker + Ben Marriott)
    pop: {
      len: (n, o) => D(o, "d", 0.72) + D(o, "st", 0.09) * (n - 1),
      run: (tl, els, at, o) => {
        const d = D(o, "d", 0.72), st = D(o, "st", 0.09);
        gsap.set(els, { opacity: 0, scaleX: 1.12, scaleY: 0.89, y: 8 });
        tl.to(els, {
          keyframes: [
            { opacity: 1, scaleX: 1.14, scaleY: 0.88, y: 10, duration: d * 0.16, ease: "power2.in" }, // 3-frame anticipation crouch (volume 1.14*0.88=1.00)
            { scaleX: 0.94, scaleY: 1.06, y: -4, duration: d * 0.42, ease: "expo.out" },              // upward stretch & overshoot (volume 0.94*1.06=1.00)
            { scaleX: 1.02, scaleY: 0.98, y: 1, duration: d * 0.22, ease: "sine.inOut" },             // follow-through settle
            { scaleX: 1, scaleY: 1, y: 0, duration: d * 0.20, ease: "power2.out" },
          ],
          stagger: st,
        }, at);
      },
    },
    // Layered entrance with Overlapping Action & Follow-Through on child elements (nothing stops all at once)
    rise: {
      len: (n, o) => D(o, "d", 1.0) + D(o, "st", 0.12) * (n - 1),
      run: (tl, els, at, o) => {
        const d = D(o, "d", 1.0), st = D(o, "st", 0.12);
        tl.fromTo(els, { opacity: 0, yPercent: D(o, "y", 18), rotationX: D(o, "rx", 14), scaleX: 0.97, scaleY: 1.03, transformPerspective: 1600 }, { opacity: 1, yPercent: 0, rotationX: 0, scaleX: 1, scaleY: 1, duration: d, stagger: st, ease: "expo.out" }, at);
        // Overlapping drag on inner headings, text & badges (2-4 frame offset)
        els.forEach((el, idx) => {
          const kids = el.querySelectorAll("h3, p, li, .ts-head, .pv-hdr, .tm-mv");
          if (kids.length) {
            tl.fromTo(kids, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: d * 0.65, stagger: 0.045, ease: "power3.out" }, at + idx * st + 0.08);
          }
        });
      },
    },
    // Ben Marriott 3-Frame Slingshot Anticipation Move (pulls backward before shooting into place)
    slingshot: {
      len: (n, o) => D(o, "d", 0.78) + D(o, "st", 0.09) * (n - 1),
      run: (tl, els, at, o) => {
        const d = D(o, "d", 0.78), st = D(o, "st", 0.09), dir = D(o, "dir", 1);
        gsap.set(els, { opacity: 0, x: -36 * dir, rotation: -2.5 * dir });
        tl.to(els, {
          keyframes: [
            { opacity: 1, x: -52 * dir, rotation: -4.5 * dir, scaleX: 0.94, scaleY: 1.06, duration: d * 0.24, ease: "power2.out" }, // wind-up in opposite direction
            { x: 10 * dir, rotation: 1.2 * dir, scaleX: 1.04, scaleY: 0.96, duration: d * 0.44, ease: "expo.out" },                 // high-velocity release + overshoot
            { x: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: d * 0.32, ease: "power3.out" },                                    // follow-through settle
          ],
          stagger: st,
        }, at);
      },
    },
    scaleIn: {
      len: (n, o) => D(o, "d", 1.1) + D(o, "st", 0.1) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: D(o, "from", 0.9) }, { opacity: 1, scale: 1, duration: D(o, "d", 1.1), stagger: D(o, "st", 0.1), ease: "expo.out" }, at),
    },
    slideIn: {
      len: (n, o) => D(o, "d", 0.8) + D(o, "st", 0.08) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, xPercent: D(o, "x", -30) }, { opacity: 1, xPercent: 0, duration: D(o, "d", 0.8), stagger: D(o, "st", 0.08), ease: "expo.out" }, at),
    },
    wipeIn: {
      len: (n, o) => D(o, "d", 0.8) + D(o, "st", 0.1) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: D(o, "d", 0.8), stagger: D(o, "st", 0.1), ease: "expo.inOut" }, at),
    },
    // the emphasis mark under/behind *words* grows in
    mark: {
      len: (n, o) => D(o, "d", 0.5) + 0.1 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(units(els, ".mk"), { scaleX: 0 }, { scaleX: 1, duration: D(o, "d", 0.5), stagger: 0.1, ease: "expo.out" }, at),
    },
    grow: {
      len: (n, o) => D(o, "d", 1.0) + D(o, "st", 0.1) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { scaleY: 0 }, { scaleY: 1, duration: D(o, "d", 1.0), stagger: D(o, "st", 0.1), ease: "expo.out" }, at),
    },
    growX: {
      len: (n, o) => D(o, "d", 1.0) + D(o, "st", 0.1) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { scaleX: 0 }, { scaleX: 1, duration: D(o, "d", 1.0), stagger: D(o, "st", 0.1), ease: D(o, "ease", "expo.out") }, at),
    },
    draw: {
      len: (n, o) => D(o, "d", 1.2),
      run: (tl, els, at, o) => {
        const ps = units(els, "path,line,polyline,circle,rect");
        ps.forEach((p) => { const L = p.getTotalLength ? p.getTotalLength() : 1000; p.style.strokeDasharray = L; p.dataset.len = L; });
        tl.fromTo(ps, { strokeDashoffset: (i, p) => p.dataset.len }, { strokeDashoffset: 0, duration: D(o, "d", 1.2), ease: "power2.inOut" }, at);
      },
    },
    count: {
      len: (n, o) => D(o, "d", 1.6),
      run: (tl, els, at, o) => {
        els.forEach((el) => {
          const to = parseFloat(el.dataset.to), from = parseFloat(el.dataset.from || "0");
          const dec = +el.dataset.dec || 0, sep = el.dataset.sep === "1";
          el.style.minWidth = el.getBoundingClientRect().width + "px";
          const p = { v: from };
          const draw = () => (el.textContent = MD.formatNumber(p.v, dec, sep));
          draw();
          tl.fromTo(p, { v: from }, { v: to, duration: D(o, "d", 1.6), ease: D(o, "ease", "expo.out"), onUpdate: draw, onStart: draw, onReverseComplete: draw }, at);
        });
      },
    },
    strike: {
      len: (n, o) => D(o, "d", 0.4) + 0.12 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(units(els, ".strike"), { scaleX: 0 }, { scaleX: 1, duration: D(o, "d", 0.4), stagger: 0.12, ease: "power3.inOut" }, at),
    },
    lineDraw: {
      len: (n, o) => D(o, "d", 1.8),
      run: (tl, els, at, o) => els.forEach((plot) => {
        const vals = JSON.parse(plot.dataset.values || "[]");
        const top = +plot.dataset.top || Math.max(...vals, 1);
        const w = plot.offsetWidth || 800, h = plot.offsetHeight || 360;
        if (!vals.length || !w || !h) return;
        const pts = vals.map((v, i) => [vals.length === 1 ? w : (i / (vals.length - 1)) * w, h - (v / top) * h]);
        const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
        const svg = plot.querySelector("svg");
        if (!svg) return;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const line = svg.querySelector(".dl-line"), area = svg.querySelector(".dl-area");
        if (line) line.setAttribute("d", d);
        if (area) area.setAttribute("d", `${d}L${w},${h}L0,${h}Z`);
        svg.querySelectorAll(".dl-pt").forEach((c, i) => { if (pts[i]) { c.setAttribute("cx", pts[i][0]); c.setAttribute("cy", pts[i][1]); } });
        const L = line && line.getTotalLength ? line.getTotalLength() : 1000;
        if (line) line.style.strokeDasharray = `${L} ${L}`;
        const dot = plot.querySelector(".dl-dot"), end = plot.querySelector(".dl-end");
        const last = pts[pts.length - 1];
        if (end && last) { end.style.left = last[0] + "px"; end.style.top = last[1] + "px"; }
        const p = { v: 0 };
        const draw = () => {
          if (!line) return;
          line.style.strokeDashoffset = L * (1 - p.v);
          if (line.getPointAtLength) {
            const q = line.getPointAtLength(L * p.v);
            if (dot) { dot.style.left = q.x + "px"; dot.style.top = q.y + "px"; }
          }
        };
        draw();
        const dur = D(o, "d", 1.8);
        tl.fromTo(p, { v: 0 }, { v: 1, duration: dur, ease: "power2.inOut", onUpdate: draw, onReverseComplete: draw }, at);
        if (area) tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out" }, at + dur * 0.6);
        tl.fromTo(svg.querySelectorAll(".dl-pt"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" }, { scale: 1, duration: 0.3, stagger: dur / Math.max(1, vals.length), ease: "back.out(3)" }, at);
        if (dot) tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at);
      }),
    },
    ring: {
      len: (n, o) => D(o, "d", 1.6),
      run: (tl, els, at, o) => els.forEach((arc) => {
        const C = 2 * Math.PI * 42;
        const share = Math.max(0, Math.min(1, +arc.dataset.share || 0));
        arc.style.strokeDasharray = `${C} ${C}`;
        tl.fromTo(arc, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - share), duration: D(o, "d", 1.6), ease: "expo.out" }, at);
      }),
    },
    // 3Blue1Brown frame-coupled oscillator + waveform + s-plane pole updater
    mathOsc: {
      len: (n, o) => D(o, "d", 2.4),
      run: (tl, els, at, o, c, s) => els.forEach((stage) => {
        const sigma = parseFloat(stage.dataset.sigma || "0.35");
        const wd = parseFloat(stage.dataset.wd || "3.2");
        const wExt = parseFloat(stage.dataset.wext || "1.85");
        const pTrans = stage.querySelector(".m3-trans");
        const pSteady = stage.querySelector(".m3-steady");
        const pTotal = stage.querySelector(".m3-total");
        const springPath = stage.querySelector(".m3-spring");
        const massBox = stage.querySelector(".m3-mass");
        const dot = stage.querySelector(".m3-tip");
        const W = 560, midY = 98, amp = 46;
        const calcTr = (t) => Math.exp(-sigma * t) * Math.cos(wd * t);
        const calcSt = (t) => 0.72 * Math.cos(wExt * t - 0.4);
        const calcTot = (t) => calcTr(t) + calcSt(t);
        const state = { p: 0 };
        const draw = () => {
          const prog = Math.max(0.02, state.p);
          const maxX = Math.round(W * prog);
          let dTr = "", dSt = "", dTot = "", lastX = 40, lastY = midY;
          for (let px = 0; px <= maxX; px += 4) {
            const tm = (px / W) * 12.0;
            const x = 40 + px;
            const y1 = midY - calcTr(tm) * amp;
            const y2 = midY - calcSt(tm) * amp;
            const y3 = midY - calcTot(tm) * amp;
            dTr += `${px === 0 ? "M" : "L"}${x.toFixed(1)},${y1.toFixed(1)}`;
            dSt += `${px === 0 ? "M" : "L"}${x.toFixed(1)},${y2.toFixed(1)}`;
            dTot += `${px === 0 ? "M" : "L"}${x.toFixed(1)},${y3.toFixed(1)}`;
            lastX = x; lastY = y3;
          }
          if (pTrans) pTrans.setAttribute("d", dTr);
          if (pSteady) pSteady.setAttribute("d", dSt);
          if (pTotal) pTotal.setAttribute("d", dTot);
          if (dot) { dot.setAttribute("cx", lastX.toFixed(1)); dot.setAttribute("cy", lastY.toFixed(1)); }
          const curT = prog * 12.0;
          const disp = calcTot(curT);
          const massX = 320 + disp * 95;
          const anchorX = 60, spY = 238;
          let spD = `M${anchorX},${spY}`;
          const coils = 14;
          for (let i = 1; i <= coils; i++) {
            const cx = anchorX + ((massX - 34 - anchorX) * i) / coils;
            const cy = spY + (i === coils ? 0 : (i % 2 === 0 ? -18 : 18));
            spD += `L${cx.toFixed(1)},${cy.toFixed(1)}`;
          }
          if (springPath) springPath.setAttribute("d", spD);
          if (massBox) { massBox.setAttribute("x", (massX - 34).toFixed(1)); massBox.setAttribute("y", "212"); }
        };
        draw();
        const runDur = s ? Math.max(2.0, s.dur - 0.6) : D(o, "d", 3.2);
        tl.fromTo(state, { p: 0.02 }, { p: 1, duration: runDur, ease: "none", onUpdate: draw, onStart: draw, onReverseComplete: draw }, at);
      }),
    },
    // continuous moves (len 0: they don't delay the hero frame)
    float: {
      len: () => 0,
      run: (tl, els, at, o) => tl.fromTo(els, { y: D(o, "amp", 10) }, { y: -D(o, "amp", 10), duration: D(o, "d", 4), ease: "sine.inOut" }, at),
    },
    drift: {
      len: () => 0,
      run: (tl, els, at, o) => tl.fromTo(els, { scale: D(o, "from", 1) }, { scale: D(o, "to", 1.04), duration: D(o, "d", 4), ease: "none" }, at),
    },
    pan: {
      // a long screenshot scrolls inside its screen
      len: () => 0,
      run: (tl, els, at, o) => {
        els.forEach((pan) => {
          const scr = pan.parentElement;
          const extra = Math.max(0, pan.scrollHeight - scr.clientHeight);
          if (extra > 4) tl.fromTo(pan, { y: 0 }, { y: -extra, duration: D(o, "d", 4), ease: "power1.inOut" }, at);
          else tl.fromTo(pan, { scale: 1 }, { scale: 1.06, duration: D(o, "d", 4), ease: "none" }, at);
        });
      },
    },
    tilt: {
      len: () => 0,
      run: (tl, els, at, o) => tl.fromTo(els, { rotationY: D(o, "from", -14), rotationX: 6, transformPerspective: 2000 }, { rotationY: D(o, "to", 8), rotationX: 2, duration: D(o, "d", 4), ease: "sine.inOut" }, at),
    },
  };
  // the current style's own moves count too (MD._st is set by the composer and by build)
  MD.move = (name) => (MD._st && MD._st.moves && MD._st.moves[name]) || MD.moves[name];
  // entrances play at the style's tempo (default 1.3× faster than written): headlines land in ~1 s
  MD.tempo = () => (MD._st && MD._st.tempo) || 1.3;
  MD.moveLen = (move, n, o) => { const m = MD.move(move); return m && m.len ? m.len(Math.max(1, n || 1), o || {}) / MD.tempo() : 0; };

  // ---------- scene kinds ----------
  // markup(s, c) → html; plan(s, c) → events; min(s) → shortest readable length in seconds.
  // c.T = the style's move choices: {title, body, kicker, item, emph, number, media, card, word}
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx, hit });
  MD.ev = ev;
  const after = (e) => e.t + MD.moveLen(e.move, e.n, e.o);
  const T = (c, k, d) => (c.T && c.T[k]) || d;
  const splitFor = (move) => (move === "charRise" || move === "typewriter" || move === "scramble" ? "chars" : "words");
  const sfxOf = (c, k) => (c.S ? c.S[k] : null);
  const titleEvent = (c, s, t, text, sel, key = "title") => {
    const m = T(c, key, "maskUp");
    return ev(t, sel, m, MD.count(text, splitFor(m)), (c.O && c.O[key]) || {}, sfxOf(c, key), "start");
  };
  const kicker = (s, c) => (s.kicker ? `<div class="kicker">${MD.tx(s.kicker)}</div>` : "");
  const emphEvents = (s, c, text, sel, at) => {
    if (!c.T || !c.T.emph || !/\*/.test(text || "")) return [];
    return [ev(at, sel, c.T.emph, 1, {}, null)];
  };

  MD.kinds = {
    hook: {
      fields: ["kicker", "text", "sub"],
      min: (s) => Math.max(1.7, readSecs(s.text) + (s.sub ? readSecs(s.sub) * 0.5 : 0)),
      markup: (s, c) => `<div class="k k-hook"><div class="box">${kicker(s, c)}<h1 class="title" data-fit data-maxh="${c.fmt === "portrait" ? 62 : 70}">${MD.tx(s.text, { split: splitFor(T(c, "title", "maskUp")) })}</h1>${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}</div></div>`,
      plan: (s, c) => {
        const e = [];
        if (s.kicker) e.push(ev(0.1, ".kicker", T(c, "kicker", "fadeUp"), 1, {}, null));
        const t = titleEvent(c, s, s.kicker ? 0.35 : 0.15, s.text, ".title");
        e.push(t, ...emphEvents(s, c, s.text, ".title", after(t) - 0.2));
        if (s.sub) e.push(ev(after(t) - 0.15, ".sub", T(c, "body", "fadeUp"), MD.count(s.sub), {}, null));
        return e;
      },
    },
    statement: {
      fields: ["kicker", "text", "sub"],
      min: (s) => Math.max(1.7, readSecs(s.text) + (s.sub ? readSecs(s.sub) * 0.5 : 0)),
      markup: (s, c) => `<div class="k k-statement"><div class="box">${kicker(s, c)}<h2 class="title" data-fit data-maxh="${c.fmt === "portrait" ? 60 : 64}">${MD.tx(s.text, { split: splitFor(T(c, "title", "maskUp")) })}</h2>${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}</div></div>`,
      plan: (s, c) => MD.kinds.hook.plan(s, c),
    },
    words: {
      fields: ["items"],
      min: (s) => Math.max(1.6, (s.items || []).reduce((a, w) => a + Math.max(0.75, 0.45 + MD.count(w) * 0.3), 0)),
      markup: (s, c) => `<div class="k k-words">${(s.items || []).map((w, i) => `<div class="wd" data-i="${i}"><div class="title" data-fit data-maxh="62">${MD.tx(w, { split: splitFor(T(c, "word", "slam")) })}</div></div>`).join("")}</div>`,
      plan: (s, c, dur) => {
        const n = (s.items || []).length || 1, beat = dur / n, e = [];
        const m = T(c, "word", "slam");
        (s.items || []).forEach((w, i) => {
          e.push(ev(i * beat, `.wd[data-i="${i}"]`, "show", 1));
          e.push(ev(i * beat + 0.02, `.wd[data-i="${i}"] .title`, m, MD.count(w, splitFor(m)), { st: Math.min(0.16, (beat * 0.5) / Math.max(1, MD.count(w))), ...((c.O && c.O.word) || {}), ...(m === "scramble" ? { d: Math.max(0.15, Math.min(0.5, beat * 0.28) - 0.015 * MD.count(w, "chars")) } : {}) }, sfxOf(c, "word"), "start"));
          if (i < n - 1) e.push(ev((i + 1) * beat - 0.001, `.wd[data-i="${i}"]`, "hide", 1));
        });
        return e;
      },
    },
    stat: {
      fields: ["kicker", "value", "label"],
      min: (s) => Math.max(2.0, 1.3 + readSecs(s.label) * 0.6),
      markup: (s, c) => {
        const p = MD.parseNumber(s.value);
        const num = p
          ? `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>`
          : `<span class="val-text">${esc(s.value)}</span>`;
        return `<div class="k k-stat"><div class="box">${kicker(s, c)}<div class="num" data-fit data-maxh="46">${num}</div>${s.label ? `<p class="label">${MD.tx(s.label)}</p>` : ""}</div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        if (s.kicker) e.push(ev(0.1, ".kicker", T(c, "kicker", "fadeUp"), 1));
        const t0 = s.kicker ? 0.3 : 0.15;
        e.push(ev(t0, ".num", T(c, "numberIn", "fadeUp"), 1, { y: 40 }));
        if (MD.parseNumber(s.value)) e.push(ev(t0, ".val", T(c, "number", "count"), 1, {}, sfxOf(c, "count"), "end"));
        if (s.label) e.push(ev(t0 + 0.45, ".label", T(c, "body", "fadeUp"), MD.count(s.label)));
        return e;
      },
    },
    list: {
      fields: ["title", "items"],
      min: (s) => Math.max(2.4, (s.title ? readSecs(s.title) * 0.5 : 0) + (s.items || []).reduce((a, x) => a + 0.28 + MD.count(x) * 0.18, 0) + 0.6),
      markup: (s, c) => `<div class="k k-list"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="22">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<ul class="items">${(s.items || []).map((x, i) => `<li class="it" data-i="${i}"><span class="bul">${c.icon ? c.icon(c.listIcon || "check") : ""}</span><span class="tx">${MD.tx(x)}</span></li>`).join("")}</ul></div></div>`,
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.15;
        if (s.title) { const te = titleEvent(c, s, t, s.title, ".title"); e.push(te); t = after(te) - 0.25; }
        const n = (s.items || []).length;
        const gap = Math.min(0.55, Math.max(0.22, (dur - t - 1.2) / Math.max(1, n)));
        (s.items || []).forEach((x, i) => e.push(ev(t + i * gap, `.it[data-i="${i}"]`, T(c, "item", "fadeUp"), 1, { y: 20 }, sfxOf(c, "item"), "start")));
        return e;
      },
    },
    steps: {
      fields: ["title", "items"],
      min: (s) => MD.kinds.list.min(s) + 0.3,
      markup: (s, c) => `<div class="k k-steps"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="20">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<ol class="items">${(s.items || []).map((x, i) => `<li class="it" data-i="${i}"><span class="no">${String(i + 1).padStart(2, "0")}</span><span class="tx">${MD.tx(x)}</span></li>`).join("")}</ol></div></div>`,
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.15;
        if (s.title) { const te = titleEvent(c, s, t, s.title, ".title"); e.push(te); t = after(te) - 0.25; }
        const n = (s.items || []).length;
        const gap = Math.min(0.7, Math.max(0.3, (dur - t - 1.2) / Math.max(1, n)));
        (s.items || []).forEach((x, i) => e.push(ev(t + i * gap, `.it[data-i="${i}"]`, T(c, "card", "rise"), 1, {}, sfxOf(c, "card"), "start")));
        return e;
      },
    },
    screen: {
      fields: ["kicker", "title", "sub", "media", "callouts"],
      min: (s) => Math.max(2.8, (s.title ? readSecs(s.title) : 0) + (s.callouts || []).length * 0.5 + 1.1),
      markup: (s, c) => {
        const side = s.side === "left" ? "media-left" : "media-right";
        const calls = (s.callouts || []).map((x, i) => `<div class="call" data-i="${i}">${MD.tx(x)}</div>`).join("");
        const text = s.title || s.sub || s.kicker ? `<div class="copy">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="${c.fmt === "landscape" ? 46 : 18}">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}</div>` : "";
        const dk = MD.deviceFor(s.media, c, { device: s.device });
        const real = MD.isReal(dk, c);
        const cls = real ? (MD.REAL[dk] === "iphone" ? "phone" : MD.REAL[dk]) : dk;
        return `<div class="k k-screen ${side} dev-${cls}${real ? " dev-real" : ""}${text ? "" : " no-copy"}">${text}<div class="stagebox"><div class="devwrap${real ? " real-wrap" : ""}">${real ? `<div class="devbox" style="--ar:${MD.devAr(dk, c)}">` : ""}${MD.device(s.media, c, { device: dk, url: s.url })}<div class="calls">${calls}</div>${real ? "</div>" : ""}</div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.1;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        e.push(ev(0.05, ".devwrap", T(c, "media", "rise"), 1, {}, sfxOf(c, "media"), "start"));
        if (s.title) { const te = titleEvent(c, s, 0.3, s.title, ".title"); e.push(te); t = after(te); }
        if (s.sub) e.push(ev(Math.max(0.6, t - 0.2), ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        e.push(ev(0.2, ".pan", s.move === "still" ? "show" : "pan", 1, { d: Math.max(1, dur - 0.4) }));
        const n = (s.callouts || []).length;
        const start = Math.max(1.0, t);
        const gap = n ? Math.min(0.9, Math.max(0.45, (dur - start - 1) / n)) : 0;
        (s.callouts || []).forEach((x, i) => e.push(ev(start + i * gap, `.call[data-i="${i}"]`, T(c, "callout", "pop"), 1, {}, sfxOf(c, "callout"), "start")));
        return e;
      },
    },
    screens: {
      fields: ["title", "media"],
      min: (s) => Math.max(2.8, (s.title ? readSecs(s.title) : 0) + [].concat(s.media || []).length * 0.3 + 1.0),
      markup: (s, c) => {
        const ms = [].concat(s.media || []).slice(0, 5);
        const dk = s.device || "phone", real = MD.isReal(dk, c);
        return `<div class="k k-screens dev-${MD.REAL[dk] === "iphone" ? "phone" : dk}${real ? " dev-real" : ""} n${ms.length}">${s.title ? `<h2 class="title" data-fit data-maxh="16">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="row">${ms.map((m, i) => `<div class="devwrap${real ? " real-wrap" : ""}" data-i="${i}" style="--i:${i};--n:${ms.length}">${real ? `<div class="devbox" style="--ar:${MD.devAr(dk, c)}">` : ""}${MD.device(m, c, { device: dk })}${real ? "</div>" : ""}</div>`).join("")}</div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        const ms = [].concat(s.media || []).slice(0, 5);
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        ms.forEach((m, i) => e.push(ev(0.3 + i * 0.14, `.devwrap[data-i="${i}"]`, T(c, "media", "rise"), 1, {}, i === 0 ? sfxOf(c, "media") : sfxOf(c, "card"), "start")));
        return e;
      },
    },
    features: {
      fields: ["title", "items"],
      min: (s) => Math.max(2.8, (s.title ? readSecs(s.title) * 0.5 : 0) + (s.items || []).reduce((a, x) => a + 0.3 + MD.count((x.title || "") + " " + (x.text || "")) * 0.16, 0) + 0.6),
      markup: (s, c) => `<div class="k k-features n${(s.items || []).length}"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="18">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="grid">${(s.items || []).map((x, i) => `<div class="card" data-i="${i}">${x.icon && c.icon ? `<span class="ic">${c.icon(x.icon)}</span>` : ""}<h3 class="ct">${MD.tx(x.title)}</h3>${x.text ? `<p class="cx">${MD.tx(x.text)}</p>` : ""}</div>`).join("")}</div></div></div>`,
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.15;
        if (s.title) { const te = titleEvent(c, s, t, s.title, ".title"); e.push(te); t = after(te) - 0.3; }
        const n = (s.items || []).length;
        const gap = Math.min(0.45, Math.max(0.18, (dur - t - 1.4) / Math.max(1, n)));
        (s.items || []).forEach((x, i) => e.push(ev(t + i * gap, `.card[data-i="${i}"]`, T(c, "card", "rise"), 1, {}, sfxOf(c, "card"), "start")));
        return e;
      },
    },
    compare: {
      fields: ["title", "before", "after"],
      min: (s) => Math.max(3.2, 1.2 + ((s.before && s.before.items) || []).length * 0.3 + ((s.after && s.after.items) || []).length * 0.4),
      markup: (s, c) => {
        const col = (side, d) => `<div class="col ${side}"><div class="lbl">${MD.tx((d && d.label) || (side === "before" ? "Before" : "After"))}</div><ul>${((d && d.items) || []).map((x, i) => `<li data-i="${i}"><span class="tx">${MD.tx(x)}${side === "before" ? '<i class="strike"></i>' : ""}</span></li>`).join("")}</ul></div>`;
        return `<div class="k k-compare"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="16">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="cols">${col("before", s.before)}${col("after", s.after)}</div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.1;
        if (s.title) { const te = titleEvent(c, s, t, s.title, ".title"); e.push(te); t = after(te) - 0.3; }
        const nb = ((s.before && s.before.items) || []).length, na = ((s.after && s.after.items) || []).length;
        e.push(ev(t, ".before", T(c, "card", "rise"), 1, {}, sfxOf(c, "card"), "start"));
        e.push(ev(t + 0.6, ".before li", "strike", nb, {}, sfxOf(c, "strike"), "start"));
        const ta = t + 0.6 + 0.12 * nb + 0.3;
        e.push(ev(ta, ".after", T(c, "card", "rise"), 1, {}, sfxOf(c, "card"), "start"));
        e.push(ev(ta + 0.25, ".after li", "fadeUp", na, { y: 14, st: 0.12 }, null));
        return e;
      },
    },
    quote: {
      fields: ["text", "name", "role", "media"],
      min: (s) => Math.max(2.4, readSecs(s.text) + 0.6),
      markup: (s, c) => `<div class="k k-quote"><div class="box"><span class="qm">“</span><blockquote class="title" data-fit data-maxh="${c.fmt === "portrait" ? 52 : 50}">${MD.tx(s.text, { split: splitFor(T(c, "quote", "blurIn")) })}</blockquote><div class="by">${s.media ? `<span class="av">${MD.media(s.media, c)}</span>` : ""}<span class="nm">${esc(s.name || "")}</span>${s.role ? `<span class="rl">${esc(s.role)}</span>` : ""}</div></div></div>`,
      plan: (s, c) => {
        const e = [ev(0.05, ".qm", "fadeIn", 1, { d: 0.8 })];
        const m = T(c, "quote", "blurIn");
        const te = ev(0.2, ".title", m, MD.count(s.text, splitFor(m)), (c.O && c.O.quote) || {}, sfxOf(c, "quote"), "start");
        e.push(te, ...emphEvents(s, c, s.text, ".title", after(te) - 0.2));
        e.push(ev(after(te) - 0.2, ".by", "fadeUp", 1, { y: 14 }));
        return e;
      },
    },
    chart: {
      fields: ["title", "bars", "unit"],
      min: (s) => Math.max(2.8, (s.title ? readSecs(s.title) * 0.6 : 0) + (s.bars || []).length * 0.2 + 1.4),
      markup: (s, c) => {
        const bars = s.bars || [];
        const max = Math.max(1, ...bars.map((b) => Math.abs(+b.value || 0)));
        const hiIdx = bars.reduce((bi, b, i) => (+b.value > +(bars[bi] || {}).value ? i : bi), 0);
        return `<div class="k k-chart n${bars.length}"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="16">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="plot">${bars.map((b, i) => {
          const p = MD.parseNumber(b.value) || { pre: "", to: +b.value || 0, dec: 0, suf: "", sep: false };
          const shown = b.display || `${b.value}${s.unit || ""}`;
          const dp = MD.parseNumber(shown) || p;
          return `<div class="bar${b.highlight || (b.highlight == null && i === hiIdx) ? " hi" : ""}" data-i="${i}" style="--v:${(Math.abs(p.to) / max).toFixed(4)}"><div class="bv"><span class="pre">${esc(dp.pre)}</span><span class="val" data-to="${dp.to}" data-dec="${dp.dec}" data-sep="${dp.sep ? 1 : 0}">${MD.formatNumber(dp.to, dp.dec, dp.sep)}</span><span class="suf">${esc(dp.suf)}</span></div><div class="col"><i class="fill"></i></div><div class="bl">${esc(b.label || "")}</div></div>`;
        }).join("")}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        let t = 0.1;
        if (s.title) { const te = titleEvent(c, s, t, s.title, ".title"); e.push(te); t = after(te) - 0.35; }
        const n = (s.bars || []).length;
        e.push(ev(t, ".bl", "fadeIn", n, { st: 0.08 }));
        e.push(ev(t + 0.1, ".fill", "grow", n, { d: 1.2, st: 0.12 }, sfxOf(c, "bars"), "start"));
        e.push(ev(t + 0.1, ".val", "count", 1, { d: 1.2 + 0.12 * (n - 1) }));
        e.push(ev(t + 0.1, ".bv", "fadeIn", n, { st: 0.12, d: 0.4 }));
        return e;
      },
    },
    logo: {
      fields: ["media", "text", "sub"],
      min: () => 2.0,
      markup: (s, c) => `<div class="k k-logo"><div class="box">${s.media ? `<div class="mark">${MD.media(s.media, c)}</div>` : ""}${s.text ? `<div class="title wordmark" data-fit data-maxh="30">${MD.tx(s.text, { split: "chars" })}</div>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}</div></div>`,
      plan: (s, c) => {
        const e = [];
        if (s.media) e.push(ev(0.15, ".mark", T(c, "logo", "scaleIn"), 1, {}, sfxOf(c, "logo"), "start"));
        if (s.text) e.push(ev(s.media ? 0.45 : 0.15, ".wordmark", T(c, "wordmark", "charRise"), MD.count(s.text, "chars"), {}, s.media ? null : sfxOf(c, "logo"), "start"));
        if (s.sub) e.push(ev(1.0, ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        return e;
      },
    },
    outro: {
      fields: ["kicker", "text", "cta", "url", "media"],
      min: (s) => Math.max(2.4, readSecs(s.text) + (s.cta ? 0.6 : 0) + (s.url ? 0.4 : 0)),
      markup: (s, c) => `<div class="k k-outro"><div class="box">${s.media ? `<div class="mark">${MD.media(s.media, c)}</div>` : ""}${kicker(s, c)}${s.text ? `<h2 class="title" data-fit data-maxh="${c.fmt === "portrait" ? 40 : 38}">${MD.tx(s.text, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.cta ? `<div class="cta"><span>${esc(s.cta)}</span></div>` : ""}${s.url ? `<div class="url">${esc(s.url)}</div>` : ""}</div></div>`,
      plan: (s, c) => {
        const e = [];
        let t = 0.1;
        if (s.media) { e.push(ev(t, ".mark", T(c, "logo", "scaleIn"), 1, {}, sfxOf(c, "logo"), "start")); t += 0.35; }
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.text) { const te = titleEvent(c, s, t + 0.1, s.text, ".title"); e.push(te, ...emphEvents(s, c, s.text, ".title", after(te) - 0.2)); t = after(te) - 0.2; }
        if (s.cta) { e.push(ev(t, ".cta", T(c, "cta", "pop"), 1, {}, sfxOf(c, "cta"), "start")); t += 0.35; }
        if (s.url) e.push(ev(t, ".url", "fadeUp", 1, { y: 12 }));
        return e;
      },
    },
    line: {
      fields: ["kicker", "title", "values", "labels", "unit", "prefix", "note"],
      min: (s) => Math.max(3.2, (s.title ? readSecs(s.title) * 0.6 : 0) + 2.2),
      markup: (s, c) => {
        const num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.\-]/g, "")) || 0);
        const vals = (s.values || []).map(num);
        const top = Math.max(1, ...vals) * 1.1;
        const labels = s.labels || [];
        const last = vals.length ? s.values[s.values.length - 1] : 0;
        const p = MD.parseNumber(`${s.prefix || ""}${last}${s.unit || ""}`) || { pre: "", to: num(last), dec: 0, suf: "", sep: false };
        const endVal = `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>`;
        return `<div class="k k-line"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="16">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="dt-frame"><div class="plot dl-plot" data-values="${esc(JSON.stringify(vals))}" data-top="${top}"><svg preserveAspectRatio="none"><path class="dl-area"/><path class="dl-line"/>${vals.map(() => '<circle class="dl-pt" r="5"/>').join("")}</svg><i class="dl-dot"></i><div class="dl-end"><div class="bv">${endVal}</div></div></div><div class="dl-x">${labels.map((l) => `<span>${esc(l)}</span>`).join("")}</div></div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        let t = 0.1;
        if (s.kicker) e.push(ev(0.05, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) { const te = titleEvent(c, s, 0.1, s.title, ".title"); e.push(te); t = after(te) - 0.3; }
        e.push(ev(t, ".dl-x span", "fadeIn", Math.max(1, (s.labels || []).length), { st: 0.05, d: 0.4 }));
        e.push(ev(t + 0.2, ".dl-plot", "lineDraw", 1, { d: 1.8 }, sfxOf(c, "bars"), "start"));
        e.push(ev(t + 0.2, ".dl-end .val", "count", 1, { d: 1.8 }));
        return e;
      },
    },
    donut: {
      fields: ["kicker", "title", "value", "label"],
      min: (s) => Math.max(2.8, 1.8 + readSecs(s.label || "") * 0.5),
      markup: (s, c) => {
        const p = MD.parseNumber(s.value) || { pre: "", to: 0, dec: 0, suf: "%", sep: false };
        const share = /%/.test(p.suf) ? p.to / 100 : Math.min(1, p.to);
        const num = `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>`;
        return `<div class="k k-donut"><div class="dd-wrap"><div class="dd-ring"><svg viewBox="0 0 100 100"><circle class="dd-track" cx="50" cy="50" r="42"/><circle class="dd-arc" cx="50" cy="50" r="42" data-share="${share.toFixed(4)}"/></svg><div class="dd-num">${num}</div></div><div class="dd-copy">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="20">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.label ? `<p class="label">${MD.tx(s.label)}</p>` : ""}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [ev(0.1, ".dd-ring", "scaleIn", 1, { d: 0.7 }), ev(0.25, ".dd-arc", "ring", 1, { d: 1.6 }, sfxOf(c, "count"), "end"), ev(0.25, ".dd-num .val", "count", 1, { d: 1.6 })];
        if (s.kicker) e.push(ev(0.2, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.3, s.title, ".title"));
        if (s.label) e.push(ev(0.85, ".label", T(c, "body", "fadeUp"), MD.count(s.label)));
        return e;
      },
    },
    rank: {
      fields: ["kicker", "title", "items", "unit", "prefix"],
      min: (s) => Math.max(3.0, (s.title ? readSecs(s.title) * 0.5 : 0) + (s.items || []).length * 0.28 + 1.2),
      markup: (s, c) => {
        const num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.\-]/g, "")) || 0);
        const items = (s.items || []).map((x) => (typeof x === "string" ? { label: x, value: 0 } : x));
        const max = Math.max(1, ...items.map((x) => Math.abs(num(x.value))));
        const hi = items.reduce((bi, x, i) => (num(x.value) > num((items[bi] || {}).value) ? i : bi), 0);
        return `<div class="k k-rank"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="16">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="rk-rows">${items.map((x, i) => {
          const p = MD.parseNumber(`${s.prefix || ""}${x.display || x.value}${s.unit || ""}`) || { pre: "", to: num(x.value), dec: 0, suf: "", sep: false };
          return `<div class="rk${(x.highlight != null ? x.highlight : i === hi) ? " hi" : ""}" data-i="${i}"><span class="rl">${esc(x.label)}</span><span class="rt"><i class="rf" style="--v:${(Math.abs(num(x.value)) / max).toFixed(4)}"></i></span><span class="bv"><span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span></span></div>`;
        }).join("")}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        let t = 0.1;
        if (s.kicker) e.push(ev(0.05, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) { const te = titleEvent(c, s, 0.1, s.title, ".title"); e.push(te); t = after(te) - 0.3; }
        const n = (s.items || []).length;
        e.push(ev(t, ".rl", "fadeUp", n, { y: 10, st: 0.08, d: 0.5 }));
        e.push(ev(t + 0.15, ".rf", "growX", n, { d: 1.1, st: 0.09 }, sfxOf(c, "bars"), "start"));
        e.push(ev(t + 0.15, ".bv", "fadeIn", n, { st: 0.09, d: 0.4 }));
        e.push(ev(t + 0.15, ".val", "count", n, { d: 1.1 + 0.09 * (n - 1) }));
        return e;
      },
    },
    // Polymathic Investigative Director Kind 1: Counter-Intuitive Premise Inversion (Myth vs Empirical Anomaly)
    anomaly: {
      label: "Premise Inversion",
      fields: ["kicker", "myth", "text", "value", "label"],
      min: (s) => Math.max(3.4, readSecs(s.myth || "") * 0.7 + readSecs(s.text || s.title || "") + 1.0),
      markup: (s, c) => {
        const claim = s.text || s.title || "";
        const p = s.value ? MD.parseNumber(s.value) : null;
        const badge = s.value ? `<div class="an-stat"><div class="an-val">${p ? `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>` : esc(s.value)}</div>${s.label ? `<div class="an-lbl">${MD.tx(s.label)}</div>` : ""}</div>` : "";
        return `<div class="k k-anomaly"><div class="box">${kicker(s, c)}${s.myth ? `<div class="an-myth"><span class="an-tag">COMMON ASSUMPTION</span><p class="an-myth-tx"><span class="tx">${MD.tx(s.myth)}<i class="strike"></i></span></p></div>` : ""}<div class="an-truth"><span class="an-tag truth">EMPIRICAL ANOMALY</span><h2 class="title" data-fit data-maxh="${s.value ? 34 : 46}">${MD.tx(claim, { split: splitFor(T(c, "title", "maskUp")) })}</h2>${badge}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.myth) {
          e.push(ev(0.15, ".an-myth", "fadeUp", 1, { y: 18 }));
          e.push(ev(0.85, ".an-myth", "strike", 1, { d: 0.45 }, sfxOf(c, "strike") || "scratch", "start"));
          t = 1.15;
        }
        e.push(ev(t, ".an-truth .an-tag", "fadeIn", 1, { d: 0.35 }));
        const claim = s.text || s.title || "";
        const te = titleEvent(c, s, t + 0.1, claim, ".title");
        e.push(te, ...emphEvents(s, c, claim, ".title", after(te) - 0.2));
        if (s.value) {
          e.push(ev(t + 0.35, ".an-stat", T(c, "card", "pop"), 1, {}, sfxOf(c, "count") || "thump", "start"));
          if (MD.parseNumber(s.value)) e.push(ev(t + 0.35, ".an-stat .val", "count", 1, { d: 1.4 }));
        }
        return e;
      },
    },
    // Polymathic Investigative Director Kind 2: The Telescoping Scale Jump (Micro -> Meso -> Macro)
    telescope: {
      label: "Telescoping Scale Jump",
      fields: ["kicker", "title", "items"],
      min: (s) => Math.max(3.8, (s.title ? readSecs(s.title) * 0.5 : 0) + 2.8),
      markup: (s, c) => {
        const raw = s.scales || s.items || [
          "10⁻⁷ m | Micro Object | Tactile sensory anchor",
          "10⁰ m | Physical Law | Mechanical coupling",
          "10⁷ m | Macro System | Geopolitical architecture",
        ];
        const tiers = ["MICRO ANCHOR", "PHYSICAL MECHANISM", "MACRO ARCHITECTURE"];
        const nodes = raw.slice(0, 4).map((it, i) => {
          if (typeof it === "string") {
            const parts = it.split("|").map((x) => x.trim());
            if (parts.length >= 3) return { scale: parts[0], title: parts[1], text: parts.slice(2).join(" ") };
            if (parts.length === 2) return { scale: tiers[i] || `10^${i * 4}`, title: parts[0], text: parts[1] };
            return { scale: tiers[i] || `STAGE 0${i + 1}`, title: parts[0], text: "" };
          }
          return { scale: it.scale || tiers[i] || `STAGE 0${i + 1}`, title: it.title || it.label || "", text: it.text || it.sub || "" };
        });
        return `<div class="k k-telescope"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="18">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ts-stage"><svg class="ts-rings" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet"><circle class="ts-c c1" cx="100" cy="110" r="32"/><circle class="ts-c c2" cx="300" cy="110" r="58"/><circle class="ts-c c3" cx="500" cy="110" r="88"/><line class="ts-ln" x1="132" y1="110" x2="242" y2="110"/><line class="ts-ln" x1="358" y1="110" x2="412" y2="110"/></svg><div class="ts-grid">${nodes.map((nd, i) => `<div class="ts-card" data-i="${i}"><div class="ts-head"><span class="ts-idx">0${i + 1}</span><span class="ts-mag">${esc(nd.scale)}</span></div><h3 class="ts-ct">${MD.tx(nd.title)}</h3>${nd.text ? `<p class="ts-cx">${MD.tx(nd.text)}</p>` : ""}</div>`).join("")}</div></div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) { const te = titleEvent(c, s, 0.12, s.title, ".title"); e.push(te); t = after(te) - 0.25; }
        e.push(ev(t, ".ts-rings", "draw", 1, { d: 1.5 }));
        const n = Math.min(4, (s.scales || s.items || [1, 2, 3]).length);
        const gap = Math.min(0.65, Math.max(0.32, (dur - t - 1.2) / Math.max(1, n)));
        for (let i = 0; i < n; i++) {
          e.push(ev(t + 0.15 + i * gap, `.ts-card[data-i="${i}"]`, T(c, "card", "rise"), 1, {}, sfxOf(c, "card") || "blip", "start"));
        }
        return e;
      },
    },
    // Polymathic Investigative Director Kind 3: The "McPhee Pivot" (Structural Braiding of 2 Timelines)
    pivot: {
      label: "McPhee Structural Pivot",
      fields: ["kicker", "title", "before", "after"],
      min: (s) => Math.max(3.6, (s.title ? readSecs(s.title) * 0.5 : 0) + 2.4),
      markup: (s, c) => {
        const A = s.threadA || s.before || { label: "TIMELINE A · PHYSICAL SYSTEM", items: ["Micro-scale mechanical tension"] };
        const B = s.threadB || s.after || { label: "TIMELINE B · GEOPOLITICAL SHIFT", items: ["Macro-scale structural rupture"] };
        const renderCol = (cls, d, defLbl) => {
          const items = Array.isArray(d.items) ? d.items : (d.text ? [d.text] : []);
          return `<div class="pv-col ${cls}"><div class="pv-hdr"><span class="pv-lbl">${esc(d.label || defLbl)}</span>${d.time || d.year ? `<span class="pv-yr">${esc(d.time || d.year)}</span>` : ""}</div>${d.title ? `<h3 class="pv-sub">${MD.tx(d.title)}</h3>` : ""}<ul>${items.map((x, i) => `<li data-i="${i}">${MD.tx(x)}</li>`).join("")}</ul></div>`;
        };
        return `<div class="k k-pivot"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="18">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="pv-braid">${renderCol("pv-a", A, "TIMELINE A")}<div class="pv-lock"><i class="pv-line"></i><span class="pv-node">PIVOT</span><i class="pv-line"></i></div>${renderCol("pv-b", B, "TIMELINE B")}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) { const te = titleEvent(c, s, 0.12, s.title, ".title"); e.push(te); t = after(te) - 0.3; }
        e.push(ev(t, ".pv-a", "slingshot", 1, { dir: 1, d: 0.75 }, sfxOf(c, "card") || "swish", "start"));
        e.push(ev(t + 0.38, ".pv-lock", "pop", 1, { d: 0.52 }, "thump", "start"));
        e.push(ev(t + 0.52, ".pv-b", "slingshot", 1, { dir: -1, d: 0.75 }, sfxOf(c, "card") || "swish", "start"));
        return e;
      },
    },
    // Polymathic Investigative Director Kind 4: Signature Telemetry Overlay & Vector Schematic
    telemetry: {
      label: "Telemetry & Vector Schematic",
      fields: ["kicker", "title", "sub", "media", "callouts"],
      min: (s) => Math.max(3.4, (s.title ? readSecs(s.title) * 0.6 : 0) + (s.callouts || []).length * 0.45 + 1.4),
      markup: (s, c) => {
        const diagType = s.diagram || "phase";
        const svgDiag = () => {
          if (diagType === "optics") {
            return `<svg class="tm-svg" viewBox="0 0 640 360"><rect class="tm-box" x="16" y="16" width="608" height="328" rx="6"/><ellipse class="tm-lens" cx="260" cy="180" rx="28" ry="125"/><ellipse class="tm-lens l2" cx="410" cy="180" rx="22" ry="105"/><path class="tm-ray r1" d="M40,95 L260,110 L410,165 L590,180"/><path class="tm-ray r2" d="M40,180 L260,180 L410,180 L590,180"/><path class="tm-ray r3" d="M40,265 L260,250 L410,195 L590,180"/><circle class="tm-focal" cx="590" cy="180" r="9"/><line class="tm-ret" x1="590" y1="40" x2="590" y2="320"/></svg>`;
          }
          if (diagType === "spectrum") {
            return `<svg class="tm-svg" viewBox="0 0 640 360"><rect class="tm-box" x="16" y="16" width="608" height="328" rx="6"/><path class="tm-ray r1" d="M40,240 Q95,80 140,210 T240,110 T340,230 T440,70 T540,195 L600,220"/><path class="tm-ray r2" d="M40,280 Q110,190 180,250 T320,160 T460,240 L600,275"/><line class="tm-ret" x1="440" y1="36" x2="440" y2="324"/><circle class="tm-focal" cx="440" cy="70" r="8"/></svg>`;
          }
          if (diagType === "network") {
            return `<svg class="tm-svg" viewBox="0 0 640 360"><rect class="tm-box" x="16" y="16" width="608" height="328" rx="6"/><line class="tm-ray r2" x1="130" y1="110" x2="310" y2="95"/><line class="tm-ray r2" x1="130" y1="110" x2="240" y2="255"/><line class="tm-ray r1" x1="310" y1="95" x2="495" y2="165"/><line class="tm-ray r1" x1="240" y1="255" x2="495" y2="165"/><line class="tm-ray r3" x1="310" y1="95" x2="240" y2="255"/><circle class="tm-node" cx="130" cy="110" r="14"/><circle class="tm-node" cx="310" cy="95" r="18"/><circle class="tm-node" cx="240" cy="255" r="15"/><circle class="tm-focal" cx="495" cy="165" r="22"/></svg>`;
          }
          return `<svg class="tm-svg" viewBox="0 0 640 360"><rect class="tm-box" x="16" y="16" width="608" height="328" rx="6"/><path class="tm-ray r1" d="M120,260 C110,90 290,50 320,180 C350,310 530,270 520,110 C510,40 360,70 320,180 C280,290 140,300 190,155"/><circle class="tm-focal" cx="320" cy="180" r="8"/><circle class="tm-node" cx="520" cy="110" r="7"/><line class="tm-ret" x1="320" y1="32" x2="320" y2="328"/><line class="tm-ret" x1="48" y1="180" x2="592" y2="180"/></svg>`;
        };
        const visual = s.media ? `<div class="tm-media">${MD.media(s.media, c)}<i class="tm-crosshair"></i></div>` : `<div class="tm-schem">${svgDiag()}</div>`;
        const calls = (s.callouts || []).map((x, i) => `<div class="tm-call" data-i="${i}"><span class="tm-cidx">0${i + 1}</span><span>${MD.tx(x)}</span></div>`).join("");
        const metrics = (s.metrics || []).map((m, i) => `<div class="tm-met" data-i="${i}"><span class="tm-ml">${esc(m.label || "")}</span><span class="tm-mv">${esc(m.value || "")}</span></div>`).join("");
        return `<div class="k k-telemetry"><div class="tm-layout"><div class="tm-copy">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="38">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}${metrics ? `<div class="tm-metrics">${metrics}</div>` : ""}${calls ? `<div class="tm-calls">${calls}</div>` : ""}</div><div class="tm-stage">${visual}</div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) { const te = titleEvent(c, s, 0.15, s.title, ".title"); e.push(te); t = after(te) - 0.25; }
        if (s.sub) e.push(ev(Math.max(0.45, t), ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        if (s.media) e.push(ev(0.15, ".tm-media", T(c, "media", "scaleIn"), 1, {}, sfxOf(c, "media"), "start"));
        else e.push(ev(0.15, ".tm-schem", "draw", 1, { d: 1.6 }, sfxOf(c, "media") || "riser-air", "start"));
        const nm = (s.metrics || []).length;
        if (nm) e.push(ev(t + 0.2, ".tm-met", "fadeUp", nm, { st: 0.1 }));
        const nc = (s.callouts || []).length;
        const gap = nc ? Math.min(0.65, Math.max(0.3, (dur - t - 1.1) / nc)) : 0;
        (s.callouts || []).forEach((x, i) => e.push(ev(t + 0.35 + i * gap, `.tm-call[data-i="${i}"]`, T(c, "callout", "pop"), 1, {}, sfxOf(c, "callout") || "blip", "start")));
        return e;
      },
    },
    // Vox Mixed-Media & Cutout Collage Kind (supports single or layered JPG/PNG cutouts + raw MP4 footage + SVG chalk annotations)
    collage: {
      label: "Vox Mixed-Media Collage",
      fields: ["kicker", "title", "sub", "media", "callouts"],
      min: (s) => Math.max(3.4, (s.title ? readSecs(s.title) * 0.6 : 0) + (s.callouts || []).length * 0.4 + 1.4),
      markup: (s, c) => {
        const ms = [].concat(s.media || []).filter(Boolean).slice(0, 3);
        const isColor = s.color ? " is-color" : "";
        const annType = s.annotation || "circle";
        const chalkSvg = annType === "arrow"
          ? `<svg class="vx-chalk" viewBox="0 0 320 220"><path class="vx-ch-path" d="M35,175 Q140,45 255,95"/><path class="vx-ch-path" d="M230,72 L262,98 L224,114"/></svg>`
          : `<svg class="vx-chalk" viewBox="0 0 320 220"><path class="vx-ch-path" d="M160,26 C245,22 296,62 292,112 C288,165 232,198 154,194 C75,190 26,154 30,104 C34,56 92,28 172,32"/></svg>`;
        const stageHtml = ms.length
          ? `<div class="vx-stack n${ms.length}">${ms.map((m, i) => `<div class="vx-cutout-card c${i}${isColor}" data-i="${i}">${MD.media(m, c)}</div>`).join("")}${chalkSvg}</div>`
          : `<div class="vx-stack n1"><div class="vx-cutout-card c0"><svg class="vx-archival-svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#EAE4D3"/><circle cx="240" cy="145" r="78" fill="#18181B"/><path d="M90,305 L165,165 L235,235 L315,130 L405,305 Z" fill="#3F3C37"/><rect x="34" y="24" width="140" height="26" fill="#FACC15"/><text x="44" y="42" font-family="monospace" font-size="14" font-weight="bold" fill="#18181B">EXHIBIT A // CUTOUT</text></svg></div>${chalkSvg}</div>`;
        const calls = (s.callouts || []).map((x, i) => `<div class="vx-call" data-i="${i}"><span class="vx-cno">#0${i + 1}</span><span>${MD.tx(x)}</span></div>`).join("");
        return `<div class="k k-collage"><div class="vx-layout"><div class="vx-copy">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="40">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}${calls ? `<div class="vx-calls">${calls}</div>` : ""}</div><div class="vx-stage">${stageHtml}</div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) {
          const te = titleEvent(c, s, 0.14, s.title, ".title");
          e.push(te, ...emphEvents(s, c, s.title, ".title", after(te) - 0.25));
          t = after(te) - 0.2;
        }
        if (s.sub) e.push(ev(Math.max(0.45, t), ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        const ms = [].concat(s.media || ["default"]).slice(0, 3);
        ms.forEach((_, i) => e.push(ev(0.18 + i * 0.18, `.vx-cutout-card[data-i="${i}"], .vx-cutout-card.c${i}`, T(c, "media", "pop"), 1, {}, sfxOf(c, "media") || "card-place", "start")));
        e.push(ev(Math.max(0.65, t + 0.2), ".vx-chalk", "draw", 1, { d: 0.95 }, "scratch", "start"));
        const nc = (s.callouts || []).length;
        const gap = nc ? Math.min(0.55, Math.max(0.28, (dur - t - 1.0) / nc)) : 0;
        (s.callouts || []).forEach((x, i) => e.push(ev(t + 0.3 + i * gap, `.vx-call[data-i="${i}"]`, T(c, "callout", "pop"), 1, {}, sfxOf(c, "callout") || "tap", "start")));
        return e;
      },
    },
    // 3Blue1Brown Mathematical Animation Engine Kind (Semantic Equations, Frame-Coupled Oscillator & s-Plane Poles)
    math: {
      label: "3Blue1Brown Math & s-Plane",
      fields: ["kicker", "title", "equation", "transform", "callouts"],
      min: (s) => Math.max(4.0, (s.title ? readSecs(s.title) * 0.5 : 0) + 2.8),
      markup: (s, c) => {
        const eq1 = s.equation || "m x''(t) + μ x'(t) + k x(t) = F₀ cos(ω t)";
        const eq2 = s.transform || "X(s) = F₀ s / [(m s² + μ s + k)(s² + ω²)]";
        const sigma = s.sigma ?? 0.35, wd = s.wd ?? 3.2, wExt = s.wExt ?? 1.85;
        const calls = (s.callouts || [
          "x(t) Total Response (#58C4DD)",
          "Transient Decay e^(-σt) (#F0AC5F)",
          "Steady Forcing cos(ωt) (#FFFF00)",
          "s-Plane Poles -σ ± iω (#FC6255)",
        ]).map((x, i) => `<div class="m3-leg" data-i="${i}"><i class="m3-swatch s${i % 5}"></i><span>${MD.tx(x)}</span></div>`).join("");
        return `<div class="k k-math"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="15">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="m3-eqbar"><div class="m3-eq eq1">${esc(eq1)}</div><span class="m3-arr">⟶</span><div class="m3-eq eq2">${esc(eq2)}</div></div><div class="m3-stage" data-sigma="${sigma}" data-wd="${wd}" data-wext="${wExt}"><svg class="m3-wave-svg" viewBox="0 0 620 330"><line class="m3-axis" x1="40" y1="98" x2="600" y2="98"/><line class="m3-axis" x1="40" y1="18" x2="40" y2="178"/><text x="555" y="90" fill="#8C8881" font-family="monospace" font-size="13">t (sec)</text><text x="48" y="32" fill="#58C4DD" font-family="monospace" font-size="13">x(t)</text><path class="m3-trans" d=""/><path class="m3-steady" d=""/><path class="m3-total" d=""/><circle class="m3-tip" cx="40" cy="98" r="6"/><line class="m3-wall" x1="60" y1="204" x2="60" y2="272"/><path class="m3-spring" d="M60,238 L286,238"/><rect class="m3-mass" x="286" y="212" width="68" height="52" rx="6"/><text x="90" y="200" fill="#F0AC5F" font-family="monospace" font-size="12">COUPLED SPRING-MASS m·x'' + μ·x' + k·x</text></svg><svg class="m3-splane-svg" viewBox="0 0 320 330"><rect class="m3-sp-bg" x="15" y="15" width="290" height="300" rx="6"/><line class="m3-sp-grid" x1="15" y1="90" x2="305" y2="90"/><line class="m3-sp-grid" x1="15" y1="240" x2="305" y2="240"/><line class="m3-sp-grid" x1="95" y1="15" x2="95" y2="315"/><line class="m3-sp-grid" x1="255" y1="15" x2="255" y2="315"/><line class="m3-axis" x1="15" y1="165" x2="305" y2="165"/><line class="m3-axis" x1="195" y1="15" x2="195" y2="315"/><text x="262" y="156" fill="#8C8881" font-family="monospace" font-size="12">Re(s)</text><text x="202" y="34" fill="#8C8881" font-family="monospace" font-size="12">Im(s)</text><circle class="m3-pole-ring" cx="125" cy="78" r="16"/><circle class="m3-pole-ring" cx="125" cy="252" r="16"/><circle class="m3-pole p-damped" cx="125" cy="78" r="7"/><circle class="m3-pole p-damped" cx="125" cy="252" r="7"/><circle class="m3-pole p-forced" cx="195" cy="112" r="7"/><circle class="m3-pole p-forced" cx="195" cy="218" r="7"/></svg></div><div class="m3-legs">${calls}</div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        if (s.kicker) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        e.push(ev(0.2, ".m3-eq.eq1", "fadeUp", 1, { y: 14, d: 0.5 }));
        e.push(ev(0.75, ".m3-arr, .m3-eq.eq2", "fadeUp", 2, { y: 14, st: 0.12, d: 0.55 }, "bell", "start"));
        e.push(ev(0.3, ".m3-stage", "mathOsc", 1, { d: Math.max(2.2, dur - 0.6) }, "riser-air", "start"));
        e.push(ev(0.5, ".m3-pole", "pop", 4, { st: 0.12 }, "blip", "start"));
        e.push(ev(0.65, ".m3-leg", "fadeUp", 4, { st: 0.1, y: 12 }));
        return e;
      },
    },
    // Geographic Map & Route Flyover Kind (Vox / Johnny Harris / Remotion Maps style)
    map: {
      label: "Geographic Map & Route Flyover",
      fields: ["kicker", "title", "sub", "origin", "dest", "routes", "metrics", "callouts"],
      min: (s) => Math.max(3.8, (s.title ? readSecs(s.title) * 0.5 : 0) + 2.6),
      markup: (s, c) => {
        const orig = s.origin || { name: "ORIGIN HUB", coord: "22.3°N, 87.3°E", x: 640, y: 215 };
        const dest = s.dest || { name: "TARGET NODE", coord: "37.7°N, 122.4°W", x: 185, y: 165 };
        const ox = orig.x ?? 640, oy = orig.y ?? 215;
        const dx = dest.x ?? 185, dy = dest.y ?? 165;
        const mx = (ox + dx) / 2, my = Math.min(oy, dy) - 85;
        const mets = (s.metrics || [
          { label: "ORIGIN", value: orig.coord || "22.3°N, 87.3°E" },
          { label: "DESTINATION", value: dest.coord || "37.7°N, 122.4°W" },
          { label: "VECTOR SPAN", value: s.distance || "12,480 KM" },
        ]).map((m) => `<div class="mp-m"><span class="mp-ml">${esc(m.label)}</span><strong class="mp-mv">${esc(m.value)}</strong></div>`).join("");
        const calls = (s.callouts || []).map((x, i) => `<div class="mp-call" data-i="${i}"><span class="mp-cno">0${i + 1}</span><span>${MD.tx(x)}</span></div>`).join("");
        return `<div class="k k-map"><div class="mp-layout"><div class="mp-copy">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="34">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}<div class="mp-mets">${mets}</div>${calls ? `<div class="mp-calls">${calls}</div>` : ""}</div><div class="mp-stage"><div class="mp-cam"><svg class="mp-svg" viewBox="0 0 860 440"><defs><radialGradient id="mpGlow" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs><rect class="mp-ocean" width="860" height="440" rx="10"/><g class="mp-grid"><line x1="0" y1="110" x2="860" y2="110"/><line x1="0" y1="220" x2="860" y2="220"/><line x1="0" y1="330" x2="860" y2="330"/><line x1="215" y1="0" x2="215" y2="440"/><line x1="430" y1="0" x2="430" y2="440"/><line x1="645" y1="0" x2="645" y2="440"/></g><g class="mp-land"><path d="M95,95 L235,80 L285,155 L240,235 L180,225 L120,165 Z"/><path d="M235,250 L295,265 L315,365 L265,405 L230,335 Z"/><path d="M395,85 L495,75 L525,155 L465,180 L405,155 Z"/><path d="M415,190 L515,195 L535,315 L475,375 L425,295 Z"/><path d="M520,80 L745,75 L785,185 L715,255 L615,245 L555,175 Z"/><path d="M675,295 L775,290 L790,365 L705,380 Z"/></g><circle cx="${mx}" cy="${(oy + dy) / 2}" r="190" fill="url(#mpGlow)"/><path class="mp-route-bg" d="M${ox},${oy} Q${mx},${my} ${dx},${dy}"/><path class="mp-route" d="M${ox},${oy} Q${mx},${my} ${dx},${dy}"/><g class="mp-pin p-orig"><circle class="mp-ring" cx="${ox}" cy="${oy}" r="22"/><circle class="mp-dot" cx="${ox}" cy="${oy}" r="7"/><rect class="mp-tag" x="${ox - 68}" y="${oy + 14}" width="136" height="24" rx="4"/><text x="${ox}" y="${oy + 30}" text-anchor="middle" class="mp-txt">${esc(orig.name)}</text></g><g class="mp-pin p-dest"><circle class="mp-ring" cx="${dx}" cy="${dy}" r="26"/><circle class="mp-dot" cx="${dx}" cy="${dy}" r="8"/><rect class="mp-tag" x="${dx - 68}" y="${dy + 14}" width="136" height="24" rx="4"/><text x="${dx}" y="${dy + 30}" text-anchor="middle" class="mp-txt">${esc(dest.name)}</text></g></svg></div></div></div></div>`;
      },
      plan: (s, c, dur) => {
        const e = [];
        let t = 0.08;
        if (s.kicker) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) {
          const te = titleEvent(c, s, 0.14, s.title, ".title");
          e.push(te, ...emphEvents(s, c, s.title, ".title", after(te) - 0.25));
          t = after(te) - 0.2;
        }
        if (s.sub) e.push(ev(Math.max(0.45, t), ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        e.push(ev(0.18, ".mp-stage", T(c, "card", "rise"), 1, {}, "whoosh", "start"));
        e.push(ev(0.35, ".p-orig", "pop", 1, {}, "blip", "start"));
        e.push(ev(0.55, ".mp-route", "draw", 1, { d: Math.min(2.2, dur * 0.48) }, "riser-air", "start"));
        e.push(ev(0.55 + Math.min(2.0, dur * 0.44), ".p-dest", "pop", 1, {}, "bell", "start"));
        e.push(ev(Math.max(0.5, t), ".mp-m", "fadeUp", 3, { st: 0.09, y: 12 }));
        (s.callouts || []).forEach((_, i) => e.push(ev(t + 0.35 + i * 0.28, `.mp-call[data-i="${i}"]`, "pop", 1, {}, "tap", "start")));
        return e;
      },
    },
    // anything the kinds above can't say: your own HTML + events, styled by the theme's tokens
    custom: {
      fields: ["html"],
      min: () => 2,
      markup: (s) => `<div class="k k-custom">${s.html || ""}</div>`,
      plan: (s) => (s.events || []).map((x) => ev(x.t || 0, x.sel, x.move, x.n || 1, x.o || {}, x.sfx || null, x.hit || "start")),
    },
  };

  // ---------- transitions ----------
  // run(tl, out, inn, at, ov, c): at = the boundary; out/inn = the .k layers of the two scenes
  MD.transitions = {
    cut: { ov: 0, run: () => {} },
    // Ben Marriott Scale/Velocity Match Cut: accelerates ~4% into the cut (Ease-In) and decelerates out of the cut (Ease-Out)
    matchCut: {
      ov: 0.32,
      run: (tl, out, inn, at, ov) => {
        const half = ov / 2;
        tl.fromTo(out, { scale: 1, opacity: 1 }, { scale: 1.045, opacity: 0, duration: half, ease: "power3.in" }, at - half);
        tl.fromTo(inn, { scale: 0.955, opacity: 0 }, { scale: 1, opacity: 1, duration: half * 1.35, ease: "expo.out" }, at - half * 0.25);
      },
    },
    fade: {
      ov: 0.5,
      run: (tl, out, inn, at, ov) => {
        tl.to(out, { opacity: 0, duration: ov, ease: "power1.inOut" }, at - ov / 2);
        tl.fromTo(inn, { opacity: 0 }, { opacity: 1, duration: ov, ease: "power1.inOut" }, at - ov / 2);
      },
    },
    blur: {
      ov: 0.7,
      run: (tl, out, inn, at, ov) => {
        tl.to(out, { opacity: 0, filter: "blur(18px)", scale: 1.04, duration: ov, ease: "power2.in" }, at - ov / 2);
        tl.fromTo(inn, { opacity: 0, filter: "blur(18px)", scale: 0.97 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ov, ease: "power2.out" }, at - ov / 4);
      },
    },
    push: {
      ov: 0.65,
      run: (tl, out, inn, at, ov, c) => {
        const k = c.fmt === "portrait" ? "yPercent" : "xPercent";
        tl.fromTo(out, { [k]: 0 }, { [k]: -100, duration: ov, ease: "expo.inOut" }, at - ov / 2);
        tl.fromTo(inn, { [k]: 100 }, { [k]: 0, duration: ov, ease: "expo.inOut" }, at - ov / 2);
      },
    },
    zoom: {
      ov: 0.6,
      run: (tl, out, inn, at, ov) => {
        tl.to(out, { scale: 1.6, opacity: 0, filter: "blur(10px)", duration: ov, ease: "power3.in" }, at - ov / 2);
        tl.fromTo(inn, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: ov, ease: "expo.out" }, at - ov / 6);
      },
    },
    // a block of colour sweeps across; the scene changes under it
    wipe: {
      ov: 0.55,
      overlay: true,
      run: (tl, out, inn, at, ov, c, i) => {
        const bar = document.querySelector(`#md-wipe-${i}`);
        if (!bar) return;
        const horiz = c.fmt !== "portrait";
        const a = horiz ? "xPercent" : "yPercent";
        tl.fromTo(bar, { [a]: -101 }, { [a]: 0, duration: ov / 2, ease: "power3.in" }, at - ov / 2);
        tl.to(bar, { [a]: 101, duration: ov / 2, ease: "power3.out" }, at);
      },
    },
    iris: {
      ov: 0.7,
      run: (tl, out, inn, at, ov) => {
        tl.fromTo(inn, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: ov, ease: "expo.inOut" }, at - ov / 2);
      },
    },
  };

  // ---------- browser: build the one timeline ----------
  MD.build = function (P, register) {
    const run = () => {
      const st = MD.styles[P.style] || {};
      MD._st = st;
      const c = { fmt: P.fmt, W: P.W, H: P.H, u: P.u, P, st };
      // fit display type to its box before anything moves (fonts are loaded by now)
      document.querySelectorAll("[data-fit]").forEach((el) => fit(el, P.u));
      // masks go on before measuring, then the type guard opens them to the real ink and
      // loosens any lines or letters that touch (type.js)
      P.scenes.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) for (const e of s.events) { const mv = (st.moves && st.moves[e.move]) || MD.moves[e.move]; if (mv && mv.mask && e.sel) el.querySelectorAll(e.sel).forEach((x) => x.classList.add("masked")); }
      });
      MD.typeFixed = MD.typeFix ? MD.typeFix(document, (b) => b.hasAttribute("data-fit") && fit(b, P.u)) : [];
      clearDecor(P);
      const tl = gsap.timeline({ paused: true });
      if (st.background && st.background.run) st.background.run(tl, c);
      const scenes = P.scenes.map((s) => document.getElementById(s.id));
      document.querySelectorAll(".md-wipe i").forEach((b) => gsap.set(b, c.fmt === "portrait" ? { yPercent: -101 } : { xPercent: -101 }));
      P.scenes.forEach((s, i) => {
        const el = scenes[i];
        if (!el) return;
        const k = el.querySelector(".k") || el;
        const tr = el.querySelector(".tr") || k;
        tl.set(el, { visibility: "visible" }, s.vis0);
        tl.set(el, { visibility: "hidden" }, s.vis1);
        if (st.scene && st.scene.run) st.scene.run(tl, el, s, c);
        if (P.drift) tl.fromTo(k, { scale: 1 }, { scale: 1 + P.drift, duration: s.vis1 - s.t0, ease: "none" }, s.t0);
        for (const e of s.events) {
          const els = e.sel ? Array.from(el.querySelectorAll(e.sel)) : [k];
          if (!els.length) continue;
          const mv = (st.moves && st.moves[e.move]) || MD.moves[e.move];
          if (!mv) continue;
          // timed moves run in their own timeline at the style's tempo; continuous ones (len 0) as written
          if (mv.len && mv.len(Math.max(1, e.n || 1), e.o || {}) > 0) {
            const sub = gsap.timeline();
            mv.run(sub, els, 0, e.o || {}, c, s);
            sub.timeScale(MD.tempo());
            tl.add(sub, s.t0 + e.t);
          } else mv.run(tl, els, s.t0 + e.t, e.o || {}, c, s);
        }
        if (i > 0) {
          const T = (st.transitions && st.transitions[s.tin]) || MD.transitions[s.tin];
          const prev = scenes[i - 1];
          if (T && prev) T.run(tl, prev.querySelector(".tr") || prev, tr, s.t0, s.ov, c, i, { outSec: prev, inSec: el });
        }
      });
      if (st.after && st.after.run) st.after.run(tl, c);
      // film grain: a new random offset 12 times a second (seeded, so every render matches)
      const grain = document.querySelector(".md-grain");
      if (grain && P.grain) {
        let seed = 11;
        const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
        for (let f = 0, n = Math.ceil(P.duration * 12); f <= n; f++) tl.set(grain, { x: (r() - 0.5) * 220, y: (r() - 0.5) * 220 }, f / 12);
      }
      // keep the timeline as long as the video
      tl.set({}, {}, P.duration);
      window.__timelines = window.__timelines || {};
      if (register) register(tl);
      else window.__timelines["main"] = tl;
      if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
      if (/[?&]sb=1/.test(location.search)) storyboardMode(tl, P);
    };
    // wait for the fonts and every image, so fitting and scrolling measure the real thing
    const imgs = Array.from(document.images).map((im) => (im.decode ? im.decode().catch(() => {}) : null));
    Promise.all([document.fonts ? document.fonts.ready : null, ...imgs]).then(run, run);
  };

  // decorative shapes ([data-decor], or children of [data-decor-group]) never sit under words:
  // each one that would is pushed out toward the nearest edge of the frame (it may bleed off it)
  function clearDecor(P) {
    const TEXT = ".title, .sub, .label, .kicker, .it, .cta, .url, .by, .ct, .cx, .bv, .bl, li, .num, .call";
    const W = P.W, H = P.H, pad = P.u * 4;
    P.scenes.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const decor = Array.from(el.querySelectorAll("[data-decor], [data-decor-group] > *"));
      if (!decor.length) return;
      const texts = Array.from(el.querySelectorAll(TEXT)).map((t) => t.getBoundingClientRect()).filter((r) => r.width > 2 && r.height > 2);
      const hit = (r) => texts.some((t) => r.right + pad > t.left && r.left - pad < t.right && r.bottom + pad > t.top && r.top - pad < t.bottom);
      for (const d of decor) {
        let r = d.getBoundingClientRect();
        if (!hit(r)) continue;
        const cx = (r.left + r.right) / 2 - W / 2, cy = (r.top + r.bottom) / 2 - H / 2;
        const len = Math.hypot(cx, cy) || 1, ux = cx / len, uy = cy / len;
        let dx = 0, dy = 0;
        for (let k = 0; k < 40 && hit(r); k++) {
          dx += ux * P.u * 2; dy += uy * P.u * 2;
          d.style.translate = `${dx}px ${dy}px`;
          r = d.getBoundingClientRect();
        }
      }
    });
  }

  // shrink display type until it fits its box: no clipped or broken words
  function fit(el, u) {
    const box = el.parentElement;
    u = parseFloat(getComputedStyle(el).getPropertyValue("--u")) || u; // a style may scale units per scene
    const maxH = (+el.dataset.maxh || 60) * u;
    let fs = parseFloat(getComputedStyle(el).fontSize);
    const min = fs * 0.3;
    // data-fit="fill": the largest size that still fits (posters fill the frame); otherwise only shrink
    const fill = el.dataset.fit === "fill";
    // a screen's title must also stay clear of the device as it is actually drawn (styles may scale it)
    const scr = el.closest(".k-screen");
    const devs = scr ? Array.from(scr.querySelectorAll(".dev, .call")) : [];
    const gap = u * 2;
    const tooBig = () => {
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > maxH + 1) return true;
      const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      const dr = devs.map((d) => d.getBoundingClientRect());
      // the words' own content box (masks and gradient fills add padding that isn't text)
      for (const w of el.querySelectorAll(".wi")) {
        const q0 = w.getBoundingClientRect(), ws = getComputedStyle(w);
        const q = { left: q0.left + (parseFloat(ws.paddingLeft) || 0), right: q0.right - (parseFloat(ws.paddingRight) || 0), top: q0.top, bottom: q0.bottom };
        if (q.right > r.right + 1 || q.left < r.left - 1 || q.right > b.right + 1) return true;
        for (const d of dr) if (q.right + gap > d.left && q.left - gap < d.right && q.bottom + gap > d.top && q.top - gap < d.bottom) return true;
      }
      return false;
    };
    if (fill) {
      let lo = u * 2, hi = (+el.dataset.maxfs || 40) * u;
      for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; el.style.fontSize = mid + "px"; if (tooBig()) hi = mid; else lo = mid; }
      el.style.fontSize = lo + "px";
      return;
    }
    let guard = 0;
    while (tooBig() && fs > min && guard++ < 60) { fs *= 0.95; el.style.fontSize = fs + "px"; }
  }

  // the storyboard page plays the composition in a plain browser: seek on demand, sync videos
  function storyboardMode(tl, P) {
    const vids = Array.from(document.querySelectorAll("video[data-start]"));
    const seek = (t) => {
      tl.seek(t, false);
      for (const v of vids) {
        const s0 = +v.dataset.start, d = +v.dataset.duration;
        const on = t >= s0 && t < s0 + d;
        v.style.visibility = on ? "visible" : "hidden";
        if (on && v.readyState >= 1) { try { v.currentTime = Math.min(t - s0, (v.duration || 1e9) - 0.05); } catch (e) {} }
      }
    };
    window.MDP = { seek, duration: P.duration, ready: true };
    seek(+(new URLSearchParams(location.search).get("t") || 0));
    window.parent && window.parent.postMessage({ md: "ready" }, "*");
  }
})(typeof window !== "undefined" ? window : globalThis);
