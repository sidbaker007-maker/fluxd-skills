/* Polymath — investigative cinema, optical physics, and geopolitical telemetry.
   Designed for interdisciplinary video essays (15–30 min 6-Movement features and 1–3 min 5-Stage Reels).
   Dark obsidian canvas (#0B0B0B–#121212), dual functional accent tokens (--accent & --accent2),
   35mm film grain, vector schematic reticles, telescoping scale jumps, McPhee structural pivots,
   counter-intuitive premise inversions, and empirical repository citations. */
(function () {
  const esc = (s) => MD.esc(s);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });
  const LABEL = {
    hook: "MOVEMENT I · INCITING ANOMALY",
    anomaly: "MOVEMENT II · PREMISE INVERSION",
    statement: "THESIS · EMPIRICAL CLAIM",
    telescope: "SCALE JUMP · MICRO TO MACRO",
    pivot: "McPHEE PIVOT · STRUCTURAL BRAIDING",
    telemetry: "TELEMETRY · VECTOR SCHEMATIC",
    stat: "EMPIRICAL PROOF · KEY METRIC",
    chart: "DISTRIBUTION · DATASET",
    line: "TIME SERIES · TRAJECTORY",
    donut: "SHARE · DECOMPOSITION",
    rank: "RANKING · COMPARATIVE INDEX",
    compare: "CONTRAST · MYTH VS DATA",
    steps: "MECHANISM · CAUSAL CHAIN",
    list: "EVIDENCE · FINDINGS",
    screen: "ARTIFACT · VISUAL SPECIMEN",
    screens: "ARTIFACTS · FRAME COMPARISON",
    quote: "PRIMARY SOURCE · ARCHIVE",
    words: "KINETIC LEXICON",
    logo: "",
    outro: "RESOLUTION · SYNTHESIS",
    custom: "INVESTIGATION",
  };

  MD.style("polymath", {
    order: 0.5,
    name: "Polymath",
    tagline: "Investigative cinema, optical physics & geopolitical telemetry",
    look: "Deep obsidian dark-mode canvas (#0B0B0B–#121212) with 35mm film grain, vector coordinate hairlines, optical registration marks, and dual functional accent tokens. Built for investigative video essays: Telescoping Scale Jumps, McPhee Structural Pivots, Counter-Intuitive Premise Inversions, and Matplotlib/Manim telemetry overlays with empirical repository HUDs.",
    bestFor: [
      "investigative video essays (15-30 min features & 1-3 min reels)",
      "cinema mechanics, optical physics & psychoacoustics (Axis A)",
      "macroeconomics, trade flows & box-office capital (Axis B)",
      "systems science, thermodynamics & geopolitics (Axis C)",
      "illustrated mathematical & physical paradoxes (Axis D)",
      "explainers combining spoken voiceover (~135 WPM) with data telemetry",
    ],
    avoid: "playful kids apps, pastel lifestyle promos, casual meme hooks",
    fonts: [
      { name: "Space Grotesk", display: "Space Grotesk", text: "Inter", mono: "JetBrains Mono", num: "JetBrains Mono", vars: { "--dw": 650, "--dls": "-0.035em", "--dlh": "1.02", "--tcase": "none", "--nw": 700 } },
      { name: "McPhee Serif", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "0.98", "--tcase": "none", "--nw": 650, "--ts-hook": 14.5, "--ts-statement": 10.5 } },
      { name: "Formalist", display: "Fraunces", displayKind: "serif", text: "DM Sans", mono: "Geist Mono", num: "Geist Mono", vars: { "--dw": 600, "--dls": "-0.028em", "--dlh": "1.0", "--tcase": "none", "--nw": 650 } },
      { name: "Telemetry Tight", display: "Inter Tight", text: "Inter", mono: "JetBrains Mono", num: "Inter Tight", vars: { "--dw": 700, "--dls": "-0.04em", "--dlh": "1.0", "--tcase": "none", "--nw": 700 } },
    ],
    palettes: [
      {
        name: "Obsidian",
        bg: "#0B0B0B", ink: "#F2EFE9", accent: "#FF5A1F", accent2: "#2EE6A6", accent3: "#FFD15C", accentInk: "#0B0B0B",
        muted: "#8C8881", surface: "#121215", line: "#25262B",
        vars: { "--grid": "rgba(242,239,233,0.038)", "--grid2": "rgba(242,239,233,0.085)", "--neutral": "#32343C", "--glow": "rgba(255,90,31,0.22)", "--glow2": "rgba(46,230,166,0.18)" },
      },
      {
        name: "Halide",
        bg: "#0E0C0A", ink: "#F6EFE2", accent: "#F5A623", accent2: "#4DA6FF", accent3: "#FF6B5A", accentInk: "#0E0C0A",
        muted: "#948C7E", surface: "#161310", line: "#2B251F",
        vars: { "--grid": "rgba(246,239,226,0.04)", "--grid2": "rgba(246,239,226,0.09)", "--neutral": "#3A332B", "--glow": "rgba(245,166,35,0.22)", "--glow2": "rgba(77,166,255,0.18)" },
      },
      {
        name: "Sovereign",
        bg: "#0A0D12", ink: "#EDF2F7", accent: "#FF4D4D", accent2: "#38B2AC", accent3: "#ECC94B", accentInk: "#0A0D12",
        muted: "#8290A2", surface: "#111620", line: "#222B3C",
        vars: { "--grid": "rgba(237,242,247,0.038)", "--grid2": "rgba(237,242,247,0.085)", "--neutral": "#2F3B50", "--glow": "rgba(255,77,77,0.22)", "--glow2": "rgba(56,178,172,0.18)" },
      },
      {
        name: "Chalkboard",
        bg: "#101210", ink: "#F4F6F0", accent: "#FFD15C", accent2: "#7AA2FF", accent3: "#5CE6B8", accentInk: "#101210",
        muted: "#8A9188", surface: "#171A17", line: "#282E28",
        vars: { "--grid": "rgba(244,246,240,0.04)", "--grid2": "rgba(244,246,240,0.09)", "--neutral": "#343B34", "--glow": "rgba(255,209,92,0.20)", "--glow2": "rgba(122,162,255,0.18)" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "vecTag", item: "vecRow", card: "vecCard",
      word: "slam", number: "count", numberIn: "fadeUp", media: "vecCard", callout: "vecTag",
      logo: "scaleIn", wordmark: "charRise", cta: "vecTag", quote: "blurIn", emph: "mark",
    },
    O: { title: { d: 0.78, st: 0.05 }, word: { from: 1.55 } },
    S: {
      title: null,
      word: { name: ["thump", "tick"], gain: 0.75 },
      count: { name: "glass", gain: 0.65 },
      item: { name: ["tick", "tick-2"], gain: 0.55 },
      card: { name: ["panel-in", "card-place"], gain: 0.55 },
      media: { name: "whoosh-short", gain: 0.55 },
      callout: { name: "select", gain: 0.55 },
      logo: { name: "bong", gain: 0.75 },
      cta: { name: "confirm", gain: 0.6 },
      quote: null,
      bars: { name: "card-fan", gain: 0.55 },
      line: { name: "riser-air", gain: 0.45 },
      note: { name: "select", gain: 0.55 },
      strike: { name: "scratch", gain: 0.65 },
      transitions: { vecScan: "swish", cut: "thump", blur: "whoosh-short" },
    },
    sfxGain: 0.78,
    drift: 0.022,
    grain: 0.08,
    listIcon: "arrow-right",
    fill: { hook: { maxh: 52, max: 15.5 }, statement: { maxh: 46, max: 10 }, words: { maxh: 44, max: 22 }, outro: { maxh: 32, max: 12 } },
    // Herman Huang 80/20 Transition Rule: use clean matchCut on most beats; reserve vecScan wipe for every 3rd movement shift
    transitionFor: (s, i) => (s.kind === "pivot" || s.kind === "words" ? "cut" : i % 3 === 0 ? "vecScan" : "matchCut"),
    tone: () => "base",

    background: {
      markup: () => `
        <div class="pm-grid" data-layout-ignore></div>
        <svg class="pm-orbit" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" data-layout-ignore>
          <circle class="pm-ring r1" cx="500" cy="500" r="380"/>
          <circle class="pm-ring r2" cx="500" cy="500" r="240"/>
          <line class="pm-axis" x1="60" y1="500" x2="940" y2="500"/>
          <line class="pm-axis" x1="500" y1="60" x2="500" y2="940"/>
        </svg>
        <div class="pm-reg tl" data-layout-ignore>+</div>
        <div class="pm-reg tr" data-layout-ignore>+</div>
        <div class="pm-reg bl" data-layout-ignore>+</div>
        <div class="pm-reg br" data-layout-ignore>+</div>
        <div class="pm-tc" data-layout-ignore>TC 00:00:00:00</div>
      `,
      run: (tl, c) => {
        const D = c.P.duration;
        const g = document.querySelector(".pm-grid");
        if (g) {
          tl.fromTo(g, { backgroundPosition: "0px 0px" }, { backgroundPosition: `${-c.u * 18}px ${-c.u * 10}px`, duration: D, ease: "none" }, 0);
        }
        const r1 = document.querySelector(".pm-ring.r1");
        const r2 = document.querySelector(".pm-ring.r2");
        if (r1) tl.fromTo(r1, { rotation: 0, transformOrigin: "50% 50%" }, { rotation: 90, duration: D, ease: "none" }, 0);
        if (r2) tl.fromTo(r2, { rotation: 0, transformOrigin: "50% 50%" }, { rotation: -120, duration: D, ease: "none" }, 0);
        const tc = document.querySelector(".pm-tc");
        if (tc) {
          const p = { t: 0 };
          const draw = () => {
            const t = p.t;
            const mm = String(Math.floor(t / 60)).padStart(2, "0");
            const ss = String(Math.floor(t % 60)).padStart(2, "0");
            const ff = String(Math.floor((t % 1) * 24)).padStart(2, "0");
            tc.textContent = `TC 00:${mm}:${ss}:${ff} · 24FPS`;
          };
          tl.fromTo(p, { t: 0 }, { t: D, duration: D, ease: "none", onUpdate: draw, onReverseComplete: draw }, 0);
        }
      },
    },

    sceneDecor: (s, i, c) => {
      const axis = s.axis || (c.video && c.video.axis) || "";
      const mov = s.movement || s.figure || LABEL[s.kind] || `MOVEMENT ${String(i + 1).padStart(2, "0")}`;
      const headLeft = `FIG. ${String(i + 1).padStart(2, "0")} // ${esc(mov)}${axis ? ` [${esc(axis)}]` : ""}`;
      const brand = (c.video.brand && c.video.brand.name) || c.video.title || "INVESTIGATIVE DIRECTIVE";
      const src = s.source || (c.video && c.video.source) || "";
      const pauseSec = MD.parsePause ? MD.parsePause(s) : 0;
      const pauseBadge = pauseSec > 0 ? `<span class="pm-pause-badge">[AUDIO PAUSE: ${pauseSec}s]</span>` : "";
      const voBar = (s.vo && (s.subtitles || (c.video && c.video.subtitles)))
        ? `<div class="pm-vo" data-layout-ignore><span class="pm-vo-tag">VO</span><span class="pm-vo-txt">${esc(String(s.vo).replace(/\[(?:AUDIO\s+)?PAUSE:\s*[\d.]+\s*s(?:ec)?\]/gi, "").trim())}</span>${pauseBadge}</div>`
        : "";
      return `
        <div class="pm-hud-top" data-layout-ignore>
          <span class="pm-fig">${headLeft}</span>
          <span class="pm-brand">${esc(brand)}</span>
        </div>
        <div class="pm-hud-bot" data-layout-ignore>
          <span class="pm-src">${src ? `SOURCE // ${esc(src)}` : `SCENE ${String(i + 1).padStart(2, "0")} OF ${String(c.n).padStart(2, "0")}`}</span>
          ${!voBar && pauseBadge ? pauseBadge : ""}
        </div>
        ${voBar}
        ${i > 0 ? '<i class="pm-scan" data-layout-ignore></i>' : ""}
      `;
    },

    scene: {
      run: (tl, el, s) => {
        const hud = el.querySelectorAll(".pm-hud-top > *, .pm-hud-bot > *, .pm-vo");
        if (hud.length) tl.fromTo(hud, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }, s.t0 + 0.08);
      },
    },

    moves: {
      vecTag: {
        len: (n, o) => (o.d || 0.48) + 0.07 * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: o.d || 0.48, stagger: 0.07, ease: "power3.out" }, at),
      },
      vecRow: {
        len: (n, o) => (o.d || 0.6) + 0.09 * (n - 1),
        run: (tl, els, at, o) => {
          els.forEach((el, j) => {
            tl.fromTo(el, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: o.d || 0.6, ease: "expo.out" }, at + j * 0.09);
          });
        },
      },
      vecCard: {
        len: (n, o) => (o.d || 0.82) + (o.st != null ? o.st : 0.1) * (n - 1),
        run: (tl, els, at, o) => {
          const d = o.d || 0.82, st = o.st != null ? o.st : 0.1;
          gsap.set(els, { opacity: 0, y: 26, scaleX: 1.05, scaleY: 0.95 });
          tl.to(els, {
            keyframes: [
              { opacity: 1, y: 30, scaleX: 1.06, scaleY: 0.94, duration: d * 0.15, ease: "power2.in" },
              { y: -3, scaleX: 0.98, scaleY: 1.02, duration: d * 0.55, ease: "expo.out" },
              { y: 0, scaleX: 1, scaleY: 1, duration: d * 0.30, ease: "power2.out" },
            ],
            stagger: st,
          }, at);
          els.forEach((el, idx) => {
            const kids = el.querySelectorAll("h3, p, li, .ts-head, .pv-hdr, .tm-mv");
            if (kids.length) tl.fromTo(kids, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: d * 0.6, stagger: 0.04, ease: "power3.out" }, at + idx * st + 0.09);
          });
        },
      },
    },

    transitions: {
      vecScan: {
        ov: 0.65,
        run: (tl, out, inn, at, ov) => {
          const sec = inn.closest("section");
          const line = sec && sec.querySelector(".pm-scan");
          const a = at - ov / 2;
          tl.fromTo(out, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: ov, ease: "power3.inOut" }, a);
          tl.fromTo(inn, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ov, ease: "power3.inOut" }, a);
          if (line) {
            tl.fromTo(line, { left: "0%", opacity: 1 }, { left: "100%", duration: ov, ease: "power3.inOut" }, a);
            tl.to(line, { opacity: 0, duration: 0.12 }, a + ov);
          }
        },
      },
    },
  });
})();
