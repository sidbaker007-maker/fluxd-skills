/* FLUXD Kinetic Editorial — Open-Stage Swiss Grid Typography, Floating Artifacts & Active-Word Karaoke.
   Synthesizes Josef Müller-Brockmann's 12-column grid, SDMK's "Space Is a Material",
   bang-motion Law #4 (Max 2 text levels on stage, zero boxy clutter), and HeyGen HyperFrames motion rules. */
(function () {
  const esc = (s) => MD.esc(s);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });

  MD.style("editorial", {
    order: 0.05,
    name: "Editorial (FLUXD Open Stage)",
    tagline: "Open-stage Swiss grid typography, frameless floating artifacts, sequential card fans & active-word karaoke",
    look: "Deep Anamorphic Carbon (#0E0E10) and Warm Silver-Halide Paper (#F4EFE6) open stages with 12-column hairline architecture, Instrument Serif + Plus Jakarta Sans hierarchy, continuous vermilion underline sweeps (zero clunky per-word boxes), sequential multi-card reveals, and lower-third active-word karaoke captions.",
    bestFor: [
      "Information-based & discussion-based Reels and YouTube video essays",
      "Book, audiobook, film & cultural recommendations (e.g., Many Ramayanas, cinema craft)",
      "Comparative folklore, history, geopolitics & socio-economic analysis",
      "Physics & mathematical intuition explainers without visual clutter",
    ],
    avoid: "spammy growth-hacker padlock widgets or overcrowded multi-box slides",
    fonts: [
      {
        name: "Editorial Serif + Grotesk",
        display: "Instrument Serif",
        displayKind: "serif",
        text: "Inter",
        mono: "JetBrains Mono",
        num: "Space Grotesk",
        extra: ["Syne"],
        vars: { "--dw": 400, "--dls": "-0.022em", "--dlh": "1.02", "--tcase": "none", "--nw": 700, "--f-serif": '"Instrument Serif", Georgia, serif' },
      },
      {
        name: "Swiss Syne + Instrument",
        display: "Syne",
        text: "Inter",
        mono: "JetBrains Mono",
        num: "Space Grotesk",
        extra: ["Instrument Serif"],
        vars: { "--dw": 700, "--dls": "-0.03em", "--dlh": "1.02", "--tcase": "none", "--nw": 700, "--f-serif": '"Instrument Serif", Georgia, serif' },
      },
      {
        name: "Literary Fraunces + DM Sans",
        display: "Fraunces",
        displayKind: "serif",
        text: "DM Sans",
        mono: "JetBrains Mono",
        num: "Space Grotesk",
        vars: { "--dw": 600, "--dls": "-0.024em", "--dlh": "1.0", "--tcase": "none", "--nw": 700 },
      },
    ],
    palettes: [
      {
        name: "Editorial Carbon Dark",
        bg: "#0E0E10", ink: "#F6F3EC", accent: "#FACC15", accent2: "#E04826", accent3: "#38BDF8", accentInk: "#0E0E10",
        muted: "#8E9299", surface: "#16181D", line: "rgba(246, 243, 236, 0.10)",
        vars: { "--ed-rule": "rgba(246, 243, 236, 0.14)", "--ed-glow": "rgba(224, 72, 38, 0.10)", "--ed-glow2": "rgba(250, 204, 21, 0.08)" },
      },
      {
        name: "Silver-Halide Paper Light",
        bg: "#F4EFE6", ink: "#141413", accent: "#E04826", accent2: "#1E3A4C", accent3: "#B45309", accentInk: "#FFFFFF",
        muted: "#57534E", surface: "#EAE3D5", line: "rgba(20, 20, 19, 0.10)",
        vars: { "--ed-rule": "rgba(20, 20, 19, 0.16)", "--ed-glow": "rgba(224, 72, 38, 0.07)", "--ed-glow2": "rgba(30, 58, 76, 0.06)" },
      },
      {
        name: "Cherenkov Slate Dark",
        bg: "#0B1118", ink: "#F4F1EA", accent: "#38BDF8", accent2: "#FACC15", accent3: "#E04826", accentInk: "#0B1118",
        muted: "#8B95A5", surface: "#131C27", line: "rgba(244, 241, 234, 0.10)",
        vars: { "--ed-rule": "rgba(56, 189, 248, 0.18)", "--ed-glow": "rgba(56, 189, 248, 0.12)", "--ed-glow2": "rgba(250, 204, 21, 0.08)" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "fadeUp", item: "fadeUp", card: "rise",
      word: "maskUp", number: "count", numberIn: "fadeUp", media: "scaleIn", callout: "fadeUp",
      logo: "scaleIn", wordmark: "charRise", cta: "rise", quote: "maskUp", emph: "mark",
    },
    O: { title: { d: 0.52, st: 0.045 }, word: { from: 1.18 } },
    S: {
      title: { name: "swish", gain: 0.48 },
      word: { name: "tap", gain: 0.55 },
      count: { name: "tick", gain: 0.55 },
      item: { name: "card-slide", gain: 0.52 },
      card: { name: "card-place", gain: 0.58 },
      media: { name: "card-slide", gain: 0.58 },
      callout: { name: "scratch", gain: 0.50 },
      transitions: { carryMorph: "whoosh-short", matchCut: "tap" },
    },
    sfxGain: 0.72,
    drift: 0.022,
    grain: 0.05,
    listIcon: "check",
    transitionFor: (s, i) => (s.transition ? s.transition : i % 2 === 1 ? "carryMorph" : "matchCut"),
    tone: (s) => (s.tone ? s.tone : "base"),

    background: {
      markup: () => `
        <div class="ed-grid" data-layout-ignore></div>
        <div class="ed-ambient g1" data-layout-ignore></div>
        <div class="ed-ambient g2" data-layout-ignore></div>
      `,
      run: (tl, c) => {
        const D = c.P.duration;
        const g1 = document.querySelector(".ed-ambient.g1");
        if (g1) tl.fromTo(g1, { xPercent: -6, yPercent: -4, scale: 0.95 }, { xPercent: 8, yPercent: 6, scale: 1.08, duration: D, ease: "sine.inOut" }, 0);
      },
    },

    sceneDecor: (s, i, c) => {
      const num = String((i || 0) + 1).padStart(2, "0");
      const chap = esc(s.chapter || s.kicker || `BEAT ${num}`);
      const src = s.source ? `<div class="ed-source-line" data-layout-ignore><span class="ed-src-dot"></span><span>${esc(s.source)}</span></div>` : "";
      const lockupSvg = MD.fluxdLockup ? MD.fluxdLockup("ed-brand-lockup") : "";
      const sealSvg = MD.fluxdSeal ? MD.fluxdSeal("ed-brand-seal") : "";
      return `
        <div class="ed-top-bar" data-layout-ignore>
          <span class="ed-chap">${chap}</span>
          <span class="ed-brand-hdr">${lockupSvg}<span class="ed-idx">// ${num}</span></span>
        </div>
        ${src}
        <div class="ed-corner-seal" data-layout-ignore>${sealSvg}</div>
      `;
    },
  });
})();
