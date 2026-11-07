/* Blueprint — MG-BLUEPRINT & Architectural Project style from Leslie-vox-style + claudemotion.design/#styles.
   Designed for M.Sc. Physics apparatus breakdowns, optical ray-tracing, semiconductor lithography schematics,
   and Cinema camera/lens rig anatomy. */
(function () {
  const esc = (s) => MD.esc(s);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });

  MD.style("blueprint", {
    order: 0.85,
    name: "Blueprint",
    tagline: "MG-BLUEPRINT technical cyanotype grid, isometric schematics, dimension callouts & tracing-paper overlays",
    look: "Deep architectural blueprint blue (#1B3A6B) with 24px technical drafting grid, crisp white 2px engineering linework, translucent cream tracing-paper overlay cards (#F5F0E0), monospace dimension callouts (142mm ±0.5), and cyan/amber vector highlights.",
    bestFor: [
      "M.Sc. Physics apparatus, optical lenses, EUV lithography & orbital mechanics breakdowns",
      "cinema camera rigs, anamorphic lens geometry & studio lighting diagrams",
      "engineering, hardware & infrastructure bottlenecks",
    ],
    avoid: "soft lifestyle blogs or warm emotional vlogs",
    fonts: [
      { name: "Drafting Spec", display: "Space Grotesk", text: "Inter", mono: "JetBrains Mono", num: "JetBrains Mono", vars: { "--dw": 700, "--dls": "-0.03em", "--dlh": "0.98", "--tcase": "uppercase", "--nw": 700 } },
      { name: "Technical Editorial", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "0.98", "--tcase": "none", "--nw": 700 } },
    ],
    palettes: [
      {
        name: "Cyanotype Classic",
        bg: "#1B3A6B", ink: "#F0F6FC", accent: "#38BDF8", accent2: "#FACC15", accent3: "#F43F5E", accentInk: "#0F172A",
        muted: "#93C5FD", surface: "#152C52", line: "rgba(240, 246, 252, 0.24)",
        vars: { "--bp-grid": "rgba(240, 246, 252, 0.10)", "--bp-subgrid": "rgba(240, 246, 252, 0.04)", "--bp-trace": "#F5F0E0", "--bp-trace-ink": "#18181B" },
      },
      {
        name: "Obsidian CAD",
        bg: "#0D1520", ink: "#E2E8F0", accent: "#00F5D4", accent2: "#FACC15", accent3: "#FF5E5B", accentInk: "#0D1520",
        muted: "#94A3B8", surface: "#162232", line: "rgba(0, 245, 212, 0.25)",
        vars: { "--bp-grid": "rgba(0, 245, 212, 0.09)", "--bp-subgrid": "rgba(0, 245, 212, 0.035)", "--bp-trace": "#F8FAFC", "--bp-trace-ink": "#0F172A" },
      },
      {
        name: "Tracing Vellum",
        bg: "#F2ECE1", ink: "#1B3A6B", accent: "#D62E1F", accent2: "#1B3A6B", accent3: "#D97706", accentInk: "#FFFFFF",
        muted: "#475569", surface: "#FFFFFF", line: "rgba(27, 58, 107, 0.24)",
        vars: { "--bp-grid": "rgba(27, 58, 107, 0.10)", "--bp-subgrid": "rgba(27, 58, 107, 0.04)", "--bp-trace": "#1B3A6B", "--bp-trace-ink": "#F0F6FC" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "fadeUp", item: "slingshot", card: "overshootPop",
      word: "slam", number: "count", numberIn: "overshootPop", media: "scaleIn", callout: "fadeUp",
      logo: "scaleIn", wordmark: "charRise", cta: "overshootPop", quote: "maskUp", emph: "mark",
    },
    O: { title: { d: 0.62, st: 0.045 }, word: { from: 1.4 } },
    S: {
      title: { name: "swish", gain: 0.55 },
      word: { name: "tap", gain: 0.7 },
      count: { name: "chips-stack", gain: 0.7 },
      item: { name: "card-slide", gain: 0.65 },
      card: { name: "card-place", gain: 0.7 },
      media: { name: "card-slide", gain: 0.7 },
      callout: { name: "scratch", gain: 0.6 },
      transitions: { carryMorph: "whoosh-short", matchCut: "tap" },
    },
    sfxGain: 0.78,
    drift: 0.022,
    grain: 0.06,
    listIcon: "arrow",
    transitionFor: (s, i) => (i % 2 === 1 ? "carryMorph" : "matchCut"),
    tone: () => "base",

    background: {
      markup: () => `
        <div class="bp-grid" data-layout-ignore></div>
        <div class="bp-crosshairs" data-layout-ignore>
          <span class="bp-ch tl">+</span><span class="bp-ch tr">+</span>
          <span class="bp-ch bl">+</span><span class="bp-ch br">+</span>
        </div>
        <div class="bp-ruler-top" data-layout-ignore></div>
      `,
      run: () => {},
    },

    scene: {
      markup: (s, c, idx) => {
        const num = String((idx || 0) + 1).padStart(2, "0");
        const dim = esc(s.dimension || s.tag || `FIG.${num} // SCALE 1:10 ±0.05mm`);
        const src = s.source ? `<div class="bp-src">REF: ${esc(s.source)}</div>` : "";
        return `
          <div class="bp-hud" data-layout-ignore>
            <div class="bp-spec-tag">${dim}</div>
            <div class="bp-rev">FLUXD // CAD-REV.${num}</div>
          </div>
          ${src}
        `;
      },
      plan: () => [ev(0.05, ".bp-spec-tag", "fadeUp", 1, { d: 0.35 })],
    },
  });
})();
