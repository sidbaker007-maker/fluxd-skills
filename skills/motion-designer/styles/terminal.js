/* Terminal — the launch as a session. Lines type out behind a prompt with a live caret, words decode
   out of glyph noise, panes open on a phosphor grid with a scan band drifting down, lists log in as
   checked lines, before/after reads as a diff, and a status bar runs along the bottom. */
MD.style("terminal", {
  order: 5,
  name: "Terminal",
  tagline: "Your launch, typed live in a terminal",
  look: "Lines type out behind a $ prompt with a blinking caret; words decode out of glyph noise; panes open on a phosphor grid with a drifting scan band; lists log in as checked lines; before/after reads like a git diff; a tmux-style status bar runs along the bottom.",
  bestFor: ["dev tools", "CLIs and APIs", "AI agents", "open-source launches", "technical changelogs", "anything you install with a command"],
  avoid: "consumer lifestyle brands, fashion, food, anything that should feel warm or soft",
  fonts: [
    { name: "JetBrains", display: "JetBrains Mono", text: "JetBrains Mono", mono: "JetBrains Mono", vars: { "--dw": 800, "--dls": "-0.045em", "--dlh": "1.08", "--tw": 400 } },
    { name: "Geist Mono", display: "Geist Mono", text: "Geist", mono: "Geist Mono", vars: { "--dw": 700, "--dls": "-0.05em", "--dlh": "1.06" } },
    { name: "Grotesk", display: "Space Grotesk", text: "JetBrains Mono", mono: "JetBrains Mono", vars: { "--dw": 700, "--dls": "-0.045em", "--dlh": "1.0" } },
  ],
  palettes: [
    { name: "Phosphor", bg: "#050806", ink: "#D9F7E3", accent: "#3BFF8A", accentInk: "#021108", muted: "#6F8B7A", surface: "#0B1410", vars: { "--line": "rgba(59, 255, 138, 0.20)", "--del": "#FF6B6B", "--glowc": "rgba(59, 255, 138, 0.45)", "--gridc": "rgba(59, 255, 138, 0.07)" } },
    { name: "Amber", bg: "#0B0804", ink: "#FFE9C4", accent: "#FFB000", accentInk: "#160E00", muted: "#9C8565", surface: "#15100A", vars: { "--line": "rgba(255, 176, 0, 0.22)", "--del": "#FF6B5A", "--glowc": "rgba(255, 176, 0, 0.45)", "--gridc": "rgba(255, 176, 0, 0.07)" } },
    { name: "Ice", bg: "#060912", ink: "#E4ECFA", accent: "#7AA2FF", accentInk: "#050A1A", muted: "#76829C", surface: "#0D1322", vars: { "--line": "rgba(122, 162, 255, 0.22)", "--del": "#FF7A90", "--glowc": "rgba(122, 162, 255, 0.45)", "--gridc": "rgba(122, 162, 255, 0.07)" } },
    { name: "Paper", bg: "#F1EEE6", ink: "#141414", accent: "#0A8A3E", accentInk: "#FFFFFF", muted: "#6B6860", surface: "#E5E1D6", vars: { "--line": "rgba(20, 20, 20, 0.16)", "--del": "#C8322B", "--glowc": "transparent", "--gridc": "rgba(20, 20, 20, 0.06)" } },
  ],
  T: { title: "typewriter", body: "flicker", kicker: "flicker", item: "flicker", card: "paneIn", word: "scramble", number: "count", numberIn: "flicker", media: "paneIn", callout: "flicker", logo: "paneIn", wordmark: "scramble", cta: "flicker", quote: "typewriter", emph: null },
  O: { title: { rate: 0.034 }, quote: { rate: 0.024 }, word: { d: 0.5, glyphs: "01<>/\\[]{}#$%=+*_-:;!?" } },
  S: {
    word: { name: ["glitch-ui", "tick"], gain: 0.55 },
    count: { name: "confirm", gain: 0.7 },
    item: { name: ["tick", "tick-2"], gain: 0.6 },
    card: { name: ["click-ui", "click-release"], gain: 0.55 },
    media: { name: "panel-in", gain: 0.6 },
    callout: { name: "select", gain: 0.5 },
    logo: { name: "tone-up", gain: 0.7 },
    cta: { name: "confirm", gain: 0.6 },
    bars: { name: "scroll", gain: 0.5 },
    strike: { name: "error-soft", gain: 0.45 },
    transitions: { scan: "glitch-ui", cut: null },
  },
  sfxGain: 0.8,
  drift: 0,
  grain: 0.1,
  transition: "scan",
  listIcon: "check",
  tone: () => "base",
  fill: { hook: { maxh: 56, max: 13 }, statement: { maxh: 44, max: 9.5 }, quote: { maxh: 46, max: 8 }, words: { maxh: 50, max: 30 }, outro: { maxh: 30, max: 10 }, stat: { maxh: 44, max: 34 } },

  // a tmux-style status line on every scene
  sceneDecor: (s, i, c) => {
    const brand = (c.video.brand && (c.video.brand.name || c.video.brand.url)) || c.video.title || "session";
    const no = `${String(i + 1).padStart(2, "0")}/${String(c.n).padStart(2, "0")}`;
    return `<div class="tm-status" data-layout-ignore><span class="tm-s0">[${i}] ${MD.esc(String(brand).toLowerCase())}</span><span class="tm-s1">${MD.esc(s.kind)}</span><span class="tm-s2">${no}</span></div>`;
  },

  background: {
    markup: () => `<div class="tm-bg"><i class="tm-grid"></i><i class="tm-band"></i><i class="tm-lines"></i><i class="tm-vig"></i></div>`,
    run: (tl, c) => {
      const D = c.P.duration;
      const sweep = 5.5;
      tl.fromTo(".tm-band", { yPercent: -120 }, { yPercent: 520, duration: sweep, ease: "none", repeat: Math.max(0, Math.floor(D / sweep) - 1) }, 0);
      tl.fromTo(".tm-grid", { y: 0 }, { y: -c.u * 8, duration: D, ease: "none" }, 0);
    },
  },

  // typing: one tick per keystroke-ish, under the picture
  extraCues: (scenes) => {
    const out = [];
    const keys = ["click-ui", "tick", "click-release", "tick-2"];
    let k = 0;
    for (const s of scenes) {
      for (const e of s.events) {
        if (e.move !== "typewriter" || !e.len) continue;
        let t = s.t0 + e.t;
        const end = t + e.len;
        while (t < end) {
          out.push({ name: keys[k % keys.length], at: t, gain: 0.32 });
          t += 0.095 + ((k * 37) % 5) * 0.012;
          k++;
        }
      }
    }
    return out;
  },

  moves: {
    // characters appear one by one; the caret follows and keeps blinking until the scene leaves
    typewriter: {
      len: (n, o) => (o.rate || 0.034) * n * 1.18 + 0.1,
      run: (tl, els, at, o, c, s) => {
        const rate = o.rate || 0.034;
        els.forEach((el) => {
          const ws = Array.from(el.querySelectorAll(".w"));
          if (!ws.length) return;
          // hold the finished size so nothing re-centres while the line types out
          el.style.minHeight = el.getBoundingClientRect().height + "px";
          gsap.set(ws, { display: "none" });
          let i = 0;
          ws.forEach((w) => {
            const cs = Array.from(w.querySelectorAll(".c"));
            tl.set(w, { display: "inline-block" }, at + i * rate);
            if (cs.length) { gsap.set(cs, { display: "none" }); cs.forEach((ch) => { tl.set(ch, { display: "inline-block" }, at + i * rate); i++; }); }
            else i += (w.textContent || "").length;
            i++;
          });
          const caret = el.querySelector(".tm-caret");
          if (caret && s) {
            const te = at + i * rate;
            const end = s.t0 + s.dur + 0.6;
            const n = Math.max(0, Math.floor((end - te - 0.35) / 0.5) - 1);
            tl.to(caret, { opacity: 0, duration: 0.5, ease: "steps(1)", repeat: n, yoyo: true }, te + 0.35);
          }
        });
      },
    },
    // a terminal line flickers on
    flicker: {
      len: (n, o) => 0.42 + (o.st != null ? o.st : 0.09) * (n - 1),
      run: (tl, els, at, o) => {
        gsap.set(els, { opacity: 0 });
        tl.to(els, { keyframes: [{ opacity: 1, x: 0, duration: 0.04 }, { opacity: 0.15, duration: 0.05 }, { opacity: 1, duration: 0.05 }, { opacity: 0.55, duration: 0.04 }, { opacity: 1, duration: 0.24 }], stagger: o.st != null ? o.st : 0.09, ease: "none" }, at);
      },
    },
    // a pane opens top-down in steps, like a buffer drawing
    paneIn: {
      len: (n, o) => (o.d || 0.7) + 0.12 * (n - 1),
      run: (tl, els, at, o) => {
        tl.fromTo(els, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: o.d || 0.7, stagger: 0.12, ease: "steps(9)" }, at);
        tl.fromTo(els, { opacity: 0.3 }, { opacity: 1, duration: (o.d || 0.7) + 0.1, stagger: 0.12, ease: "power1.in" }, at);
      },
    },
  },

  transitions: {
    // a glitch: the old scene jitters out, the new one scans in top-down
    scan: {
      ov: 0.42,
      run: (tl, out, inn, at, ov) => {
        tl.to(out, { keyframes: [{ x: 14, opacity: 0.7, duration: 0.05 }, { x: -9, opacity: 0.3, duration: 0.05 }, { x: 5, opacity: 0, duration: 0.06 }], ease: "none" }, at - ov / 2);
        tl.fromTo(inn, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ov, ease: "steps(7)" }, at - ov / 2 + 0.06);
      },
    },
  },

  kinds: {
    hook: {
      min: (s) => Math.max(MD.kinds.hook.min(s), MD.count(s.text, "chars") * 0.034 + 1.6),
      markup: (s, c) => tmCaret(MD.kinds.hook.markup(s, c), "h1"),
    },
    statement: {
      min: (s) => Math.max(MD.kinds.statement.min(s), MD.count(s.text, "chars") * 0.034 + 1.5),
      markup: (s, c) => tmCaret(MD.kinds.statement.markup(s, c), "h2"),
    },
    outro: {
      min: (s) => Math.max(MD.kinds.outro.min(s), MD.count(s.text, "chars") * 0.034 + 2.2),
      markup: (s, c) => tmCaret(MD.kinds.outro.markup(s, c), "h2"),
    },
    quote: {
      min: (s) => Math.max(MD.kinds.quote.min(s), MD.count(s.text, "chars") * 0.024 + 1.8),
    },
    words: {
      min: (s) => Math.max(1.8, (s.items || []).length * 0.7),
    },
  },
});

// the caret sits at the end of the last line of a typed title
function tmCaret(html, tag) {
  return html.replace(new RegExp(`</span></${tag}>`), `<i class="tm-caret"></i></span></${tag}>`);
}
