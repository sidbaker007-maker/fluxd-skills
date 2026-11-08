/* Journalism — Implements bangtutorial/bang-motion (Visual Journalism & Vintage Sketch) +
   claudemotion.design/#styles (Academic Argument, Slate Social Report & Inclusive Cutpaper / MG-VOXSTAGE). */
(function () {
  const esc = (s) => MD.esc(s);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });

  MD.style("journalism", {
    order: 0.82,
    name: "Journalism",
    tagline: "Investigative visual journalism, VoxStage hot-red map cutouts, vintage engraving sketch & empirical source cards",
    look: "Four investigative modes from bang-motion and claudemotion.design: (1) Dark Visual Journalism (#0B0B0B stage, archival photography, yellow/red highlighter sweeps, verified source badges), (2) VoxStage Hot-Red Map (#C9BB9C archival map ground, B&W halftone cutouts with #D62E1F crimson offset registration outlines & pushpins), (3) Vintage Sketch (sepia parchment, cross-hatched ink engravings, rust marginalia), and (4) Academic Argument (assertion-evidence empirical cards).",
    bestFor: [
      "Geopolitics, maritime chokepoints & supply-chain investigations",
      "India & global socio-economic data journalism (RBI, MOSPI, WID.world, UN Comtrade)",
      "historical & colonial economic deep-dives (Vintage Sketch palette)",
      "map-driven geopolitical explainers with B&W + crimson cutouts (VoxStage Hot-Red palette)",
    ],
    avoid: "playful cartoon skits or neon gaming promos",
    fonts: [
      { name: "Investigative Serif", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 400, "--dls": "-0.025em", "--dlh": "0.96", "--tcase": "none", "--nw": 700 } },
      { name: "Slate Report", display: "Space Grotesk", text: "DM Sans", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 700, "--dls": "-0.03em", "--dlh": "0.98", "--tcase": "none", "--nw": 700 } },
      { name: "Archival Engraving", display: "Fraunces", displayKind: "serif", text: "Instrument Sans", mono: "Geist Mono", num: "Fraunces", vars: { "--dw": 600, "--dls": "-0.02em", "--dlh": "0.98", "--tcase": "none", "--nw": 700 } },
    ],
    palettes: [
      {
        name: "Visual Journalism Dark",
        bg: "#0B0B0B", ink: "#F4F1EA", accent: "#FACC15", accent2: "#EF4444", accent3: "#38BDF8", accentInk: "#0B0B0B",
        muted: "#A1A1AA", surface: "#161618", line: "rgba(244, 241, 234, 0.16)",
        vars: { "--jr-out": "#EF4444", "--jr-badge": "#FACC15", "--jr-badge-ink": "#0B0B0B" },
      },
      {
        name: "VoxStage Hot-Red",
        bg: "#C9BB9C", ink: "#1A1A1A", accent: "#D62E1F", accent2: "#FACC15", accent3: "#1D4ED8", accentInk: "#FFFFFF",
        muted: "#4A4336", surface: "#F4EFE4", line: "rgba(26, 26, 26, 0.22)",
        vars: { "--jr-out": "#D62E1F", "--jr-badge": "#D62E1F", "--jr-badge-ink": "#FFFFFF" },
      },
      {
        name: "Vintage Sketch",
        bg: "#EDE2CE", ink: "#221A14", accent: "#9E3B24", accent2: "#2C5E4F", accent3: "#B45309", accentInk: "#FAF5EC",
        muted: "#655547", surface: "#F7F0E2", line: "rgba(34, 26, 20, 0.22)",
        vars: { "--jr-out": "#9E3B24", "--jr-badge": "#221A14", "--jr-badge-ink": "#EDE2CE" },
      },
      {
        name: "Academic Argument",
        bg: "#F8FAFC", ink: "#0F172A", accent: "#1D4ED8", accent2: "#DC2626", accent3: "#0D9488", accentInk: "#FFFFFF",
        muted: "#475569", surface: "#FFFFFF", line: "#CBD5E1",
        vars: { "--jr-out": "#1D4ED8", "--jr-badge": "#0F172A", "--jr-badge-ink": "#F8FAFC" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "fadeUp", item: "slingshot", card: "overshootPop",
      word: "slam", number: "count", numberIn: "overshootPop", media: "scaleIn", callout: "fadeUp",
      logo: "scaleIn", wordmark: "charRise", cta: "overshootPop", quote: "maskUp", emph: "mark",
    },
    O: { title: { d: 0.65, st: 0.05 }, word: { from: 1.45 } },
    S: {
      title: { name: "swish", gain: 0.55 },
      word: { name: ["card-place", "tap"], gain: 0.72 },
      count: { name: "chips-stack", gain: 0.72 },
      item: { name: "card-slide", gain: 0.65 },
      card: { name: "card-place", gain: 0.72 },
      media: { name: "card-slide", gain: 0.72 },
      callout: { name: "scratch", gain: 0.65 },
      transitions: { carryMorph: "whoosh-short", matchCut: "card-place" },
    },
    sfxGain: 0.8,
    drift: 0.026,
    grain: 0.10,
    listIcon: "check",
    transitionFor: (s, i) => (i % 2 === 1 ? "carryMorph" : "matchCut"),
    tone: () => "base",

    background: {
      markup: () => `
        <div class="jr-map-grid" data-layout-ignore></div>
        <div class="jr-vignette" data-layout-ignore></div>
      `,
      run: () => {},
    },

    sceneDecor: (s, idx, c) => {
        const num = String((idx || 0) + 1).padStart(2, "0");
        const tag = esc(s.tag || s.kicker || `DOSSIER // BEAT ${num}`);
        const src = s.source ? `<div class="jr-source-badge"><span class="jr-dot"></span>SOURCE: ${esc(s.source)}</div>` : "";
        const carry = s.carry ? `<div class="jr-carry-tag">CARRY ↳ ${esc(s.carry)}</div>` : "";
        return `
          <div class="jr-hud-top" data-layout-ignore>
            <div class="jr-dossier-pill">${tag}</div>
            <div class="jr-beat-idx">FLUXD // ${num}</div>
          </div>
          ${src}
          ${carry}
        `;
    },
  });
})();
