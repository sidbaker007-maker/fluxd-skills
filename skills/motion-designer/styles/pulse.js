/* Pulse — 9:16 Faceless Retention HUD, 2-Second Fuse & Rehook Engine.
   Reverse-engineered from high-retention Reels telemetry (23.9 micro-changes/10s, <2.0s static hold,
   mixed Geometric Sans + Italic Editorial Serif + tilted pill headlines, blurred-to-unlocked open loops,
   full-screen RANG colour flashes, and live 2-second fuse + change counter HUD). */
(function () {
  const esc = (s) => MD.esc(s);
  const LABEL = {
    rehook: "RETENTION TELEMETRY",
    unlock: "OPEN LOOP · PROTOCOL",
    fuse: "2 SECOND RULE · LEVER",
    props: "1 WORD = 1 PROP",
    cta: "COMMENT TRIGGER",
    hook: "INCITING ANOMALY",
    anomaly: "PREMISE INVERSION",
    statement: "CORE THESIS",
    telescope: "SCALE JUMP",
    pivot: "STRUCTURAL PIVOT",
    telemetry: "VECTOR SCHEMATIC",
    stat: "KEY METRIC",
    chart: "DATASET",
    line: "TRAJECTORY",
    steps: "3 STEPS",
    list: "CHECKLIST",
  };

  MD.style("pulse", {
    order: 0.25,
    name: "Pulse (2s Fuse HUD)",
    tagline: "9:16 Faceless Retention HUD, 2-Second Fuse & Rehook Engine",
    look: "Tactile dark carbon dot-matrix grid (#0C0E0C) with warm radial back-glow, persistent top chapter & live change counter bar (CHANGES 1..82), progressive mixed-font top headlines (Geometric Sans + Italic Editorial Serif + tilted solid accent pills), periodic full-screen RANG colour-flash inversions (#CCFF00 / #E04826), blurred-to-unlocked checklists, and a live bottom 2-Second Fuse reset bar.",
    bestFor: [
      "9:16 high-retention faceless Reels & YouTube Shorts (45-60s)",
      "HOOK -> DELAY -> REHOOK -> END ON PAYOFF storytelling",
      "2-Second Fuse explainers (RANG, ZOOM, CUT, AWAAZ, NAYI CHEEZ)",
      "physics, cinema craft, geopolitics & macro-economic visual essays",
    ],
    avoid: "slow ambient mood pieces, static talking-head vlogs without graphics",
    fonts: [
      {
        name: "Space + Instrument Italic",
        display: "Space Grotesk",
        text: "Inter",
        mono: "JetBrains Mono",
        num: "Space Grotesk",
        extra: ["Instrument Serif"],
        vars: { "--dw": 700, "--dls": "-0.03em", "--dlh": "1.06", "--tcase": "none", "--nw": 800, "--f-serif": '"Instrument Serif", Georgia, serif' },
      },
      {
        name: "Syne + Instrument Italic",
        display: "Syne",
        text: "Inter",
        mono: "JetBrains Mono",
        num: "Space Grotesk",
        extra: ["Instrument Serif"],
        vars: { "--dw": 800, "--dls": "-0.032em", "--dlh": "1.04", "--tcase": "none", "--nw": 800, "--f-serif": '"Instrument Serif", Georgia, serif' },
      },
      {
        name: "Bricolage + Fraunces Italic",
        display: "Bricolage Grotesque",
        text: "DM Sans",
        mono: "JetBrains Mono",
        num: "Bricolage Grotesque",
        extra: ["Fraunces"],
        vars: { "--dw": 750, "--dls": "-0.028em", "--dlh": "1.05", "--tcase": "none", "--nw": 800, "--f-serif": '"Fraunces", Georgia, serif' },
      },
    ],
    palettes: [
      {
        name: "Acid Fuse (Reel Reference)",
        bg: "#0C0E0C", ink: "#F6F3EC", accent: "#CCFF00", accent2: "#FF3B1F", accent3: "#F59E0B", accentInk: "#0B0D0B",
        muted: "#8C9488", surface: "#151915", line: "#262D26",
        vars: { "--glow": "rgba(204,255,0,0.16)", "--glow2": "rgba(255,59,31,0.14)" },
      },
      {
        name: "FLUXD Halation & Volt",
        bg: "#111315", ink: "#F6F3EC", accent: "#E04826", accent2: "#D4FF3A", accent3: "#F59E0B", accentInk: "#FFFFFF",
        muted: "#8E8A82", surface: "#181B1F", line: "#2A2E35",
        vars: { "--glow": "rgba(224,72,38,0.18)", "--glow2": "rgba(212,255,58,0.14)" },
      },
      {
        name: "FLUXD Cherenkov Chartreuse",
        bg: "#0D1117", ink: "#F4EFE6", accent: "#BEF264", accent2: "#38BDF8", accent3: "#FF3B1D", accentInk: "#0B0D10",
        muted: "#8B95A5", surface: "#151C26", line: "#253042",
        vars: { "--glow": "rgba(190,242,100,0.16)", "--glow2": "rgba(56,189,248,0.15)" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "fadeUp", item: "overshootPop", card: "overshootPop",
      word: "slam", number: "count", numberIn: "overshootPop", media: "overshootPop", callout: "overshootPop",
      logo: "scaleIn", wordmark: "charRise", cta: "overshootPop", quote: "blurIn", emph: null,
    },
    O: { title: { d: 0.62, st: 0.045 }, word: { from: 1.48 } },
    S: {
      title: { name: "tick", gain: 0.55 },
      word: { name: ["punch", "thump"], gain: 0.85 },
      count: { name: "glass", gain: 0.7 },
      item: { name: ["tick", "tick-2"], gain: 0.65 },
      card: { name: ["panel-in", "card-place"], gain: 0.7 },
      media: { name: "whoosh-short", gain: 0.65 },
      callout: { name: "select", gain: 0.65 },
      logo: { name: "bong", gain: 0.8 },
      cta: { name: "confirm", gain: 0.75 },
      bars: { name: "card-fan", gain: 0.65 },
      strike: { name: "scratch", gain: 0.75 },
      transitions: { rangFlash: "whoosh-up", cornerDock: "swish", matchCut: "tick", cut: "thump" },
    },
    sfxGain: 0.84,
    drift: 0.018,
    grain: 0.06,
    listIcon: "check",
    transitionFor: (s, i) => {
      if (s.transition) return s.transition;
      if (s.tone === "accent") return "rangFlash";
      if (i % 3 === 1) return "cornerDock";
      return "matchCut";
    },
    tone: (s) => (s.tone ? s.tone : "base"),

    background: {
      markup: () => `
        <div class="pl-mesh" data-layout-ignore></div>
        <div class="pl-glow g1" data-layout-ignore></div>
        <div class="pl-glow g2" data-layout-ignore></div>
      `,
      run: (tl, c) => {
        const D = c.P.duration;
        const g1 = document.querySelector(".pl-glow.g1");
        if (g1) tl.fromTo(g1, { xPercent: -8, yPercent: -6, scale: 0.92 }, { xPercent: 10, yPercent: 8, scale: 1.12, duration: D, ease: "sine.inOut" }, 0);
      },
    },

    sceneDecor: (s, i, c) => {
      const chapNo = String(i + 1).padStart(2, "0");
      const chapName = s.chapter || s.movement || s.kicker || LABEL[s.kind] || `STEP ${chapNo}`;
      const baseChanges = 1 + i * 6;
      const evCount = Math.max(4, (s.items ? s.items.length * 2 : 0) + (s.callouts ? s.callouts.length * 2 : 0) + 5);
      const endChanges = baseChanges + evCount;
      const stageTag = s.stage ? `THIS REEL · <b>${esc(s.stage.toUpperCase())}</b>` : `CHANGES <b class="pl-chg-num" data-from="${baseChanges}" data-to="${endChanges}">${endChanges}</b>`;
      const brand = (c.video && c.video.brand && c.video.brand.name) || "FLUXD";
      const subTag = (c.video && c.video.axis) || "PHYSICS · CINEMA · SYSTEMS";
      return `
        <div class="pl-hud-top" data-layout-ignore>
          <span class="pl-chap">${chapNo} · ${esc(chapName)}</span>
          <span class="pl-counter"><i class="pl-dot"></i>${stageTag}</span>
        </div>
        <div class="pl-hud-bot" data-layout-ignore>
          <div class="pl-fuse-row">
            <span class="pl-fuse-lbl">THIS REEL · 2s FUSE</span>
            <span class="pl-fuse-val">1.6s</span>
          </div>
          <div class="pl-fuse-track">
            <div class="pl-fuse-fill"><i class="pl-fuse-spark">✳</i></div>
          </div>
          <div class="pl-brand-row">
            <span class="pl-phi-mark">( | )</span>
            <span class="pl-wordmark">[ ${esc(brand)} ]</span>
            <span class="pl-pillars">${esc(subTag)}</span>
          </div>
        </div>
      `;
    },

    scene: {
      run: (tl, el, s) => {
        const chg = el.querySelector(".pl-chg-num");
        if (chg) {
          const from = +chg.dataset.from || 1, to = +chg.dataset.to || (from + 5);
          const st = { v: from };
          const draw = () => { chg.textContent = String(Math.round(st.v)); };
          tl.fromTo(st, { v: from }, { v: to, duration: Math.max(0.8, s.dur - 0.2), ease: "none", onUpdate: draw, onStart: draw }, s.t0);
        }
        const fill = el.querySelector(".pl-fuse-fill");
        const fval = el.querySelector(".pl-fuse-val");
        if (fill && fval) {
          // Reset the 2-second fuse bar twice per scene so it never hits 0.0s
          const half = s.dur / 2;
          [0, half].forEach((offset) => {
            const fst = { t: 1.9 };
            tl.fromTo(fill, { width: "22%" }, { width: "88%", duration: Math.max(0.4, half - 0.05), ease: "none" }, s.t0 + offset);
            tl.fromTo(fst, { t: 1.9 }, {
              t: 1.2, duration: Math.max(0.4, half - 0.05), ease: "none",
              onUpdate: () => { fval.textContent = `${fst.t.toFixed(1)}s`; },
            }, s.t0 + offset);
          });
        }
      },
    },

    transitions: {
      // Full-screen RANG colour flash wipe (pours down in 7 frames = 0.24s)
      rangFlash: {
        ov: 0.34,
        run: (tl, out, inn, at, ov) => {
          const a = at - ov / 2;
          tl.to(out, { opacity: 0, scale: 0.96, duration: ov * 0.6, ease: "power2.in" }, a);
          tl.fromTo(inn, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ov, ease: "expo.out" }, a);
        },
      },
      // Spatial Context-Keep / Corner-Dock transition (from Reel 2 hook -> delay transition)
      cornerDock: {
        ov: 0.36,
        run: (tl, out, inn, at, ov) => {
          const a = at - ov / 2;
          tl.fromTo(out, { scale: 1, xPercent: 0, yPercent: 0, opacity: 1 }, { scale: 0.42, xPercent: -26, yPercent: -22, opacity: 0, duration: ov, ease: "power3.inOut" }, a);
          tl.fromTo(inn, { scale: 0.92, yPercent: 8, opacity: 0 }, { scale: 1, yPercent: 0, opacity: 1, duration: ov, ease: "expo.out" }, a + ov * 0.2);
        },
      },
    },
  });
})();
