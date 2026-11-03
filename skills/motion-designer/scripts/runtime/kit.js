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
    pop: {
      len: (n, o) => D(o, "d", 0.7) + D(o, "st", 0.09) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: D(o, "from", 0.6) }, { opacity: 1, scale: 1, duration: D(o, "d", 0.7), stagger: D(o, "st", 0.09), ease: D(o, "ease", "back.out(1.7)") }, at),
    },
    rise: {
      len: (n, o) => D(o, "d", 1.0) + D(o, "st", 0.12) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, yPercent: D(o, "y", 18), rotationX: D(o, "rx", 18), transformPerspective: 1600 }, { opacity: 1, yPercent: 0, rotationX: 0, duration: D(o, "d", 1.0), stagger: D(o, "st", 0.12), ease: "expo.out" }, at),
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
      if (/[?&]sb=1/.test(location.search) || P.sb || window.__MD_SB) storyboardMode(tl, P);
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
    const t0 = P.initialTime != null ? +P.initialTime : +(new URLSearchParams(location.search).get("t") || 0);
    seek(t0);
    window.addEventListener("message", (e) => { if (e.data && e.data.md === "seek" && typeof e.data.t === "number") seek(e.data.t); });
    window.parent && window.parent.postMessage({ md: "ready" }, "*");
  }
})(typeof window !== "undefined" ? window : globalThis);
