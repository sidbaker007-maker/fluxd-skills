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
    transitionFor: (s, i) => (s.transition ? s.transition : ["carryMorph", "zDollyThrough", "whipPanMatch", "matchCut"][i % 4]),
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

    scene: {
      run: (tl, el, s, c) => {
        const dur = Math.max(2.0, s.dur || 5.0);
        const t0 = s.t0 || 0;
        // 1. Continuous 2.5D Ken Burns & Counter-Float on all cards, cutouts & PiP monitors (zero dead frames)
        const mediaImgs = el.querySelectorAll(".ed-seq-thumb img, .ed-hero-img-wrap img, .ed-pip-vid");
        mediaImgs.forEach((im, idx) => {
          const dir = idx % 2 === 0 ? 1 : -1;
          tl.fromTo(
            im,
            { scale: 1.01, rotation: -0.9 * dir, yPercent: 1.5 * dir },
            { scale: 1.095, rotation: 0.9 * dir, yPercent: -1.8 * dir, duration: dur, ease: "sine.inOut" },
            t0
          );
        });
        // 2. Active-Card Spotlight Shift & Camera Impulse whenever a new sequential card pops in
        const seqCards = Array.from(el.querySelectorAll(".ed-seq-card"));
        if (seqCards.length >= 2) {
          const mTimes = Array.isArray(s.mediaTimes) && s.mediaTimes.length === seqCards.length
            ? s.mediaTimes.map((x) => Math.min(dur - 0.6, Math.max(0.15, +x)))
            : seqCards.map((_, idx) => 0.35 + idx * Math.min(1.4, (dur - 1.2) / seqCards.length));
          mTimes.forEach((mt, idx) => {
            if (idx > 0) {
              // Causal Chain Momentum Transfer: Incoming card's arrival physically pushes earlier cards with elastic spring settle
              const prevCards = seqCards.slice(0, idx);
              const pushDir = idx % 2 === 1 ? -1 : 1;
              tl.to(prevCards, {
                keyframes: [
                  { x: 14 * pushDir, scale: 0.93, rotationZ: 1.4 * pushDir, y: -8, opacity: 0.88, duration: 0.18, ease: "power2.out" },
                  { x: 0, scale: 0.96, rotationZ: 0.4 * pushDir, y: -4, opacity: 0.88, duration: 0.48, ease: "elastic.out(1, 0.42)" },
                ],
              }, t0 + mt);
              // Subtle camera kinetic nudge on the stage box when the new element lands
              const box = el.querySelector(".box");
              if (box) {
                tl.to(box, {
                  keyframes: [
                    { scale: 1.016, y: -3, duration: 0.16, ease: "power2.out" },
                    { scale: 1.0, y: 0, duration: 0.34, ease: "expo.out" },
                  ],
                }, t0 + mt);
              }
            }
          });
        }
        // 3. Sub-Beat Micro-Impulses every 2.2s on long beats so single-card & index scenes stay kinetically alive
        const heroCard = el.querySelector(".ed-hero-card, .ul-board, .an-card, .ed-outro-card");
        if (heroCard && dur > 4.5) {
          for (let beatT = 2.2; beatT < dur - 0.9; beatT += 2.2) {
            tl.to(heroCard, {
              keyframes: [
                { y: -5, scale: 1.018, rotationZ: (Math.round(beatT) % 2 === 0 ? 0.45 : -0.45), duration: 0.32, ease: "power2.out" },
                { y: 0, scale: 1.0, rotationZ: 0, duration: 0.55, ease: "sine.inOut" },
              ],
            }, t0 + beatT);
          }
        }
        // 4. Corner Seal & Top Header kinetic pulse
        const seal = el.querySelector(".ed-corner-seal");
        if (seal) {
          tl.fromTo(seal, { rotation: -8, scale: 0.92 }, { rotation: 8, scale: 1.04, duration: dur, ease: "sine.inOut" }, t0);
        }
      },
    },

    sceneDecor: (s, i, c) => {
      if (s.kind === "bumper") return "";
      const rawChap = String(s.chapter || s.kicker || "").replace(/^BEAT\s*\d+\s*[·:\-\/]*\s*/i, "").trim();
      const chap = esc(rawChap);
      const src = s.source ? `<div class="ed-source-line" data-layout-ignore><span class="ed-src-dot"></span><span>${esc(s.source)}</span></div>` : "";
      const lockupSvg = MD.fluxdLockup ? MD.fluxdLockup("ed-brand-lockup") : "";
      const sealSvg = MD.fluxdSeal ? MD.fluxdSeal("ed-brand-seal") : "";
      return `
        <div class="ed-top-bar" data-layout-ignore>
          <span class="ed-chap">${chap}</span>
          <span class="ed-brand-hdr">${lockupSvg}</span>
        </div>
        ${src}
        <div class="ed-corner-seal" data-layout-ignore>${sealSvg}</div>
      `;
    },
  });
})();
