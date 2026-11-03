/* Vox — Editorial mixed-media cutout collage, posterized stop-motion, damped pendulum lamp & highlighter sweeps.
   Implements the 7 Pillars of the Vox / Howtown Explainer Aesthetic:
   1. Dual-Framerate: Smooth 2.5D camera push-in + 10fps posterized stop-motion wiggle on cutouts & tape.
   2. Damped Pendulum Physics: Overhead lamp swinging on amp * sin(2*pi*t/period) * exp(-damping*t) with spotlight cone.
   3. Multi-Plane 2.5D Parallax (Z-0 newsprint, Z-1 torn-paper horizon strips, Z-2 die-cut photo/video cutouts, Z-3 lamp).
   4. Tactile Print, Halftone & 12fps Film Grain filtering.
   5. Tilted Vox Yellow (#FACC15) highlighter sweeps, ransom masking-tape stencil labels & SVG chalk circles/arrows. */
(function () {
  const esc = (s) => MD.esc(s);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });

  // Exact damped pendulum formula from Vox reference: amp * sin(t * 2pi / period) * exp(-damping * t)
  function dampedPendulum(t, ampDeg = 22, periodSec = 2.0, damping = 0.22) {
    return ampDeg * Math.sin((t * Math.PI * 2) / periodSec) * Math.exp(-damping * t);
  }

  MD.style("vox", {
    order: 0.8,
    name: "Vox",
    tagline: "Editorial cutout collage, swinging lamp, torn paper & yellow highlighter",
    look: "Warm tactile newsprint with halftone dots, ragged torn construction-paper horizons (SVG feTurbulence displacement), monochrome/sepia photo cutouts in white die-cut sticker borders, an overhead lamp swinging on a damped pendulum with a volumetric spotlight cone, tilted serif headlines with Vox Yellow (#FACC15) highlighter sweeps, and 10fps stop-motion wiggle.",
    bestFor: [
      "Vox, Howtown & Johnny Harris style mixed-media explainers",
      "investigative history, geopolitics & cultural stories using JPG photo cutouts and archival footage",
      "6-Movement YouTube video essays and 5-Stage companion Reels",
      "hybrid explainers combining raw B-roll footage (.mp4) with paper-cutout motion graphics",
    ],
    avoid: "minimalist corporate SaaS dashboards or sterile clinical slides",
    fonts: [
      { name: "Vox Editorial", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 400, "--dls": "-0.025em", "--dlh": "0.96", "--tcase": "none", "--nw": 700, "--ts-hook": 14.5, "--ts-statement": 10.5 } },
      { name: "Howtown Heavy", display: "Fraunces", displayKind: "serif", text: "DM Sans", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 700, "--dls": "-0.03em", "--dlh": "0.98", "--tcase": "none", "--nw": 700 } },
      { name: "Broadsheet", display: "DM Serif Display", displayKind: "serif", text: "Inter", mono: "Geist Mono", num: "Inter Tight", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "1.0", "--tcase": "none", "--nw": 700 } },
      { name: "Stencil Grotesk", display: "Space Grotesk", text: "Inter", mono: "JetBrains Mono", num: "JetBrains Mono", vars: { "--dw": 700, "--dls": "-0.035em", "--dlh": "1.0", "--tcase": "none", "--nw": 700 } },
    ],
    palettes: [
      {
        name: "Newsprint Yellow",
        bg: "#F4F1EA", ink: "#18181B", accent: "#FACC15", accent2: "#1D58D8", accent3: "#E11D48", accentInk: "#18181B",
        muted: "#57534E", surface: "#FFFFFF", line: "#D6D1C4",
        vars: { "--paper-band": "#1D58D8", "--cone": "rgba(250, 204, 21, 0.44)", "--tape": "#EAE4D3", "--tape-ink": "#18181B", "--halftone": "rgba(24,24,27,0.065)" },
      },
      {
        name: "Archival Dark",
        bg: "#141413", ink: "#F4F1EA", accent: "#FACC15", accent2: "#3B82F6", accent3: "#F43F5E", accentInk: "#141413",
        muted: "#A8A29E", surface: "#22211F", line: "#33312E",
        vars: { "--paper-band": "#1D4ED8", "--cone": "rgba(250, 204, 21, 0.28)", "--tape": "#F4F1EA", "--tape-ink": "#141413", "--halftone": "rgba(244,241,234,0.055)" },
      },
      {
        name: "Howtown Crimson",
        bg: "#EFECE6", ink: "#0F172A", accent: "#E11D48", accent2: "#FACC15", accent3: "#0284C7", accentInk: "#FFFFFF",
        muted: "#475569", surface: "#FFFFFF", line: "#CBD5E1",
        vars: { "--paper-band": "#0F172A", "--cone": "rgba(250, 204, 21, 0.38)", "--tape": "#FACC15", "--tape-ink": "#0F172A", "--halftone": "rgba(15,23,42,0.06)" },
      },
      {
        name: "Sepia Dossier",
        bg: "#EDE3D2", ink: "#1C1613", accent: "#F59E0B", accent2: "#B91C1C", accent3: "#0F766E", accentInk: "#1C1613",
        muted: "#6B5E53", surface: "#FAF5EC", line: "#D5C7B2",
        vars: { "--paper-band": "#B91C1C", "--cone": "rgba(245, 158, 11, 0.36)", "--tape": "#FAF5EC", "--tape-ink": "#1C1613", "--halftone": "rgba(28,22,19,0.07)" },
      },
    ],
    T: {
      title: "maskUp", body: "fadeUp", kicker: "vxTape", item: "vxCutout", card: "vxCutout",
      word: "slam", number: "count", numberIn: "vxCutout", media: "vxCutout", callout: "vxTape",
      logo: "vxCutout", wordmark: "charRise", cta: "vxTape", quote: "maskUp", emph: "mark",
    },
    O: { title: { d: 0.72, st: 0.055 }, word: { from: 1.6 } },
    S: {
      title: { name: "swish", gain: 0.55 },
      word: { name: ["card-place", "tap"], gain: 0.75 },
      count: { name: "chips-stack", gain: 0.75 },
      item: { name: ["card-slide", "tap"], gain: 0.65 },
      card: { name: ["card-place", "card-place-2"], gain: 0.75 },
      media: { name: "card-slide", gain: 0.75 },
      callout: { name: "scratch", gain: 0.65 },
      logo: { name: "land-light", gain: 0.7 },
      cta: { name: "confirm", gain: 0.65 },
      quote: null,
      bars: { name: "card-fan", gain: 0.65 },
      line: { name: "scratch", gain: 0.55 },
      strike: { name: "scratch", gain: 0.75 },
      transitions: { vxWhip: "whoosh-short", cut: "card-place" },
    },
    sfxGain: 0.8,
    drift: 0.028,
    grain: 0.12,
    listIcon: "check",
    fill: { hook: { maxh: 50, max: 15 }, statement: { maxh: 44, max: 10 }, words: { maxh: 42, max: 22 }, outro: { maxh: 32, max: 12 } },
    // Herman Huang 80/20 Transition Restraint: alternate matchCut with shape-matched vxWhip
    transitionFor: (s, i) => (s.kind === "pivot" || s.kind === "words" ? "cut" : i % 2 === 1 ? "matchCut" : "vxWhip"),
    tone: () => "base",

    background: {
      markup: () => `
        <svg class="vx-svg-defs" width="0" height="0" aria-hidden="true" data-layout-ignore>
          <defs>
            <filter id="vx-torn" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="4" seed="7" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="11" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
        </svg>
        <div class="vx-print" data-layout-ignore></div>
        <div class="vx-halftone" data-layout-ignore></div>
        <div class="vx-horizon" data-layout-ignore>
          <div class="vx-tear-white"></div>
          <div class="vx-tear-color"></div>
        </div>
        <div class="vx-lamp-rig" data-layout-ignore>
          <div class="vx-cone"></div>
          <div class="vx-cord"></div>
          <div class="vx-shade"></div>
        </div>
        <div class="vx-vig" data-layout-ignore></div>
      `,
      run: (tl, c) => {
        const D = c.P.duration;
        const rig = document.querySelector(".vx-lamp-rig");
        if (rig) {
          // Sample damped pendulum at 24fps across the composition, re-exciting softly at scene boundaries
          const boundaries = (c.P.scenes || []).map((s) => s.t0);
          const fps = 24, steps = Math.ceil(D * fps);
          for (let f = 0; f <= steps; f++) {
            const t = f / fps;
            let localT = t;
            for (const b of boundaries) if (t >= b) localT = t - b;
            const deg = dampedPendulum(localT, 20, 2.1, 0.24);
            tl.set(rig, { rotation: deg, transformOrigin: "50% 0%" }, t);
          }
        }
        // Posterized 8fps stop-motion boil on the torn-paper horizon
        const hrz = document.querySelector(".vx-horizon");
        if (hrz) {
          const stepSec = 0.125;
          for (let t = 0, k = 0; t < D; t += stepSec, k++) {
            const dy = ((k * 17) % 5) - 2;
            const dx = ((k * 31) % 5) - 2;
            tl.set(hrz, { x: dx, y: dy }, t);
          }
        }
      },
    },

    sceneDecor: (s, i, c) => {
      const brand = (c.video.brand && c.video.brand.name) || c.video.title || "ARCHIVE FILE";
      const mov = s.movement || s.figure || `PLATE ${String(i + 1).padStart(2, "0")}`;
      const src = s.source || (c.video && c.video.source) || "";
      const pauseSec = MD.parsePause ? MD.parsePause(s) : 0;
      const pauseBadge = pauseSec > 0 ? `<span class="vx-pause">[PAUSE ${pauseSec}s]</span>` : "";
      const voBar = (s.vo && (s.subtitles || (c.video && c.video.subtitles)))
        ? `<div class="vx-vo" data-layout-ignore><span class="vx-vo-tape">NARRATION</span><span class="vx-vo-txt">${esc(String(s.vo).replace(/\[(?:AUDIO\s+)?PAUSE:\s*[\d.]+\s*s(?:ec)?\]/gi, "").trim())}</span>${pauseBadge}</div>`
        : "";
      return `
        <div class="vx-hud-top" data-layout-ignore>
          <span class="vx-tape-tag">${esc(mov)}</span>
          <span class="vx-stamp">${esc(brand)} // NO. 0${i + 1}</span>
        </div>
        ${src ? `<div class="vx-src" data-layout-ignore>SOURCE: ${esc(src)}</div>` : ""}
        ${voBar}
      `;
    },

    scene: {
      run: (tl, el, s) => {
        // Posterized 10fps stop-motion micro-wiggle on cutout cards and devices during the scene
        const cutouts = el.querySelectorAll(".vx-cutout-card, .dev, .card, .ts-card, .pv-col, .tm-media");
        if (cutouts.length) {
          const step = 0.12;
          let k = 0;
          for (let t = s.t0; t < s.t0 + s.dur; t += step, k++) {
            cutouts.forEach((node, idx) => {
              const ang = (((k + idx * 3) % 3) - 1) * 0.45;
              tl.set(node, { rotation: ang }, t);
            });
          }
        }
      },
    },

    moves: {
      vxTape: {
        len: (n, o) => (o.d || 0.45) + 0.08 * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { scale: 1.18, opacity: 0, rotation: -4 }, { scale: 1, opacity: 1, rotation: -1.5, duration: o.d || 0.45, stagger: 0.08, ease: "steps(4)" }, at),
      },
      vxCutout: {
        len: (n, o) => (o.d || 0.82) + (o.st != null ? o.st : 0.12) * (n - 1),
        run: (tl, els, at, o) => {
          const d = o.d || 0.82, st = o.st != null ? o.st : 0.12;
          gsap.set(els, { y: 80, opacity: 0, scaleX: 0.9, scaleY: 1.1, rotation: -6 });
          tl.to(els, {
            keyframes: [
              { opacity: 1, y: -10, scaleX: 0.94, scaleY: 1.06, rotation: 2.2, duration: d * 0.58, ease: "expo.out" },
              { y: 4, scaleX: 1.04, scaleY: 0.96, rotation: -1.0, duration: d * 0.22, ease: "sine.inOut" },
              { y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: d * 0.20, ease: "power2.out" },
            ],
            stagger: st,
          }, at);
        },
      },
    },

    transitions: {
      vxWhip: {
        ov: 0.55,
        run: (tl, out, inn, at, ov) => {
          const a = at - ov / 2;
          tl.fromTo(out, { yPercent: 0, rotation: 0 }, { yPercent: -105, rotation: -2, duration: ov, ease: "expo.inOut" }, a);
          tl.fromTo(inn, { yPercent: 105, rotation: 2 }, { yPercent: 0, rotation: 0, duration: ov, ease: "expo.inOut" }, a);
        },
      },
    },
  });
})();
