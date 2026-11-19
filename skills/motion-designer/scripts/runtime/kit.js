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
    let em = false, pill = false;
    for (const raw of String(line).split(/\s+/)) {
      if (!raw) continue;
      let on = em, onPill = pill;
      for (const ch of raw) {
        if (ch === "*") { em = !em; if (em) on = true; }
        if (ch === "[") { pill = true; onPill = true; }
        if (ch === "]") { pill = false; }
      }
      const w = raw.replace(/[\*\[\]]/g, "");
      if (w) out.push({ w, em: on, pill: onPill });
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
          return `<span class="w${t.em ? " em" : ""}${t.pill ? " pill" : ""}" style="--wi:${wi++}"><span class="wi">${inner}</span>${t.em ? '<i class="mk"></i>' : ""}</span>`;
        });
        return `<span class="ln">${ws.join(" ")}</span>`;
      })
      .join("");
  };
  // Vox Guide (@justdodani): Ransom-note collage lettering where every word sits on its own torn newspaper scrap
  // Official FLUXD Brand Kit Vector SVGs (Chamfered-Bracket Optical Phi-2 + Cinema-Gate Framed [ FLUXD ] Wordmark)
  // Live English Spoken Caption Strip (renders whenever s.vo is provided and captions !== "off")
  // Word-Tokenized Active Karaoke Subtitle Engine (3-5 words per phrase chunk, active word lit & scaled)
  MD.karaokeChunks = function (s, dur) {
    if (!s || !s.vo || s.captions === "off") return [];
    const totalDur = Math.max(1.5, Number(dur || s.dur || s.duration || 4.0));
    const pauseMatches = String(s.vo).match(/\[(?:AUDIO\s+)?PAUSE:\s*([\d.]+)/i);
    const pauseSec = pauseMatches ? Math.min(0.6, parseFloat(pauseMatches[1]) || 0) : 0;
    const clean = String(s.vo)
      .replace(/\[(?:AUDIO\s+)?PAUSE:[^\]]+\]/gi, "")
      .replace(/[\*\[\]`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean) return [];

    let words = [];
    if (Array.isArray(s.words) && s.words.length > 0) {
      words = s.words.map((w) => ({
        text: String(w.text || w.word || "").replace(/[\*\[\]`]/g, "").trim(),
        start: Number(w.start || 0),
        end: Number(w.end || 0.25),
      })).filter((w) => w.text);
    } else {
      const rawWords = clean.split(" ").filter(Boolean);
      const speakWindow = Math.max(1.0, totalDur - pauseSec - 0.16);
      const weights = rawWords.map((w) => Math.max(2, w.length) + (/[,;:\u2014\-]$/.test(w) ? 2.2 : /[\.\?!]$/.test(w) ? 3.0 : 0));
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      let cursor = 0.06;
      words = rawWords.map((w, idx) => {
        const wDur = (weights[idx] / totalWeight) * speakWindow;
        const st = Number(cursor.toFixed(3));
        const en = Number(Math.min(totalDur - 0.04, cursor + wDur).toFixed(3));
        cursor += wDur;
        return { text: w, start: st, end: Math.max(st + 0.08, en) };
      });
    }

    // Group into 3-5 word chunks (breaking at punctuation or 4 words)
    const chunks = [];
    let cur = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      cur.push(w);
      const hasPunct = /[,;:\u2014\.\?!]$/.test(w.text);
      const remaining = words.length - 1 - i;
      if (cur.length >= 5 || (cur.length >= 3 && hasPunct) || (cur.length === 4 && remaining >= 2)) {
        chunks.push({
          start: cur[0].start,
          end: cur[cur.length - 1].end,
          words: cur,
        });
        cur = [];
      }
    }
    if (cur.length > 0) {
      if (chunks.length > 0 && cur.length === 1) {
        chunks[chunks.length - 1].words.push(cur[0]);
        chunks[chunks.length - 1].end = cur[0].end;
      } else {
        chunks.push({
          start: cur[0].start,
          end: cur[cur.length - 1].end,
          words: cur,
        });
      }
    }
    return chunks;
  };

  MD.karaokeSub = function (s, dur) {
    const chunks = MD.karaokeChunks(s, dur);
    if (!chunks.length) return "";
    const htmlChunks = chunks.map((ch, pi) => {
      const wSpans = ch.words.map((w, wi) =>
        `<span class="kw" data-w="${wi}" data-start="${w.start.toFixed(3)}" data-end="${w.end.toFixed(3)}">${esc(w.text)}</span>`
      ).join(" ");
      return `<div class="ks-phrase" data-p="${pi}" data-pstart="${ch.start.toFixed(3)}" data-pend="${ch.end.toFixed(3)}">${wSpans}</div>`;
    }).join("");
    return `<div class="md-karaoke-sub" data-track-kind="captions" data-layout-ignore>${htmlChunks}</div>`;
  };

  MD.voCaption = function (s, dur) {
    return MD.karaokeSub(s, dur);
  };

MD.karaokeWords = function (s, dur) {
    const chs = MD.karaokeChunks(s, dur);
    const out = [];
    for (const c of chs) {
      for (const w of c.words || []) out.push({ text: w.text, start: w.start, end: w.end });
    }
    return out;
  };

  MD.fluxdPhi2 = function (cls = "fluxd-phi2-svg") {
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none"><path class="mark-body" fill="currentColor" d="M 100 48 L 72 48 L 32 88 L 32 168 L 72 208 L 100 208 L 100 176 L 84 176 L 64 156 L 64 100 L 84 80 L 100 80 Z"/><rect class="mark-accent" x="114" y="16" width="28" height="224" fill="#E04826"/><path class="mark-body" fill="currentColor" d="M 156 48 L 184 48 L 224 88 L 224 168 L 184 208 L 156 208 L 156 176 L 172 176 L 192 156 L 192 100 L 172 80 L 156 80 Z"/></svg>`;
  };
  MD.fluxdSeal = function (cls = "fluxd-seal-svg") {
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none"><rect x="12" y="12" width="232" height="232" rx="44" stroke="currentColor" stroke-width="12" fill="rgba(14,14,16,0.72)"/><g transform="translate(28, 28) scale(0.78)"><path class="mark-body" fill="currentColor" d="M 100 48 L 72 48 L 32 88 L 32 168 L 72 208 L 100 208 L 100 176 L 84 176 L 64 156 L 64 100 L 84 80 L 100 80 Z"/><rect class="mark-accent" x="114" y="16" width="28" height="224" fill="#E04826"/><path class="mark-body" fill="currentColor" d="M 156 48 L 184 48 L 224 88 L 224 168 L 184 208 L 156 208 L 156 176 L 172 176 L 192 156 L 192 100 L 172 80 L 156 80 Z"/></g></svg>`;
  };
  MD.fluxdWordmark = function (cls = "fluxd-word-svg") {
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 256" fill="none"><path class="w-dot" fill="#E04826" d="M 28 48 L 68 48 L 68 72 L 52 72 L 52 184 L 68 184 L 68 208 L 28 208 Z"/><path class="w-char w-odd w-1" fill="currentColor" d="M 96 64 L 188 64 L 188 94 L 130 94 L 130 118 L 176 118 L 176 146 L 130 146 L 130 192 L 96 192 Z"/><path class="w-char w-even w-2" fill="currentColor" d="M 216 64 L 250 64 L 250 162 L 308 162 L 308 192 L 216 192 Z"/><path class="w-char w-odd w-3" fill="currentColor" d="M 332 64 L 366 64 L 366 152 L 376 162 L 406 162 L 416 152 L 416 64 L 450 64 L 450 166 L 424 192 L 358 192 L 332 166 Z"/><path class="w-char w-even w-4" fill="currentColor" d="M 476 64 L 512 64 L 604 156 L 604 192 L 568 192 L 476 100 Z M 568 64 L 604 64 L 604 100 L 512 192 L 476 192 L 476 156 Z"/><path class="w-char w-odd w-5" fill="currentColor" d="M 632 64 L 708 64 L 740 96 L 740 160 L 708 192 L 632 192 Z M 666 94 L 666 162 L 694 162 L 706 150 L 706 106 L 694 94 Z"/><path class="w-dot" fill="#E04826" d="M 772 48 L 812 48 L 812 208 L 772 208 L 772 184 L 788 184 L 788 72 L 772 72 Z"/></svg>`;
  };
  MD.fluxdLockup = function (cls = "fluxd-lockup-svg") {
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 256" fill="none"><g class="fb-phi" transform="translate(16,0)"><path class="mark-body" fill="currentColor" d="M 100 48 L 72 48 L 32 88 L 32 168 L 72 208 L 100 208 L 100 176 L 84 176 L 64 156 L 64 100 L 84 80 L 100 80 Z"/><rect class="mark-accent" x="114" y="16" width="28" height="224" fill="#E04826"/><path class="mark-body" fill="currentColor" d="M 156 48 L 184 48 L 224 88 L 224 168 L 184 208 L 156 208 L 156 176 L 172 176 L 192 156 L 192 100 L 172 80 L 156 80 Z"/></g><g class="fb-word" transform="translate(272,0)"><path class="w-dot" fill="#E04826" d="M 28 48 L 68 48 L 68 72 L 52 72 L 52 184 L 68 184 L 68 208 L 28 208 Z"/><path class="w-char w-odd w-1" fill="currentColor" d="M 96 64 L 188 64 L 188 94 L 130 94 L 130 118 L 176 118 L 176 146 L 130 146 L 130 192 L 96 192 Z"/><path class="w-char w-even w-2" fill="currentColor" d="M 216 64 L 250 64 L 250 162 L 308 162 L 308 192 L 216 192 Z"/><path class="w-char w-odd w-3" fill="currentColor" d="M 332 64 L 366 64 L 366 152 L 376 162 L 406 162 L 416 152 L 416 64 L 450 64 L 450 166 L 424 192 L 358 192 L 332 166 Z"/><path class="w-char w-even w-4" fill="currentColor" d="M 476 64 L 512 64 L 604 156 L 604 192 L 568 192 L 476 100 Z M 568 64 L 604 64 L 604 100 L 512 192 L 476 192 L 476 156 Z"/><path class="w-char w-odd w-5" fill="currentColor" d="M 632 64 L 708 64 L 740 96 L 740 160 L 708 192 L 632 192 Z M 666 94 L 666 162 L 694 162 L 706 150 L 706 106 L 694 94 Z"/><path class="w-dot" fill="#E04826" d="M 772 48 L 812 48 L 812 208 L 772 208 L 772 184 L 788 184 L 788 72 L 772 72 Z"/></g></svg>`;
  };
  MD.fluxdEndCardHero = function (mode = "blink04", handle = "@fluxd.tv · WHERE CINEMA OPTICS, PHYSICAL LAW & GLOBAL SYSTEMS COLLIDE") {
    return `<div class="ed-endcard-hero" data-mode="${esc(mode)}"><div class="ed-endcard-stage"><div class="ed-endcard-phi fb-phi">${MD.fluxdPhi2("ed-hero-phi-svg")}</div><div class="ed-endcard-lockup fb-word">${MD.fluxdLockup("ed-hero-lockup-svg")}</div></div><div class="ed-outro-handle">${esc(handle)}</div></div>`;
  };

  MD.ransomTx = function (str) {
    let wi = 0;
    return lines(str)
      .map((l) => {
        const ws = String(l).trim().split(/\s+/).filter(Boolean).map((raw) => {
          const clean = raw.replace(/[\*\[\]]/g, "");
          const isRed = /^\*.*\*$/.test(raw) || /^\[.*\]$/.test(raw);
          const scIdx = isRed ? 3 : (wi % 5);
          return `<span class="vx-scrap sc-${scIdx}" data-wi="${wi++}">${esc(clean)}</span>`;
        });
        return `<div class="vx-ransom-row">${ws.join("")}</div>`;
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
      const isEd = c && c.st && c.st.id === "editorial";
      if (isEd) {
        const clipLbl = esc(o.label || "ARCHIVE FEED // PiP MONITOR");
        return `<div class="ed-pip-video-card"><div class="ed-pip-hdr"><span class="ed-pip-rec"><i></i>REC</span><span class="ed-pip-tag">${clipLbl}</span></div><div class="ed-pip-frame"><video id="${id}" class="md-vid ed-pip-vid" src="${esc(url)}" muted playsinline loop data-md-video="1"></video></div></div>`;
      }
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
    // Spring-Physics Whip-Pop Entrance for Editorial Cards & Pop-Up Elements (3D perspective + velocity skew + elastic overshoot)
    cardWhipIn: {
      len: (n, o) => D(o, "d", 0.68) + D(o, "st", 0.1) * (n - 1),
      run: (tl, els, at, o) => {
        const d = D(o, "d", 0.68), st = D(o, "st", 0.1), dir = D(o, "dir", 1);
        gsap.set(els, { opacity: 0, y: 46, x: 24 * dir, scaleX: 0.88, scaleY: 1.12, skewY: 4.5 * dir, rotationX: 16, rotationZ: -2.2 * dir, transformPerspective: 1400 });
        tl.to(els, {
          keyframes: [
            { opacity: 1, y: -9, x: -4 * dir, scaleX: 1.05, scaleY: 0.96, skewY: -1.2 * dir, rotationX: -4, rotationZ: 0.8 * dir, duration: d * 0.46, ease: "expo.out" },
            { y: 3, x: 1 * dir, scaleX: 0.985, scaleY: 1.015, skewY: 0.3 * dir, rotationX: 1.5, rotationZ: -0.2 * dir, duration: d * 0.28, ease: "sine.inOut" },
            { y: 0, x: 0, scaleX: 1, scaleY: 1, skewY: 0, rotationX: 0, rotationZ: 0, duration: d * 0.26, ease: "power3.out" },
          ],
          stagger: st,
        }, at);
        els.forEach((el, idx) => {
          const thumb = el.querySelector(".ed-seq-thumb img, .ed-hero-img-wrap img, .ed-pip-vid");
          if (thumb) {
            tl.fromTo(thumb, { scale: 1.22, filter: "brightness(1.35) contrast(1.1)" }, { scale: 1.03, filter: "brightness(1) contrast(1)", duration: d * 0.85, ease: "expo.out" }, at + idx * st);
          }
          const meta = el.querySelectorAll(".ed-seq-idx, .ed-seq-lbl, .ed-pip-hdr");
          if (meta.length) {
            tl.fromTo(meta, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: d * 0.55, stagger: 0.05, ease: "back.out(2.2)" }, at + idx * st + 0.1);
          }
        });
      },
    },
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
    // 7-frame (0.23s @ 30fps) Overshoot Pop from Reference Reel Telemetry (1.42x -> 1.15x -> 1.00x)
    overshootPop: {
      len: (n, o) => D(o, "d", 0.46) + D(o, "st", 0.08) * (n - 1),
      run: (tl, els, at, o) => {
        const d = D(o, "d", 0.46), st = D(o, "st", 0.08);
        gsap.set(els, { opacity: 0, scale: 1.42, y: 8 });
        tl.to(els, {
          keyframes: [
            { opacity: 1, scale: 1.42, y: 6, duration: d * 0.18, ease: "power2.out" },
            { scale: 0.94, y: -2, duration: d * 0.44, ease: "expo.out" },
            { scale: 1.0, y: 0, duration: d * 0.38, ease: "power3.out" },
          ],
          stagger: st,
        }, at);
      },
    },
    unlockRow: {
      len: () => 0.55,
      run: (tl, els, at) => {
        els.forEach((row) => {
          const body = row.querySelector(".ul-body");
          const st = row.querySelector(".ul-st");
          if (body) tl.fromTo(body, { filter: "blur(5.5px)", opacity: 0.55 }, { filter: "blur(0px)", opacity: 1, duration: 0.42, ease: "power3.out" }, at);
          if (st) {
            tl.to(st, {
              keyframes: [
                { scale: 1.45, duration: 0.14, ease: "power2.out", onStart: () => { st.textContent = "✓"; row.classList.remove("is-locked"); row.classList.add("is-unlocked"); } },
                { scale: 1.0, duration: 0.28, ease: "back.out(2.5)" },
              ],
            }, at + 0.06);
          }
        });
      },
    },
    wavePulse: {
      len: () => 1.8,
      run: (tl, els, at, o, c, s) => {
        els.forEach((wrap) => {
          const bars = Array.from(wrap.querySelectorAll(".pr-b"));
          if (!bars.length) return;
          const runDur = s ? Math.max(1.8, s.dur - 0.5) : 2.4;
          const st = { p: 0 };
          const draw = () => {
            bars.forEach((b, i) => {
              const h = 25 + 72 * Math.abs(Math.sin(st.p * 9.5 + i * 0.65));
              b.style.height = `${h.toFixed(1)}%`;
            });
          };
          draw();
          tl.fromTo(st, { p: 0 }, { p: 1, duration: runDur, ease: "none", onUpdate: draw, onStart: draw }, at);
        });
      },
    },
    cardFan: {
      len: (n) => 0.75 + 0.06 * Math.max(0, n - 1),
      run: (tl, els, at) => {
        const arr = Array.from(els);
        const mid = (arr.length - 1) / 2;
        arr.forEach((card, i) => {
          const off = i - mid;
          const rot = off * 9.5;
          const tx = off * 36;
          const ty = Math.abs(off) * 7;
          tl.fromTo(card, { opacity: 0, y: 45, rotation: 0, x: 0, scale: 0.82 }, { opacity: 1, y: ty, x: tx, rotation: rot, scale: 1, duration: 0.68, ease: "back.out(1.8)" }, at + i * 0.07);
        });
      },
    },
    rehookCurve: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((card) => {
          const mode = card.dataset.mode || "drop";
          const eyes = Array.from(card.querySelectorAll(".rh-eye"));
          const dropLine = card.querySelector(".rh-curve-lo");
          const hiLine = card.querySelector(".rh-curve-hi");
          const loopPath = card.querySelector(".rh-red-loop");
          const springPath = card.querySelector(".rh-spring-coil");
          if (hiLine && hiLine.getTotalLength) {
            const L = hiLine.getTotalLength() || 500;
            hiLine.style.strokeDasharray = `${L} ${L}`;
            tl.fromTo(hiLine, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, at);
          }
          if (dropLine && dropLine.getTotalLength) {
            const L2 = dropLine.getTotalLength() || 500;
            dropLine.style.strokeDasharray = `${L2} ${L2}`;
            tl.fromTo(dropLine, { strokeDashoffset: L2 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, at + 0.45);
          }
          if (loopPath && loopPath.getTotalLength) {
            const L3 = loopPath.getTotalLength() || 400;
            loopPath.style.strokeDasharray = `${L3} ${L3}`;
            tl.fromTo(loopPath, { strokeDashoffset: L3 }, { strokeDashoffset: 0, duration: 0.65, ease: "power3.out" }, at + 1.15);
          }
          if (eyes.length) {
            tl.fromTo(eyes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06, ease: "back.out(2.4)" }, at + 0.15);
            if (mode === "drop") {
              const falling = eyes.slice(3);
              if (falling.length) {
                tl.to(falling, { y: "+=92", x: "+=28", rotation: 42, duration: 0.85, stagger: 0.08, ease: "bounce.out" }, at + 0.75);
              }
            } else if (mode === "spring" && springPath) {
              tl.fromTo(springPath, { scaleY: 0.45, transformOrigin: "50% 100%" }, { scaleY: 1.08, duration: 0.65, ease: "elastic.out(1.2, 0.4)" }, at + 0.55);
            }
          }
        });
      },
    },
    fuseTick: {
      len: () => 2.0,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const spark = stage.querySelector(".fs-spark");
          const txt = stage.querySelector(".fs-timer-txt");
          const bomb = stage.querySelector(".fs-bomb-grp");
          const runDur = s ? Math.max(1.8, s.dur - 0.4) : 2.2;
          const st = { v: 2.0 };
          const draw = () => {
            if (txt) txt.textContent = `${st.v.toFixed(1)}s`;
          };
          draw();
          tl.fromTo(st, { v: 2.0 }, { v: 1.1, duration: runDur, ease: "none", onUpdate: draw, onStart: draw }, at);
          if (spark) {
            tl.fromTo(spark, { rotation: 0, scale: 0.9, transformOrigin: "50% 50%" }, { rotation: 360, scale: 1.25, duration: runDur, ease: "none" }, at);
          }
          if (bomb && stage.dataset.mode === "zoom") {
            tl.fromTo(bomb, { scale: 0.92, transformOrigin: "50% 50%" }, { scale: 1.26, duration: runDur * 0.75, ease: "expo.inOut" }, at + 0.15);
          }
        });
      },
    },
    // Vox Guide (@justdodani) Ransom-Note Word-by-Word Drop (50px drop + fade in, 0.10s stagger, pure ease-out, zero bounce)
    // Official FLUXD Binary Shutter Blink Suite (Blink 01A, Blink 01B, Blink 03, Blink 04)
    // lemo-opuscar Executable Moves: Archive Light Table Loupe Dive, Satellite Scanner Bar, Kino-Montage 120BPM Slam, Whiteboard Hand Curve
    loupeDive: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const runDur = s ? Math.max(2.4, s.dur) : 3.5;
          const loupe = stage.querySelector(".lt-loupe");
          const hlBar = stage.querySelector(".lt-hl-bar");
          const card = stage.querySelector(".lt-reading-card");
          if (loupe) {
            tl.fromTo(loupe, { scale: 1.35, opacity: 0, x: -45, y: -30 }, { scale: 1.0, opacity: 1, x: 0, y: 0, duration: 0.42, ease: "power3.out" }, at + 0.15);
            tl.to(loupe, { scale: 1.08, x: 12, y: -6, duration: Math.max(1.2, runDur - 0.6), ease: "sine.inOut" }, at + 0.58);
          }
          if (hlBar) {
            tl.fromTo(hlBar, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.48, ease: "power2.out" }, at + 0.52);
          }
          if (card) {
            tl.fromTo(card, { y: 28, opacity: 0, scale: 1.08 }, { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: "expo.out" }, at + 0.85);
          }
        });
      },
    },
    satScan: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const runDur = s ? Math.max(2.4, s.dur) : 3.5;
          const bar = stage.querySelector(".sat-scan-bar");
          const reveal = stage.querySelector(".sat-after-layer");
          const rLine = stage.querySelector(".sat-range-line");
          const ret = stage.querySelector(".sat-reticle");
          if (bar) {
            tl.fromTo(bar, { top: "0%" }, { top: "100%", duration: Math.min(1.6, runDur * 0.55), ease: "power1.inOut" }, at + 0.15);
          }
          if (reveal) {
            tl.fromTo(reveal, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: Math.min(1.6, runDur * 0.55), ease: "power1.inOut" }, at + 0.15);
          }
          if (ret) {
            tl.fromTo(ret, { scale: 1.45, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.34, ease: "back.out(2.2)" }, at + 0.45);
          }
          if (rLine && rLine.getTotalLength) {
            const L = rLine.getTotalLength() || 400;
            rLine.style.strokeDasharray = `${L} ${L}`;
            tl.fromTo(rLine, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.85, ease: "power2.out" }, at + 0.55);
          }
        });
      },
    },
    kinoSlam: {
      len: () => 1.8,
      run: (tl, els, at) => {
        els.forEach((stage) => {
          const band = stage.querySelector(".km-red-band");
          const win = stage.querySelector(".km-window");
          const mark = stage.querySelector(".km-doc-mark");
          const blk = stage.querySelector(".km-num-block");
          if (band) tl.fromTo(band, { xPercent: -110 }, { xPercent: 0, duration: 0.18, ease: "power3.out" }, at + 0.04);
          if (win) tl.fromTo(win, { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.22, ease: "expo.out" }, at + 0.14);
          if (mark) tl.fromTo(mark, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.25, ease: "power3.out" }, at + 0.38);
          if (blk) tl.fromTo(blk, { scale: 1.32, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.18, ease: "power4.out" }, at + 0.52);
        });
      },
    },
    wbDraw: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const runDur = s ? Math.max(2.2, s.dur - 0.4) : 2.8;
          const sheen = stage.querySelector(".wb-sheen");
          const paths = Array.from(stage.querySelectorAll(".wb-stroke"));
          if (sheen) tl.fromTo(sheen, { xPercent: -15 }, { xPercent: 18, duration: runDur, ease: "none" }, at);
          paths.forEach((p, idx) => {
            const L = p.getTotalLength ? p.getTotalLength() : 600;
            p.style.strokeDasharray = `${L} ${L}`;
            tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: Math.min(0.95, runDur * 0.45), ease: "sine.inOut" }, at + 0.12 + idx * 0.28);
          });
        });
      },
    },
    fluxdBlink: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const mode = stage.dataset.mode || "blink04";
          const phi = stage.querySelector(".fb-phi");
          const word = stage.querySelector(".fb-word");
          const odds = stage.querySelectorAll(".w-odd");
          const evens = stage.querySelectorAll(".w-even, .w-dot");
          const totalDur = s ? Math.max(2.6, s.dur) : 4.0;
          if (mode === "blink01a" && phi) {
            gsap.set(phi, { opacity: 0, scale: 0.92 });
            [0.06, 0.20, 0.36, 0.54].forEach((t, idx) => {
              tl.set(phi, { opacity: 1, scale: idx === 3 ? 1.06 : 1.0, color: idx === 2 ? "#E04826" : "inherit" }, at + t);
              if (idx < 3) tl.set(phi, { opacity: 0 }, at + t + 0.08);
            });
          } else if (mode === "blink01b" && word) {
            gsap.set(word, { opacity: 0 });
            [0.06, 0.20, 0.36, 0.54].forEach((t, idx) => {
              tl.set(word, { opacity: 1, color: idx === 2 ? "#E04826" : "inherit" }, at + t);
              if (idx < 3) tl.set(word, { opacity: 0 }, at + t + 0.08);
            });
          } else if (mode === "blink03" && word) {
            gsap.set([odds, evens], { opacity: 0 });
            tl.set(odds, { opacity: 1 }, at + 0.06);
            tl.set(odds, { opacity: 0.08 }, at + 0.20);
            tl.set(evens, { opacity: 1 }, at + 0.20);
            tl.set(evens, { opacity: 0.08 }, at + 0.34);
            tl.set(odds, { opacity: 1 }, at + 0.34);
            tl.set([odds, evens], { opacity: 0 }, at + 0.46);
            tl.set([odds, evens], { opacity: 1 }, at + 0.54);
          } else {
            // Combined Master End-Card Animation (Blink 04 -> Blink 03 Binary Strobe -> Full Lockup Hold, plus re-trigger near end of scene)
            if (phi && word) {
              tl.fromTo(stage, { scale: 0.94, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.28, ease: "power3.out" }, at);
              // Phase 1: Chamfered-Bracket Phi-2 Shutter Blink
              tl.set(phi, { opacity: 1, scale: 1.08 }, at + 0.02);
              tl.set(word, { opacity: 0 }, at + 0.02);
              tl.set(phi, { opacity: 0 }, at + 0.14);
              tl.set(phi, { opacity: 1, color: "#E04826" }, at + 0.24);
              tl.set(phi, { opacity: 0, color: "inherit" }, at + 0.38);
              // Phase 2: Cut to Big Framed [ FLUXD ] Lockup + Alternating Binary Phase Strobe ([ F_U_D ] <-> [ _L_X_ ])
              tl.set(word, { opacity: 1 }, at + 0.42);
              if (odds.length && evens.length) {
                tl.set(odds, { opacity: 1 }, at + 0.42);
                tl.set(evens, { opacity: 0.12 }, at + 0.42);
                tl.set(odds, { opacity: 0.12 }, at + 0.56);
                tl.set(evens, { opacity: 1 }, at + 0.56);
                tl.set([odds, evens], { opacity: 0 }, at + 0.70);
                tl.set([odds, evens], { opacity: 1 }, at + 0.78);
              } else {
                tl.set(word, { opacity: 0 }, at + 0.56);
                tl.set(word, { opacity: 1 }, at + 0.66);
              }
              // Phase 3: Final Hero End-Card Strobe in the last 2.2s of the video so the logo animation is unmistakable at the very end
              const endTrigger = Math.max(at + 1.4, totalDur - 2.1);
              if (endTrigger > at + 1.1 && endTrigger < totalDur - 0.5) {
                tl.set(word, { opacity: 0 }, endTrigger);
                tl.set(phi, { opacity: 1, scale: 1.12 }, endTrigger);
                tl.set(phi, { opacity: 0 }, endTrigger + 0.14);
                tl.set(phi, { opacity: 1, color: "#E04826" }, endTrigger + 0.24);
                tl.set(phi, { opacity: 0, color: "inherit" }, endTrigger + 0.38);
                tl.set(word, { opacity: 1 }, endTrigger + 0.40);
                if (odds.length && evens.length) {
                  tl.set(odds, { opacity: 1 }, endTrigger + 0.40);
                  tl.set(evens, { opacity: 0.12 }, endTrigger + 0.40);
                  tl.set(odds, { opacity: 0.12 }, endTrigger + 0.52);
                  tl.set(evens, { opacity: 1 }, endTrigger + 0.52);
                  tl.set([odds, evens], { opacity: 1 }, endTrigger + 0.64);
                }
                tl.fromTo(stage, { scale: 1.0 }, { scale: 1.05, duration: 0.45, ease: "back.out(1.8)" }, endTrigger + 0.64);
              }
            }
          }
        });
      },
    },
    ransomDrop: {
      len: (n, o) => D(o, "d", 0.58) + D(o, "st", 0.10) * Math.max(0, n - 1),
      run: (tl, els, at, o) => {
        const scraps = units(els, ".vx-scrap");
        const d = D(o, "d", 0.58), st = D(o, "st", 0.10);
        tl.fromTo(scraps, { y: -52, opacity: 0 }, { y: 0, opacity: 1, duration: d, stagger: st, ease: "power3.out" }, at);
      },
    },
    // Vox Guide (@justdodani) 7-Layer Back-to-Front Diorama Stack + Continuous Movers + Glacier Turn + 4% Camera Push
    dioramaRun: {
      len: () => 2.2,
      run: (tl, els, at, o, c, s) => {
        els.forEach((stage) => {
          const runDur = s ? Math.max(2.6, s.dur) : 4.0;
          const cam = stage.querySelector(".dio-cam");
          // 1. Slow 4.5% camera push across the whole shot
          if (cam) {
            tl.fromTo(cam, { scale: 1.0 }, { scale: 1.045, duration: runDur, ease: "none" }, at);
          }
          // 2. Stack layers back-to-front with pure ease-out (40-80px slide, 0.55-0.75s, power3.out, no bounce)
          const stackOrder = [
            { sel: ".dio-l-sky", y: -45, t: 0.00, d: 0.55 },
            { sel: ".dio-l-clouds", y: -55, t: 0.12, d: 0.62 },
            { sel: ".dio-l-mountains", y: 65, t: 0.24, d: 0.68 },
            { sel: ".dio-l-glacier", y: 55, t: 0.36, d: 0.68 },
            { sel: ".dio-l-road", y: 75, t: 0.48, d: 0.68 },
            { sel: ".dio-h-base", y: 55, t: 0.60, d: 0.55 },
            { sel: ".dio-h-floors", y: 55, t: 0.72, d: 0.55 },
            { sel: ".dio-h-roof", y: 48, t: 0.84, d: 0.55 },
            { sel: ".dio-l-movers", y: 40, t: 0.78, d: 0.55 },
          ];
          stackOrder.forEach((stItem) => {
            const node = stage.querySelector(stItem.sel);
            if (node) {
              tl.fromTo(node, { y: stItem.y, opacity: 0 }, { y: 0, opacity: 1, duration: stItem.d, ease: "power3.out" }, at + stItem.t);
            }
          });
          // 3. Something is ALWAYS moving (clouds drift, birds cross, yellow bus drives road, steam train crosses bottom)
          const clouds = stage.querySelector(".dio-mover-clouds");
          const birds = stage.querySelector(".dio-mover-birds");
          const bus = stage.querySelector(".dio-mover-bus");
          const train = stage.querySelector(".dio-mover-train");
          if (clouds) tl.fromTo(clouds, { x: -18 }, { x: 54, duration: runDur, ease: "none" }, at);
          if (birds) tl.fromTo(birds, { x: 35, y: 6 }, { x: -95, y: -14, duration: runDur, ease: "none" }, at);
          if (bus) tl.fromTo(bus, { x: -35, y: 4 }, { x: 165, y: -4, duration: runDur, ease: "none" }, at);
          if (train) tl.fromTo(train, { x: -25 }, { x: 115, duration: runDur, ease: "none" }, at);

          // 4. The Story Turn: slide the glacier / turn-piece away to reveal bare rock & draw timeline bar
          if (stage.dataset.turn === "1") {
            const gl = stage.querySelector(".dio-glacier-body");
            const tlFill = stage.querySelector(".dio-tl-fill");
            if (gl) {
              tl.to(gl, { x: 185, y: -62, scale: 0.36, opacity: 0.18, duration: Math.min(1.65, runDur * 0.48), ease: "power2.inOut" }, at + 0.95);
            }
            if (tlFill) {
              tl.fromTo(tlFill, { scaleX: 0.08 }, { scaleX: 1.0, duration: Math.min(1.5, runDur * 0.45), ease: "power2.out" }, at + 0.95);
            }
          }
        });
      },
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
      label: "Editorial Artifact & Showcase",
      fields: ["kicker", "title", "sub", "media", "callouts"],
      min: (s) => Math.max(3.4, (s.title ? readSecs(s.title) * 0.6 : 0) + (s.callouts || []).length * 0.4 + 1.4),
      markup: (s, c) => {
        const ms = [].concat(s.media || []).filter(Boolean).slice(0, 3);
        const isEditorial = c && c.st && c.st.id === "editorial";
        if (isEditorial) {
          if (ms.length >= 2) {
            const cardsHtml = ms.map((m, i) => {
              const callTxt = (s.callouts && s.callouts[i]) ? s.callouts[i] : `Edition 0${i + 1}`;
              return `<div class="ed-seq-card" data-i="${i}"><div class="ed-seq-thumb">${MD.media(m, c)}</div><div class="ed-seq-meta"><span class="ed-seq-idx">0${i + 1} // FEATURED</span><div class="ed-seq-lbl">${MD.tx(callTxt)}</div></div></div>`;
            }).join("");
            return `<div class="k k-collage"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ed-multi-grid n${ms.length}">${cardsHtml}</div></div></div>`;
          }
          const singleMedia = ms.length ? MD.media(ms[0], c) : `<svg class="vx-archival-svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#16181D"/><circle cx="240" cy="160" r="78" fill="#E04826" opacity="0.85"/></svg>`;
          return `<div class="k k-collage"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="28">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ed-showcase"><div class="ed-hero-card"><div class="ed-hero-img-wrap">${singleMedia}</div></div></div></div></div>`;
        }
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
        const isEditorial = c && c.st && c.st.id === "editorial";
        if (s.kicker && !isEditorial) e.push(ev(t, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) {
          const te = titleEvent(c, s, 0.12, s.title, ".title");
          e.push(te, ...emphEvents(s, c, s.title, ".title", after(te) - 0.25));
          t = after(te) - 0.2;
        }
        if (s.sub) e.push(ev(Math.max(0.38, t), ".sub", T(c, "body", "fadeUp"), MD.count(s.sub)));
        const ms = [].concat(s.media || ["default"]).slice(0, 3);
        if (isEditorial) {
          if (ms.length >= 2) {
            const mTimes = Array.isArray(s.mediaTimes) && s.mediaTimes.length === ms.length
              ? s.mediaTimes.map((x) => Math.min(dur - 0.6, Math.max(0.15, +x)))
              : ms.map((_, i) => 0.35 + i * Math.min(1.4, (dur - 1.2) / ms.length));
            ms.forEach((_, i) => {
              e.push(ev(mTimes[i], `.ed-seq-card[data-i="${i}"]`, "cardWhipIn", 1, { d: 0.68, dir: i % 2 === 0 ? 1 : -1 }, sfxOf(c, "card") || "card-place", "start"));
            });
          } else {
            e.push(ev(0.24, ".ed-hero-img-wrap", "cardWhipIn", 1, { d: 0.72, dir: 1 }, sfxOf(c, "media") || "card-place", "start"));
            if (s.callouts && s.callouts[0]) {
              e.push(ev(0.68, ".ed-caption-strip", "fadeUp", 1, { y: 16, d: 0.48 }, "tap", "start"));
            }
          }
          return e;
        }
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
    // Retention HUD Kind 1: Retention Curve, Eyeball Drop, Spring Rehook & Payoff Cut (from Reel 2)
    rehook: {
      label: "Retention Curve & Rehook Machine",
      fields: ["kicker", "title", "sub", "value", "label", "mythA", "mythB", "badge", "mode"],
      min: (s) => Math.max(3.2, (s.title ? readSecs(s.title) * 0.55 : 0) + 1.8),
      markup: (s, c) => {
        const mode = s.mode || "drop";
        const val = s.value || (mode === "drop" ? "12%" : "88%");
        const lbl = s.label || (mode === "drop" ? "STILL WATCHING" : "RETENTION LOCKED");
        const p = MD.parseNumber(val);
        const fromVal = mode === "drop" ? 100 : 12;
        const numHtml = p
          ? `<span class="pre">${esc(p.pre)}</span><span class="val" data-from="${fromVal}" data-to="${p.to}" data-dec="${p.dec}" data-sep="0">${MD.formatNumber(p.to, p.dec, false)}</span><span class="suf">${esc(p.suf)}</span>`
          : esc(val);
        const hiCurve = mode === "drop"
          ? "M 55,58 L 195,66"
          : (mode === "spring" ? "M 55,58 L 285,84 L 365,64 L 545,70" : "M 55,58 L 430,82");
        const loCurve = mode === "drop"
          ? "M 195,66 C 215,155 265,215 535,222"
          : (mode === "payoff" ? "M 430,82 C 455,145 495,195 555,215" : "M 285,84 C 340,165 420,210 545,218");
        const eyesCoords = mode === "drop"
          ? [[78,48],[112,51],[146,54],[182,58],[208,95],[228,138],[255,175]]
          : [[82,48],[132,52],[184,56],[236,62],[288,68],[346,58],[402,62]];
        const eyesSvg = eyesCoords.map(([cx, cy], idx) => `
          <g class="rh-eye" data-i="${idx}">
            <circle cx="${cx}" cy="${cy}" r="14" fill="#F6F3EC" stroke="#0B0D0B" stroke-width="2.5"/>
            <circle cx="${cx + 3}" cy="${cy + 1}" r="6.5" fill="var(--accent)"/>
            <circle cx="${cx + 4}" cy="${cy + 1}" r="3" fill="#0B0D0B"/>
          </g>`).join("");
        const redLoop = mode === "drop"
          ? `<ellipse class="rh-red-loop" cx="215" cy="138" rx="48" ry="86" fill="none" stroke="#FF3B1F" stroke-width="3.2" transform="rotate(-8 215 138)"/>`
          : "";
        const springSvg = mode === "spring"
          ? `<g class="rh-spring-coil"><rect x="296" y="132" width="58" height="20" rx="4" fill="var(--accent)"/><text x="325" y="146" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#0B0D0B">REHOOK</text><path d="M312,152 L338,160 L312,168 L338,176 L312,184 L338,192 L312,200 L338,208" fill="none" stroke="#F6F3EC" stroke-width="3.2"/></g>`
          : "";
        const scissorSvg = mode === "payoff"
          ? `<g class="rh-payoff-cut"><line x1="430" y1="32" x2="430" y2="230" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="6 5"/><rect x="392" y="26" width="76" height="24" rx="5" fill="var(--accent)"/><text x="430" y="42" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#0B0D0B">PAYOFF ✂</text></g>`
          : "";
        const mA = s.mythA ? `<div class="rh-myth"><span class="tx">${esc(s.mythA)}<i class="strike"></i></span><span class="rh-myth-x">✕</span></div>` : "";
        const mB = s.mythB ? `<div class="rh-myth"><span class="tx">${esc(s.mythB)}<i class="strike"></i></span><span class="rh-myth-x">✕</span></div>` : "";
        const badge = s.badge ? `<div class="rh-badge-pop">${esc(s.badge)}</div>` : "";
        return `<div class="k k-rehook"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="rh-card" data-mode="${esc(mode)}"><div class="rh-hdr"><strong>Retention</strong><span>${esc(s.sub || "TELEMETRY // 0:00 - 0:50")}</span></div><svg class="rh-svg" viewBox="0 0 580 250"><line x1="45" y1="58" x2="550" y2="58" stroke="rgba(255,255,255,0.12)" stroke-dasharray="4 4"/><line x1="45" y1="140" x2="550" y2="140" stroke="rgba(255,255,255,0.08)"/><line x1="45" y1="222" x2="550" y2="222" stroke="rgba(255,255,255,0.14)"/><text x="12" y="62" fill="#8A9186" font-family="monospace" font-size="12">100%</text><text x="18" y="144" fill="#8A9186" font-family="monospace" font-size="12">50%</text><text x="28" y="226" fill="#8A9186" font-family="monospace" font-size="12">0</text><text x="48" y="244" fill="#8A9186" font-family="monospace" font-size="12">0:00</text><text x="520" y="244" fill="#8A9186" font-family="monospace" font-size="12">0:50</text><path class="rh-curve-lo" d="${loCurve}" fill="none" stroke="${mode === "spring" ? "rgba(255,255,255,0.22)" : "#FF3B1F"}" stroke-width="4" stroke-dasharray="${mode === "spring" ? "6 5" : "none"}"/><path class="rh-curve-hi" d="${hiCurve}" fill="none" stroke="var(--accent)" stroke-width="4.5" stroke-linecap="round"/>${eyesSvg}${redLoop}${springSvg}${scissorSvg}</svg><div class="rh-big-stat"><div class="rh-big-val${mode === "drop" ? " is-drop" : ""}">${numHtml}</div><div class="rh-big-lbl">${esc(lbl)}</div></div></div><div class="rh-foot">${mA}${mB}${badge}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        if (s.kicker) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        e.push(ev(0.18, ".rh-card", "rehookCurve", 1, {}, "riser-air", "start"));
        e.push(ev(0.35, ".rh-big-val .val", "count", 1, { d: 1.25 }, "glass", "end"));
        if (s.mythA || s.mythB) {
          e.push(ev(0.55, ".rh-myth", "fadeUp", 2, { st: 0.14, y: 14 }));
          e.push(ev(0.95, ".rh-myth", "strike", 2, { d: 0.35 }, "scratch", "start"));
        }
        if (s.badge) e.push(ev(1.35, ".rh-badge-pop", "overshootPop", 1, { d: 0.46 }, "punch", "start"));
        return e;
      },
    },
    // Retention HUD Kind 2: Progressive Blurred-to-Unlocked Checklist & Open-Loop Roadmap (from Reel 1 & Reel 2)
    unlock: {
      label: "Editorial Perspective Index",
      fields: ["kicker", "title", "sub", "items", "unlocked", "unlockIndex", "stamp", "stage", "cta"],
      min: (s) => Math.max(3.2, (s.title ? readSecs(s.title) * 0.5 : 0) + (s.items || []).length * 0.28 + 1.2),
      markup: (s, c) => {
        const isEditorial = (c && c.st && c.st.id === "editorial") || Boolean(s.unlockAll);
        const totalItems = (s.items || []).length || 4;
        const unlockedCount = isEditorial ? totalItems : (s.unlocked != null ? +s.unlocked : 2);
        const rows = (s.items || [
          "01 | PERSPECTIVE A | First regional or historical lens",
          "02 | PERSPECTIVE B | Second oral or folkloric shift",
          "03 | PERSPECTIVE C | Third literary transformation",
          "04 | PERSPECTIVE D | Fourth cross-border telling",
        ]).map((raw, idx) => {
          const parts = String(raw).split("|").map((x) => x.trim());
          const no = parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : String(idx + 1).padStart(2, "0");
          const rt = parts.length >= 2 ? parts[1] : parts[0];
          const rs = parts.length >= 3 ? parts.slice(2).join(" · ") : "";
          const isUn = isEditorial || ((idx + 1) <= unlockedCount && (s.unlockIndex !== idx + 1));
          return `<div class="ul-row ${isUn ? "is-unlocked" : "is-locked"}" data-i="${idx}" data-idx="${idx + 1}"><span class="ul-no">${esc(no)}</span><div class="ul-body"><span class="ul-rt">${esc(rt)}</span>${rs ? `<span class="ul-rs">${esc(rs)}</span>` : ""}</div><span class="ul-st">${isEditorial ? "→" : (isUn ? "✓" : "🔒")}</span></div>`;
        }).join("");
        if (isEditorial) {
          return `<div class="k k-unlock"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}${s.sub ? `<p class="sub">${MD.tx(s.sub)}</p>` : ""}<div class="ul-board"><div class="ul-rows">${rows}</div></div></div></div>`;
        }
        const stampHtml = s.stamp ? `<div class="ul-stamp${/alert|never|mistake|nobody/i.test(s.stamp) ? " is-alert" : ""}">${esc(s.stamp)}</div>` : "";
        const stages = ["HOOK", "DELAY", "REHOOK", "PAYOFF"];
        const curStage = (s.stage || "REHOOK").toUpperCase();
        const stripHtml = `<div class="ul-strip">${stages.map((st) => `<div class="ul-seg${st === curStage ? " on" : ""}">${st === curStage ? '<span class="ul-here">YOU ARE HERE</span>' : ""}${st}</div>`).join("")}</div>`;
        const saveHtml = s.cta ? `<div class="ul-save-pill">🔖 ${esc(s.cta)}</div>` : "";
        return `<div class="k k-unlock"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="22">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ul-stage"><div class="ul-card"><div class="ul-hdr"><span class="ul-hdr-t">${esc(s.sub || "RETENTION PROTOCOL")}</span><span class="ul-hdr-s">${esc(`${unlockedCount}/${(s.items || []).length || 5} UNLOCKED`)}</span></div><div class="ul-rows">${rows}</div>${stampHtml}</div></div>${stripHtml}${saveHtml}</div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        const isEditorial = (c && c.st && c.st.id === "editorial") || Boolean(s.unlockAll);
        if (s.kicker && !isEditorial) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        if (s.sub && isEditorial) e.push(ev(0.32, ".sub", "fadeUp", 1, { y: 12 }));
        const n = (s.items || []).length || 4;
        e.push(ev(0.28, ".ul-row", "fadeUp", n, { st: 0.18, y: 18 }, "tick", "start"));
        if (!isEditorial) {
          if (s.unlockIndex) e.push(ev(0.95, `.ul-row[data-idx="${s.unlockIndex}"]`, "unlockRow", 1, {}, "confirm", "start"));
          if (s.stamp) e.push(ev(1.25, ".ul-stamp", "overshootPop", 1, { d: 0.45 }, "punch", "start"));
          e.push(ev(0.55, ".ul-strip", "fadeUp", 1, { y: 12 }));
          if (s.cta) e.push(ev(1.4, ".ul-save-pill", "overshootPop", 1, { d: 0.42 }, "select", "start"));
        }
        return e;
      },
    },
    // Retention HUD Kind 3: 2-Second Bomb Fuse, Viewfinder Zoom & Multi-Angle Cut (from Reel 1)
    fuse: {
      label: "2-Second Bomb Fuse & Visual Lever",
      fields: ["kicker", "title", "sub", "tag", "mode", "callouts"],
      min: (s) => Math.max(3.0, (s.title ? readSecs(s.title) * 0.5 : 0) + 1.8),
      markup: (s, c) => {
        const mode = s.mode || "zoom";
        const tagParts = String(s.tag || "02 ZOOM").split(/\s+/);
        const tagNo = tagParts[0] || "01";
        const tagTxt = tagParts.slice(1).join(" ") || "LEVER";
        const swatches = mode === "rang"
          ? `<g class="fs-swatches"><rect x="175" y="62" width="32" height="54" rx="5" fill="#CCFF00" stroke="#0B0D0B" stroke-width="2" transform="rotate(-24 191 89)"/><rect x="218" y="44" width="32" height="54" rx="5" fill="#FF3B1F" stroke="#0B0D0B" stroke-width="2" transform="rotate(-12 234 71)"/><rect x="264" y="38" width="32" height="54" rx="5" fill="#F6F3EC" stroke="#0B0D0B" stroke-width="2"/><rect x="310" y="44" width="32" height="54" rx="5" fill="#38BDF8" stroke="#0B0D0B" stroke-width="2" transform="rotate(12 326 71)"/><rect x="352" y="62" width="32" height="54" rx="5" fill="#F59E0B" stroke="#0B0D0B" stroke-width="2" transform="rotate(24 368 89)"/></g>`
          : "";
        const viewfinder = mode === "zoom"
          ? `<g class="fs-vf" stroke="#F6F3EC" stroke-width="3" fill="none"><path d="M120,45 L90,45 L90,75"/><path d="M430,45 L460,45 L460,75"/><path d="M120,235 L90,235 L90,205"/><path d="M430,235 L460,235 L460,205"/><circle cx="112" cy="62" r="4" fill="#FF3B1F" stroke="none"/><text x="122" y="66" fill="#F6F3EC" stroke="none" font-family="monospace" font-size="12" font-weight="bold">REC</text><text x="415" y="66" fill="var(--accent)" stroke="none" font-family="monospace" font-size="13" font-weight="bold">1.35x</text></g>`
          : "";
        const clapper = mode === "cut"
          ? `<g class="fs-clap"><rect x="365" y="155" width="115" height="72" rx="6" fill="#141714" stroke="#F6F3EC" stroke-width="2"/><path d="M365,155 L480,138 L476,122 L362,139 Z" fill="var(--accent)" stroke="#0B0D0B" stroke-width="2"/><text x="380" y="182" fill="#8A9186" font-family="monospace" font-size="10">SCENE / SHOT</text><text x="380" y="206" fill="var(--accent)" font-family="monospace" font-size="20" font-weight="bold">07 · 2/3</text></g>`
          : "";
        const calls = (s.callouts || []).map((x, i) => `<div class="fs-call" data-i="${i}">${esc(x)}</div>`).join("");
        return `<div class="k k-fuse"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="fs-tag"><span class="fs-tag-no">${esc(tagNo)}</span><span>${esc(tagTxt)}</span></div><div class="fs-stage" data-mode="${esc(mode)}"><svg class="fs-svg" viewBox="0 0 550 270">${viewfinder}<g class="fs-bomb-grp">${swatches}<ellipse cx="275" cy="232" rx="68" ry="12" fill="rgba(0,0,0,0.45)"/><circle cx="275" cy="158" r="66" fill="#1C201C" stroke="#F6F3EC" stroke-width="3"/><circle cx="252" cy="136" r="14" fill="rgba(255,255,255,0.08)"/><rect x="262" y="82" width="26" height="16" rx="4" fill="#2A302A" stroke="#F6F3EC" stroke-width="2"/><path d="M275,82 Q315,48 368,42" fill="none" stroke="#C8A97E" stroke-width="4" stroke-linecap="round"/><g class="fs-spark" transform="translate(368,42)"><line x1="-14" y1="0" x2="14" y2="0" stroke="var(--accent)" stroke-width="3"/><line x1="0" y1="-14" x2="0" y2="14" stroke="var(--accent)" stroke-width="3"/><line x1="-10" y1="-10" x2="10" y2="10" stroke="#FF3B1F" stroke-width="2.5"/><line x1="-10" y1="10" x2="10" y2="-10" stroke="#FF3B1F" stroke-width="2.5"/></g><text class="fs-timer-txt" x="275" y="168" text-anchor="middle" fill="#F6F3EC" font-family="monospace" font-size="30" font-weight="bold">1.8s</text></g>${clapper}</svg></div>${calls ? `<div class="fs-calls">${calls}</div>` : ""}</div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        if (s.kicker) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        e.push(ev(0.18, ".fs-tag", "overshootPop", 1, { d: 0.42 }, "select", "start"));
        e.push(ev(0.22, ".fs-stage", "fuseTick", 1, {}, "whoosh-short", "start"));
        const nc = (s.callouts || []).length;
        if (nc) e.push(ev(0.65, ".fs-call", "overshootPop", nc, { st: 0.14, d: 0.42 }, "tick", "start"));
        return e;
      },
    },
    // Retention HUD Kind 4: 1 Word = 1 Prop & 1 Event = 1 Sound Audio-Visual Sync (from Reel 1)
    props: {
      label: "Word-to-Prop & Audio-Visual Sync",
      fields: ["kicker", "title", "sub", "words", "rule"],
      min: (s) => Math.max(3.2, (s.title ? readSecs(s.title) * 0.5 : 0) + 2.0),
      markup: (s, c) => {
        const items = (s.words || [
          "Chokepoint | alert-triangle",
          "Equation | cpu",
          "24fps Lens | eye",
          "Telemetry | activity",
        ]).slice(0, 4).map((raw, i) => {
          const parts = String(raw).split("|").map((x) => x.trim());
          const word = parts[0] || `Word ${i + 1}`;
          const icName = parts[1] || ["zap", "bell", "layers", "sparkles"][i % 4];
          return `<div class="pr-slot" data-i="${i}"><div class="pr-icon-box">${c.icon ? c.icon(icName) : "★"}</div><i class="pr-stem"></i><div class="pr-word-chip">${esc(word)}</div></div>`;
        }).join("");
        const bars = Array.from({ length: 28 }, (_, i) => `<i class="pr-b" data-b="${i}"></i>`).join("");
        const rule = s.rule || "1 KEYWORD = 1 PROP · 1 EVENT = 1 SOUND";
        return `<div class="k k-props"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="pr-stage"><div class="pr-grid">${items}</div><div class="pr-wave-bar"><div class="pr-wave-lbl"><span>AUDIO // SFX SYNC</span><span>POP · WHOOSH · DING</span></div><div class="pr-bars">${bars}</div></div><div class="pr-rule-pill">${esc(rule)}</div></div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        if (s.kicker) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        const n = Math.min(4, (s.words || [1, 2, 3, 4]).length);
        e.push(ev(0.28, ".pr-slot", "overshootPop", n, { st: 0.18, d: 0.45 }, "tick", "start"));
        e.push(ev(0.25, ".pr-wave-bar", "wavePulse", 1, {}, "riser-air", "start"));
        e.push(ev(1.05, ".pr-rule-pill", "overshootPop", 1, { d: 0.44 }, "confirm", "start"));
        return e;
      },
    },
    // Retention HUD Kind 5: Interactive Comment-Trigger & Fanned 20-Card Deck (from Reel 1 & Reel 2)
    cta: {
      label: "Editorial Recommendation & Discussion Sign-Off",
      fields: ["kicker", "title", "keyword", "deckLabel", "sentText"],
      min: (s) => Math.max(3.0, (s.title ? readSecs(s.title) * 0.5 : 0) + 1.8),
      markup: (s, c) => {
        const isEditorial = c && c.st && c.st.id === "editorial";
        const kw = s.keyword || "RAMAYANA";
        const deckLbl = s.deckLabel || "300+ LIVING TELLINGS";
        const sent = s.sentText || "Many Ramayanas, Many Lessons — Audible Original & HarperCollins";
        if (isEditorial) {
          const mode = s.blinkMode || "blink04";
          const promptTxt = s.promptText || "Share in the comments which version of the epic you grew up hearing";
          return `<div class="k k-cta"><div class="box">${s.title ? `<h2 class="title" data-fit data-maxh="24">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ed-outro-card"><span class="ed-outro-badge">${esc(deckLbl)}</span><div class="ed-outro-rec">${esc(sent)}</div><div class="ed-outro-prompt">${esc(promptTxt)}</div></div>${MD.fluxdEndCardHero(mode)}</div></div>`;
        }
        const cards = ["11", "14", "17", "20"].map((no, i, arr) => `<div class="ct-card${i === arr.length - 1 ? " is-top" : ""}" data-i="${i}"><span class="ct-cno">${no}</span><div class="ct-clines"><i></i><i></i><i></i></div><span class="ct-clbl">${i === arr.length - 1 ? esc(deckLbl) : "PROTOCOL"}</span></div>`).join("");
        return `<div class="k k-cta"><div class="box">${kicker(s, c)}${s.title ? `<h2 class="title" data-fit data-maxh="26">${MD.tx(s.title, { split: splitFor(T(c, "title", "maskUp")) })}</h2>` : ""}<div class="ct-comment-box"><div class="ct-hdr"><span>Comments</span><span class="ct-hearts">❤️ +37</span></div><div class="ct-input"><div class="ct-kw-wrap"><i class="ct-dot"></i><span class="ct-kw">${MD.tx(kw, { split: "chars" })}</span></div><span class="ct-post">Post</span></div></div><div class="ct-deck">${cards}</div><div class="ct-sent">✳ ${esc(sent)}</div></div></div>`;
      },
      plan: (s, c) => {
        const e = [];
        const isEditorial = c && c.st && c.st.id === "editorial";
        if (s.kicker && !isEditorial) e.push(ev(0.06, ".kicker", T(c, "kicker", "fadeUp"), 1));
        if (s.title) e.push(titleEvent(c, s, 0.1, s.title, ".title"));
        if (isEditorial) {
          e.push(ev(0.28, ".ed-outro-card", "rise", 1, { d: 0.52 }, "card-place", "start"));
          e.push(ev(0.48, ".ed-endcard-hero", "fluxdBlink", 1, {}, "tap", "start"));
          return e;
        }
        e.push(ev(0.2, ".ct-comment-box", "fadeUp", 1, { y: 18, d: 0.45 }));
        e.push(ev(0.38, ".ct-kw", "typewriter", MD.count(s.keyword || "FLUX", "chars"), { rate: 0.065 }, "tick", "start"));
        e.push(ev(0.65, ".ct-card", "cardFan", 4, {}, "card-fan", "start"));
        e.push(ev(1.25, ".ct-sent", "overshootPop", 1, { d: 0.45 }, "confirm", "start"));
        return e;
      },
    },
    // Vox Guide (@justdodani) 7-Layer Back-to-Front Magazine Cut-Out Diorama & Ransom-Note Explainer
    diorama: {
      label: "Vox 1960s Magazine Cut-Out Diorama",
      fields: ["title", "sub", "year", "fact", "timelineStart", "timelineEnd", "turn", "pieces"],
      min: (s) => Math.max(3.6, (s.title ? readSecs(s.title) * 0.55 : 0) + 2.2),
      markup: (s, c) => {
        const isTurn = Boolean(s.turn);
        const yr = s.year || (isTurn ? "2016" : "1882");
        const fact = s.fact || (isTurn ? "Rhône Glacier retreated 1.8 km" : "Furka Pass, Switzerland · 2,429 m");
        const tlA = s.timelineStart || "1882: BUILT AT GLACIER";
        const tlB = s.timelineEnd || (isTurn ? "2016: CLOSED (BARE VALLEY)" : "1964: GOLDFINGER FILMED");
        const pcs = s.pieces || {};
        const heroCustom = pcs.hero && c.asset ? c.asset(pcs.hero) : null;
        return `<div class="k k-diorama">
          <div class="dio-stage" data-turn="${isTurn ? "1" : "0"}">
            <svg width="0" height="0" style="position:absolute">
              <defs>
                <filter id="dio-torn-edge" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="n"/>
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
                <pattern id="dio-dots" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.15" fill="rgba(24,20,16,0.12)"/>
                </pattern>
              </defs>
            </svg>
            <div class="dio-cam">
              <svg class="dio-svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
                <!-- LAYER 1 (BACK): Torn Sky Band (21:9 blue magazine gradient with torn white paper border) -->
                <g class="dio-l-sky" filter="url(#dio-torn-edge)">
                  <polygon points="18,18 982,14 986,295 14,302" fill="#FFFFFF"/>
                  <polygon points="26,26 974,22 978,286 22,292" fill="#3B82C4"/>
                  <polygon points="26,26 974,22 978,286 22,292" fill="url(#dio-dots)"/>
                </g>

                <!-- LAYER 2 (BACK-MID): Separate Cut-Out Clouds & Birds (Always Moving) -->
                <g class="dio-l-clouds">
                  <g class="dio-mover-clouds">
                    <!-- Cloud 1 -->
                    <g transform="translate(85, 68)">
                      <path d="M0,42 C-12,42 -18,26 -6,18 C2,4 24,2 36,12 C48,0 74,4 82,20 C96,22 96,42 80,44 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round"/>
                      <path d="M0,42 C-12,42 -18,26 -6,18 C2,4 24,2 36,12 C48,0 74,4 82,20 C96,22 96,42 80,44 Z" fill="#E6DFD3"/>
                    </g>
                    <!-- Cloud 2 -->
                    <g transform="translate(680, 52)">
                      <path d="M0,38 C-10,38 -14,22 -4,15 C4,3 22,2 34,11 C46,1 68,5 74,18 C88,20 88,38 72,40 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round"/>
                      <path d="M0,38 C-10,38 -14,22 -4,15 C4,3 22,2 34,11 C46,1 68,5 74,18 C88,20 88,38 72,40 Z" fill="#E6DFD3"/>
                    </g>
                    <!-- Cloud 3 -->
                    <g transform="translate(830, 145) scale(0.85)">
                      <path d="M0,38 C-10,38 -14,22 -4,15 C4,3 22,2 34,11 C46,1 68,5 74,18 C88,20 88,38 72,40 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round"/>
                      <path d="M0,38 C-10,38 -14,22 -4,15 C4,3 22,2 34,11 C46,1 68,5 74,18 C88,20 88,38 72,40 Z" fill="#DDD5C7"/>
                    </g>
                  </g>
                  <!-- Cut-Out Birds -->
                  <g class="dio-mover-birds">
                    <g transform="translate(565, 118)">
                      <path d="M0,16 Q14,-6 28,12 Q42,-6 56,16 Q40,22 28,18 Q16,22 0,16 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
                      <path d="M2,16 Q14,-3 28,13 Q42,-3 54,16 Q40,20 28,17 Q16,20 2,16 Z" fill="#4A372B"/>
                    </g>
                    <g transform="translate(635, 152) scale(0.82)">
                      <path d="M0,16 Q14,-6 28,12 Q42,-6 56,16 Q40,22 28,18 Q16,22 0,16 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
                      <path d="M2,16 Q14,-3 28,13 Q42,-3 54,16 Q40,20 28,17 Q16,20 2,16 Z" fill="#3D2E24"/>
                    </g>
                  </g>
                </g>

                <!-- LAYER 3 (MIDDLE): Jagged Alpine Mountain Ridge Cut-Out + Bare Valley Floor -->
                <g class="dio-l-mountains">
                  <polygon points="10,435 10,215 95,125 185,205 285,118 395,215 485,155 595,235 715,112 835,210 925,135 990,225 990,435" fill="#FFFFFF"/>
                  <polygon points="18,428 18,222 95,136 185,214 285,128 395,224 485,165 595,242 715,122 835,218 925,146 982,232 982,428" fill="#5B5852"/>
                  <!-- Snow & Halftone Ridges -->
                  <polygon points="95,136 142,178 118,195 75,162" fill="#EAE3D5"/>
                  <polygon points="285,128 345,182 310,205 245,165" fill="#EAE3D5"/>
                  <polygon points="715,122 785,180 745,212 675,168" fill="#EAE3D5"/>
                  <!-- Bare Valley Cleft (revealed when glacier slides back) -->
                  <polygon points="445,218 595,242 715,175 795,385 430,395" fill="#7D7265"/>
                </g>

                <!-- LAYER 3.5 (THE STORY TURN PIECE): The Rhône Glacier Cut-Out (Slides away on cue!) -->
                <g class="dio-l-glacier">
                  <g class="dio-glacier-body">
                    <polygon points="435,210 585,192 738,162 845,355 685,392 442,382" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>
                    <polygon points="442,216 585,198 732,170 835,348 682,384 448,374" fill="#B8D4DE"/>
                    <path d="M485,245 L665,225 L765,335 L525,355 Z" fill="#DDF0F5"/>
                    <path d="M510,265 L695,285 M545,310 L745,325" stroke="#6FA3B8" stroke-width="4" stroke-dasharray="12 6"/>
                  </g>
                </g>

                <!-- LAYER 4 (FRONT GROUND): Winding Furka Pass Hairpin Road & Grass Slope Cut-Out -->
                <g class="dio-l-road">
                  <!-- Green/Ochre Alpine Slope -->
                  <polygon points="10,685 10,385 385,355 895,365 990,425 990,685" fill="#FFFFFF"/>
                  <polygon points="18,678 18,392 385,362 890,372 982,432 982,678" fill="#7B7E4C"/>
                  <!-- Winding Hairpin Road with Torn White Paper Border -->
                  <path d="M 18,485 C 240,475 760,425 835,485 C 895,535 725,615 345,595 L 18,585 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>
                  <path d="M 18,492 C 240,482 750,432 825,488 C 882,532 715,606 345,588 L 18,578 Z" fill="#8C857B"/>
                  <path d="M 45,535 C 260,525 715,475 785,515 C 825,542 680,575 345,562" fill="none" stroke="#EAE2D3" stroke-width="3.5" stroke-dasharray="14 10"/>
                </g>

                <!-- LAYER 5 (HERO SUBJECT): Hotel Belvédère Stacked in 3 Parts (Base -> Floors -> Mansard Roof) -->
                <g class="dio-l-hero">
                  ${heroCustom ? `<image href="${esc(heroCustom)}" x="145" y="175" width="270" height="310" preserveAspectRatio="xMidYBottom meet"/>` : `
                  <!-- Part 5A: Stone Foundation & Red Sunblind Terrace Base -->
                  <g class="dio-h-base">
                    <rect x="172" y="348" width="216" height="122" rx="4" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10"/>
                    <rect x="178" y="354" width="204" height="110" fill="#8C8479" stroke="#2B2623" stroke-width="2.5"/>
                    <rect x="184" y="362" width="192" height="24" fill="#C93B2B"/>
                    <text x="280" y="350" text-anchor="middle" font-family="serif" font-weight="bold" font-size="18" fill="#C93B2B">HOTEL</text>
                    <rect x="196" y="394" width="28" height="38" fill="#2B2623"/><rect x="238" y="394" width="28" height="38" fill="#2B2623"/><rect x="282" y="394" width="28" height="38" fill="#2B2623"/><rect x="324" y="394" width="28" height="38" fill="#2B2623"/>
                  </g>
                  <!-- Part 5B: Cream Upper Façade Floors -->
                  <g class="dio-h-floors">
                    <rect x="182" y="252" width="196" height="102" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9"/>
                    <rect x="188" y="258" width="184" height="92" fill="#DFD5C5" stroke="#2B2623" stroke-width="2.5"/>
                    <rect x="204" y="272" width="22" height="30" fill="#3A3530"/><rect x="242" y="272" width="22" height="30" fill="#3A3530"/><rect x="280" y="272" width="22" height="30" fill="#3A3530"/><rect x="318" y="272" width="22" height="30" fill="#3A3530"/>
                    <rect x="204" y="312" width="22" height="30" fill="#3A3530"/><rect x="242" y="312" width="22" height="30" fill="#3A3530"/><rect x="280" y="312" width="22" height="30" fill="#3A3530"/><rect x="318" y="312" width="22" height="30" fill="#3A3530"/>
                  </g>
                  <!-- Part 5C: Iconic Mansard Slate Roof & Dormers -->
                  <g class="dio-h-roof">
                    <polygon points="174,258 206,192 354,192 386,258" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round"/>
                    <polygon points="180,256 210,198 350,198 380,256" fill="#4A4642" stroke="#2B2623" stroke-width="2.5"/>
                    <rect x="218" y="212" width="24" height="32" fill="#DFD5C5" stroke="#2B2623" stroke-width="2"/>
                    <rect x="268" y="208" width="26" height="36" fill="#DFD5C5" stroke="#2B2623" stroke-width="2"/>
                    <rect x="318" y="212" width="24" height="32" fill="#DFD5C5" stroke="#2B2623" stroke-width="2"/>
                  </g>`}
                </g>

                <!-- LAYER 6 (CONTINUOUS FOREGROUND LIFE): 1960s Yellow Swiss Post Bus + Steam Train -->
                <g class="dio-l-movers">
                  <!-- Yellow 1960s Post Bus on the Pass Road -->
                  <g transform="translate(365, 452)"><g class="dio-mover-bus">
                    <rect x="-4" y="-4" width="128" height="52" rx="8" fill="#FFFFFF"/>
                    <rect x="0" y="0" width="120" height="44" rx="6" fill="#E5A93B" stroke="#231F1C" stroke-width="2.5"/>
                    <rect x="6" y="6" width="108" height="16" rx="3" fill="#EFE8D8"/>
                    <rect x="12" y="8" width="18" height="12" fill="#3A4A52"/><rect x="36" y="8" width="18" height="12" fill="#3A4A52"/><rect x="60" y="8" width="18" height="12" fill="#3A4A52"/><rect x="84" y="8" width="24" height="12" fill="#3A4A52"/>
                    <circle cx="26" cy="44" r="10" fill="#231F1C" stroke="#FFFFFF" stroke-width="3"/>
                    <circle cx="94" cy="44" r="10" fill="#231F1C" stroke="#FFFFFF" stroke-width="3"/>
                  </g></g>
                  <!-- Furka Cogwheel Steam Train at Bottom Left -->
                  <g transform="translate(75, 528)"><g class="dio-mover-train">
                    <!-- Cut-out smoke puffs -->
                    <circle cx="145" cy="-22" r="14" fill="#FFFFFF"/><circle cx="145" cy="-22" r="11" fill="#E5DEC9"/>
                    <circle cx="122" cy="-34" r="18" fill="#FFFFFF"/><circle cx="122" cy="-34" r="14" fill="#E5DEC9"/>
                    <!-- Passenger Coach + Locomotive -->
                    <rect x="-6" y="-6" width="176" height="62" rx="6" fill="#FFFFFF"/>
                    <rect x="0" y="4" width="88" height="44" fill="#9E3328" stroke="#231F1C" stroke-width="2.5"/>
                    <rect x="10" y="12" width="16" height="14" fill="#EAE2D3"/><rect x="36" y="12" width="16" height="14" fill="#EAE2D3"/><rect x="62" y="12" width="16" height="14" fill="#EAE2D3"/>
                    <rect x="92" y="12" width="68" height="36" fill="#2A2826" stroke="#231F1C" stroke-width="2.5"/>
                    <rect x="94" y="-2" width="28" height="46" fill="#2A2826"/>
                    <rect x="138" y="-12" width="12" height="26" fill="#2A2826"/>
                    <circle cx="22" cy="50" r="9" fill="#231F1C"/><circle cx="66" cy="50" r="9" fill="#231F1C"/><circle cx="114" cy="50" r="9" fill="#231F1C"/><circle cx="146" cy="50" r="9" fill="#231F1C"/>
                  </g></g>
                </g>
              </svg>
            </div>

            <!-- LAYER 7 (TOP RANSOM-NOTE NEWSPAPER SCRAP TITLES — Word by Word) -->
            <div class="dio-titles">
              ${s.title ? MD.ransomTx(s.title) : ""}
              ${s.sub ? `<div class="dio-sub-row">${MD.ransomTx(s.sub)}</div>` : ""}
            </div>

            <!-- LAYER 8 (FACTS OVERLAY: Map Pin Clipping + Animated Year Timeline Bar) -->
            <div class="dio-facts">
              <div class="dio-clip-card">
                <i class="dio-pin-dot"></i>
                <span class="dio-clip-yr">${esc(yr)}</span>
                <span class="dio-clip-tx">${esc(fact)}</span>
              </div>
              <div class="dio-tl-bar">
                <div class="dio-tl-labels">
                  <span>${esc(tlA)}</span>
                  <span class="dio-tl-end">${esc(tlB)}</span>
                </div>
                <div class="dio-tl-track"><div class="dio-tl-fill"></div></div>
              </div>
            </div>
            <div class="dio-paper-tex" data-layout-ignore></div>
          </div>
        </div>`;
      },
      plan: (s) => {
        const e = [];
        e.push(ev(0.0, ".dio-stage", "dioramaRun", 1, {}, "card-place", "start"));
        if (s.title) {
          e.push(ev(0.35, ".dio-titles", "ransomDrop", MD.count(s.title) + (s.sub ? MD.count(s.sub) : 0), { d: 0.55, st: 0.095 }, "tap", "start"));
        }
        e.push(ev(0.85, ".dio-clip-card", "fadeUp", 1, { y: 35, d: 0.55 }, "card-slide", "start"));
        e.push(ev(1.05, ".dio-tl-bar", "fadeUp", 1, { y: 35, d: 0.55 }, "scratch", "start"));
        return e;
      },
    },
    // anything the kinds above can't say: your own HTML + events, styled by the theme's tokens
    // Official FLUXD Brand Bumper Scene Kind (Blink 01A, Blink 01B, Blink 03, Blink 04)
    // lemo-opuscar Executable Scene Kinds: lighttable, satellite, kinomontage, whiteboard
    lighttable: {
      fields: ["kicker", "title", "text", "value", "source", "cutout"],
      min: () => 3.2,
      markup: (s, c) => {
        const catId = esc(s.kicker || "ARCHIVE // PLATE VII · LOC-CC0");
        const headline = s.title || s.text || "The original ledger records 59 seconds.";
        const val = esc(s.value || "59.0s");
        const src = esc(s.source || "VERIFIED PRIMARY RECORD // NARA / RBI ARCHIVE");
        const imgHtml = s.cutout ? `<img src="${esc(c.asset ? c.asset(s.cutout) : s.cutout)}" alt="" style="max-height:calc(var(--u)*22);border:2px solid #111315;"/>` : "";
        return `
          <div class="k k-lighttable">
            <div class="lt-stage">
              <div class="lt-backlight"></div>
              <div class="lt-doc-sheet">
                <div class="lt-cat-row"><span>${catId}</span><span>TRANS-ILLUMINATED 100Hz</span></div>
                ${imgHtml}
                <div class="lt-doc-lines">
                  <div class="lt-line dim">01 // INITIAL DISPATCH ESTIMATE RECORDED IN FIELD LOG</div>
                  <div class="lt-line active"><span class="lt-hl-bar"></span><span class="lt-lit-txt">${MD.tx(headline)}</span></div>
                  <div class="lt-line dim">03 // CROSS-CHECKED AGAINST NEGATIVE EMULSION MARGIN</div>
                </div>
              </div>
              <div class="lt-loupe">
                <div class="lt-loupe-ring">
                  <span class="lt-loupe-tag">LOUPE 2.5× // k=0.16</span>
                  <div class="lt-loupe-focus">${val}</div>
                </div>
              </div>
              <div class="lt-reading-card">
                <div class="lt-rc-lbl">MEASURED ARCHIVE READING</div>
                <div class="lt-rc-val">${val}</div>
                <div class="lt-rc-src">${src}</div>
              </div>
            </div>
          </div>
        `;
      },
      plan: (s) => [
        ev(0.05, ".lt-stage", "loupeDive", 1, {}, { name: "tap", gain: 0.75 }),
        ...(MD.parseNumber(s.value) ? [ev(0.55, ".lt-rc-val", "count", 1, {}, { name: "chips-stack", gain: 0.65 })] : []),
      ],
    },
    satellite: {
      fields: ["kicker", "title", "text", "value", "source"],
      min: () => 3.2,
      markup: (s) => {
        const coords = esc(s.kicker || "26°34'N 56°15'E // ALT 420 KM · NADIR LOCK");
        const claim = s.title || s.text || "Measured corridor narrows to *21 nautical miles*.";
        const reading = esc(s.value || "38.9 KM");
        const credit = esc(s.source || "USGS LANDSAT / ESA SENTINEL-2 · SURVEY OF INDIA COMPLIANT");
        return `
          <div class="k k-satellite">
            <div class="sat-stage">
              <div class="sat-analyst-grid"></div>
              <div class="sat-after-layer"></div>
              <div class="sat-scan-bar"><span>SCAN PASS // MULTI-SPECTRAL NADIR</span></div>
              <svg class="sat-svg-overlay" viewBox="0 0 1000 560" preserveAspectRatio="none">
                <path class="sat-old-shore" d="M 140,420 Q 360,340 540,390 T 860,260" fill="none" stroke="rgba(242,245,246,0.42)" stroke-width="2" stroke-dasharray="8 6"/>
                <line class="sat-range-line" x1="240" y1="360" x2="720" y2="220" stroke="#F2F5F6" stroke-width="2.5"/>
                <circle cx="240" cy="360" r="6" fill="#FFBE55"/>
                <circle cx="720" cy="220" r="6" fill="#FFBE55"/>
              </svg>
              <div class="sat-reticle">
                <span class="sr-tl"></span><span class="sr-tr"></span><span class="sr-bl"></span><span class="sr-br"></span>
                <div class="sat-ret-lbl">TARGET LOCK</div>
              </div>
              <div class="sat-reading-panel">
                <div class="sat-coords">${coords}</div>
                <div class="sat-metric">${reading}</div>
                <div class="sat-claim">${MD.tx(claim)}</div>
                <div class="sat-credit">${credit}</div>
              </div>
            </div>
          </div>
        `;
      },
      plan: () => [
        ev(0.05, ".sat-stage", "satScan", 1, {}, { name: "swish", gain: 0.7 }),
        ev(0.45, ".sat-claim", "fadeUp", 1, { d: 0.5 }),
      ],
    },
    kinomontage: {
      fields: ["kicker", "title", "text", "value", "source"],
      min: () => 2.8,
      markup: (s) => {
        const tag = esc(s.kicker || "ARCHIVE DOC // 120 BPM CONSTRUCTIVIST CUT");
        const title = s.title || s.text || "THE DOCUMENT IS *MARKED*, NOT QUOTED.";
        const num = esc(s.value || "2,500 / DAY");
        const src = esc(s.source || "PRIMARY RECORD · VERIFIED");
        return `
          <div class="k k-kinomontage">
            <div class="km-stage">
              <div class="km-red-band"><span>${tag}</span></div>
              <div class="km-window">
                <div class="km-doc-head">${src}</div>
                <div class="km-doc-body">
                  <span class="km-doc-mark"></span>
                  <div class="km-doc-quote">${MD.tx(title)}</div>
                </div>
              </div>
              <div class="km-num-block">
                <div class="km-num-val">${num}</div>
                <div class="km-num-unit">MEASURED OUTPUT</div>
              </div>
            </div>
          </div>
        `;
      },
      plan: () => [
        ev(0.02, ".km-stage", "kinoSlam", 1, {}, { name: "punch", gain: 0.85 }),
      ],
    },
    whiteboard: {
      fields: ["kicker", "title", "text", "equation", "sub"],
      min: () => 3.0,
      markup: (s) => {
        const region = esc(s.kicker || "BOARD REGION 01 // STROKE-ORDER DERIVATION");
        const title = s.title || s.text || "Every stroke follows the *slow-fast-slow* hand curve.";
        const eq = esc(s.equation || "Φ = ∬ F · dA   ⇒   CD = k₁ · (λ / NA)");
        const note = esc(s.sub || "Blue = physical process · Red = governing bottleneck");
        return `
          <div class="k k-whiteboard">
            <div class="wb-stage">
              <div class="wb-sheen"></div>
              <div class="wb-ghost">f(x) = ∫ e^(-st) dt   [ERASED PRIOR HYPOTHESIS]</div>
              <div class="wb-region-tag">${region}</div>
              <div class="wb-board-card">
                <h2 class="wb-title">${MD.tx(title)}</h2>
                <div class="wb-eq-box">
                  <svg class="wb-svg" viewBox="0 0 860 150">
                    <rect class="wb-stroke" x="14" y="18" width="832" height="114" rx="10" fill="none" stroke="#2563EB" stroke-width="4"/>
                    <path class="wb-stroke" d="M 38,112 L 820,112" stroke="#E04826" stroke-width="5" stroke-linecap="round"/>
                  </svg>
                  <div class="wb-eq-txt">${eq}</div>
                </div>
                <div class="wb-note">${note}</div>
              </div>
            </div>
          </div>
        `;
      },
      plan: () => [
        ev(0.04, ".wb-stage", "wbDraw", 1, {}, { name: "scratch", gain: 0.72 }),
        ev(0.25, ".wb-title", "fadeUp", 1, { d: 0.48 }),
        ev(0.55, ".wb-eq-txt", "fadeUp", 1, { d: 0.52 }),
      ],
    },
    bumper: {
      fields: ["mode", "sub"],
      min: () => 2.0,
      markup: (s) => {
        const mode = s.mode || "blink04";
        const sub = s.sub || "WHERE CINEMA OPTICS, PHYSICAL LAW & GLOBAL SYSTEMS COLLIDE";
        return `
          <div class="k k-bumper">
            <div class="fb-stage" data-mode="${esc(mode)}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;position:relative;">
              <div class="fb-phi" style="width:calc(var(--u)*18);height:calc(var(--u)*18);display:${mode === "blink01b" || mode === "blink03" ? "none" : "flex"};align-items:center;justify-content:center;">
                ${MD.fluxdPhi2()}
              </div>
              <div class="fb-word" style="width:calc(var(--u)*52);max-width:82%;display:${mode === "blink01a" ? "none" : "flex"};align-items:center;justify-content:center;">
                ${MD.fluxdWordmark()}
              </div>
              <div class="fb-sub" style="margin-top:calc(var(--u)*3.2);font-family:var(--f-mono);font-size:calc(var(--u)*1.45);letter-spacing:0.14em;opacity:0.78;text-transform:uppercase;">
                ${esc(sub)}
              </div>
            </div>
          </div>
        `;
      },
      plan: () => [
        ev(0.02, ".fb-stage", "fluxdBlink", 1, {}, { name: "tap", gain: 0.75 }),
        ev(0.72, ".fb-sub", "fadeUp", 1, { d: 0.45 }),
      ],
    },
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
    // feitangyuan/onetake Carry-Across-the-Cut + 180-deg Shutter Motion Blur + motionmaxxing 58% Ease-Out Landing
    carryMorph: {
      ov: 0.38,
      run: (tl, out, inn, at, ov, c) => {
        const half = ov / 2;
        const axis = c && c.fmt === "portrait" ? "yPercent" : "xPercent";
        // Outgoing accelerates (37% ease-in) with 180-deg directional motion blur smear
        tl.fromTo(
          out,
          { [axis]: 0, scale: 1, filter: "blur(0px)", opacity: 1 },
          { [axis]: -18, scale: 1.06, filter: "blur(7px)", opacity: 0, duration: half, ease: "power3.in" },
          at - half
        );
        // Incoming decelerates from oversize (58% ease-out, never scale:0) and clears shutter blur
        tl.fromTo(
          inn,
          { [axis]: 14, scale: 1.08, filter: "blur(6px)", opacity: 0 },
          { [axis]: 0, scale: 1, filter: "blur(0px)", opacity: 1, duration: half * 1.45, ease: "expo.out" },
          at - half * 0.3
        );
      },
    },
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
        const kPhrases = el.querySelectorAll(".ks-phrase");
        kPhrases.forEach((ph) => {
          const p0 = +ph.dataset.pstart || 0, p1 = +ph.dataset.pend || s.dur;
          tl.set(ph, { opacity: 0, visibility: "hidden", y: 5 }, 0);
          tl.fromTo(ph, { opacity: 0, visibility: "visible", y: 5 }, { opacity: 1, visibility: "visible", y: 0, duration: 0.10, ease: "power2.out" }, s.t0 + p0);
          tl.set(ph, { opacity: 0, visibility: "hidden" }, s.t0 + p1);
          ph.querySelectorAll(".kw").forEach((kw) => {
            const w0 = +kw.dataset.start || 0, w1 = +kw.dataset.end || (w0 + 0.22);
            tl.set(kw, { opacity: 0.42, scale: 1, color: "#F6F3EC" }, 0);
            tl.to(kw, { opacity: 1, scale: 1.08, color: "#FACC15", duration: 0.05, ease: "power2.out" }, s.t0 + w0);
            tl.to(kw, { opacity: 0.78, scale: 1.0, color: "#F6F3EC", duration: 0.07, ease: "power1.out" }, s.t0 + w1);
          });
        });
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
