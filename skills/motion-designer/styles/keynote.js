/* Keynote — the product film. Black stage, one soft light, the product rising out of the dark on a
   slow 3D tilt that settles flat; tight semibold type, emphasis filled with a gradient, a light that
   sweeps across the big lines, blur dissolves between scenes. */
MD.style("keynote", {
  order: 2,
  name: "Keynote",
  tagline: "The product film, keynote-grade",
  look: "A dark stage with one soft moving light; screens rise out of the dark on a slow 3D tilt and settle flat; tight semibold type with gradient-filled emphasis; a light sweep across the big lines; scenes dissolve through a blur.",
  bestFor: ["app launches", "SaaS product videos", "feature reveals", "anything with screens to show", "premium tech brands"],
  avoid: "loud, playful or meme energy; videos with no product to show and lots of words",
  fonts: [
    { name: "Inter Tight", display: "Inter Tight", text: "Inter", mono: "Geist Mono", vars: { "--dw": 650, "--dls": "-0.032em", "--dlh": "1.02", "--tw": 500 } },
    { name: "Geist", display: "Geist", text: "Geist", mono: "Geist Mono", vars: { "--dw": 620, "--dls": "-0.035em", "--dlh": "1.04" } },
    { name: "Manrope", display: "Manrope", text: "Inter", mono: "Geist Mono", vars: { "--dw": 700, "--dls": "-0.032em", "--dlh": "1.02" } },
    { name: "Instrument", display: "Instrument Sans", text: "Inter", mono: "Geist Mono", vars: { "--dw": 650, "--dwdth": "92%", "--dls": "-0.03em", "--dlh": "1.04" } },
  ],
  palettes: [
    { name: "Midnight", bg: "#000000", ink: "#F5F5F7", accent: "#2997FF", accent2: "#A970FF", accent3: "#FF6AA8", accentInk: "#FFFFFF", muted: "#86868B", surface: "#141416", vars: { "--glow": "rgba(64, 120, 255, 0.34)", "--glow2": "rgba(170, 100, 255, 0.22)", "--chrome": "#1D1D1F", "--bezel": "linear-gradient(150deg, #5b5b60, #222225 40%, #3a3a3e)", "--dev-shadow": "0 calc(var(--u) * 5) calc(var(--u) * 14) rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)", "--line": "rgba(255,255,255,0.10)" } },
    { name: "Studio", bg: "#F5F5F7", ink: "#1D1D1F", accent: "#0071E3", accent2: "#7A4DFF", accent3: "#E2398F", accentInk: "#FFFFFF", muted: "#6E6E73", surface: "#FFFFFF", vars: { "--glow": "rgba(255, 255, 255, 0.95)", "--glow2": "rgba(120, 160, 255, 0.18)", "--chrome": "#E8E8ED", "--bezel": "linear-gradient(150deg, #d9d9de, #a9a9ae 45%, #c9c9ce)", "--dev-shadow": "0 calc(var(--u) * 4) calc(var(--u) * 12) rgba(30,30,60,0.18), 0 0 0 1px rgba(0,0,0,0.05)", "--line": "rgba(0,0,0,0.08)" } },
    { name: "Ember", bg: "#0B0806", ink: "#FBF4EE", accent: "#FF7A1A", accent2: "#FF3D6E", accent3: "#FFC34D", accentInk: "#1A0B02", muted: "#9A8F86", surface: "#17120E", vars: { "--glow": "rgba(255, 110, 30, 0.30)", "--glow2": "rgba(255, 60, 110, 0.18)", "--chrome": "#1E1814", "--bezel": "linear-gradient(150deg, #6a5a50, #2a221d 40%, #4a3e36)", "--dev-shadow": "0 calc(var(--u) * 5) calc(var(--u) * 14) rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)", "--line": "rgba(255,255,255,0.10)" } },
    { name: "Aurora", bg: "#03110E", ink: "#ECFFF8", accent: "#2EE6A6", accent2: "#3AA8FF", accent3: "#C6FF5A", accentInk: "#02130D", muted: "#7FA096", surface: "#0B1C18", vars: { "--glow": "rgba(40, 230, 160, 0.26)", "--glow2": "rgba(60, 160, 255, 0.20)", "--chrome": "#10211C", "--bezel": "linear-gradient(150deg, #4f6862, #18241f 40%, #34463f)", "--dev-shadow": "0 calc(var(--u) * 5) calc(var(--u) * 14) rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)", "--line": "rgba(255,255,255,0.10)" } },
  ],
  T: { title: "knRise", body: "knFade", kicker: "knFade", item: "knFade", card: "knCard", word: "knRise", number: "count", numberIn: "knRise", media: "knReveal", callout: "knChip", logo: "knLogo", wordmark: "knRise", cta: "knChip", quote: "knRise", emph: null },
  O: { title: { d: 1.25, st: 0.075 }, quote: { d: 1.2, st: 0.05 }, word: { d: 0.75, st: 0.05, sweep: false } },
  S: {
    media: { name: "whoosh-long", gain: 0.55 },
    count: { name: "glass", gain: 0.7, offset: -0.2 },
    card: { name: ["tap", "click-ui", "tap"], gain: 0.45 },
    item: { name: ["tick", "tick-2"], gain: 0.4 },
    logo: { name: "bong", gain: 0.8 },
    cta: { name: "glass", gain: 0.55 },
    callout: { name: "select", gain: 0.45 },
    bars: { name: "riser-air", gain: 0.35 },
    strike: { name: "swish", gain: 0.4 },
    transitions: { blur: "whoosh-up", fade: null, cut: null },
  },
  sfxGain: 0.75,
  drift: 0.035,
  grain: 0,
  transition: "blur",
  listIcon: "check",
  tone: () => "base",
  fill: { hook: { maxh: 44, max: 19 }, words: { maxh: 46, max: 26 }, outro: { maxh: 30, max: 14 } },

  background: {
    // one soft key light and a cooler fill that wander across the stage for the whole film
    markup: () => `<div class="kn-stage"><i class="kn-l1"></i><i class="kn-l2"></i><i class="kn-floor"></i></div>`,
    run: (tl, c) => {
      const D = c.P.duration;
      const leg = 7;
      const n = Math.max(0, Math.floor(D / leg) - 1);
      tl.fromTo(".kn-l1", { xPercent: -18, yPercent: -10, scale: 1 }, { xPercent: 22, yPercent: 8, scale: 1.18, duration: leg, ease: "sine.inOut", repeat: n, yoyo: true }, 0);
      tl.fromTo(".kn-l2", { xPercent: 20, yPercent: 12, scale: 1.1 }, { xPercent: -16, yPercent: -6, scale: 0.92, duration: leg * 1.3, ease: "sine.inOut", repeat: Math.max(0, Math.floor(D / (leg * 1.3)) - 1), yoyo: true }, 0);
    },
  },

  moves: {
    // words rise out of a soft blur, long expo — the keynote line
    knRise: {
      len: (n, o) => (o.d || 1.25) + (o.st != null ? o.st : 0.075) * (n - 1),
      run: (tl, els, at, o) => {
        const ws = [];
        els.forEach((e) => e.querySelectorAll(".w").forEach((w) => ws.push(w)));
        const t = ws.length ? ws : els;
        tl.fromTo(t, { opacity: 0, yPercent: 38, filter: "blur(16px)" }, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: o.d || 1.25, stagger: o.st != null ? o.st : 0.075, ease: "expo.out" }, at);
        // a light passes across the big lines once they've landed (a sheen inside the letters)
        if (o.sweep === false) return;
        const sheen = [];
        els.forEach((e) => { if (e.classList.contains("title")) e.querySelectorAll(".w:not(.em) .wi").forEach((w) => sheen.push(w)); });
        if (!sheen.length) return;
        sheen.forEach((w) => w.classList.add("kn-sheen"));
        const end = at + (o.d || 1.25) * 0.6 + (o.st != null ? o.st : 0.075) * (t.length - 1);
        tl.fromTo(sheen, { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: 1.6, stagger: 0.07, ease: "power2.inOut" }, end);
      },
    },
    knFade: {
      len: (n, o) => (o.d || 1.0) + (o.st != null ? o.st : 0.09) * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, y: o.y != null ? o.y : 22, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: o.d || 1.0, stagger: o.st != null ? o.st : 0.09, ease: "expo.out" }, at),
    },
    knCard: {
      len: (n, o) => (o.d || 1.3) + 0.12 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, yPercent: 24, scale: 0.94, rotationX: 22, transformPerspective: 1800, filter: "blur(10px)" }, { opacity: 1, yPercent: 0, scale: 1, rotationX: 0, filter: "blur(0px)", duration: o.d || 1.3, stagger: 0.12, ease: "expo.out" }, at),
    },
    // the product rises out of the dark, tipped back, and settles flat
    knReveal: {
      len: (n, o) => (o.d || 1.9) + 0.16 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, yPercent: 26, rotationX: 34, scale: 0.86, transformPerspective: 2200, transformOrigin: "50% 100%", filter: "blur(14px) brightness(0.4)" }, { opacity: 1, yPercent: 0, rotationX: 0, scale: 1, filter: "blur(0px) brightness(1)", duration: o.d || 1.9, stagger: 0.16, ease: "expo.out" }, at),
    },
    // after landing: a slow turn so the device is never frozen
    knTurn: {
      len: () => 0,
      run: (tl, els, at, o) => tl.fromTo(els, { rotationY: o.from != null ? o.from : -7, rotationX: 3, transformPerspective: 2400 }, { rotationY: o.to != null ? o.to : 5, rotationX: 0, duration: o.d || 4, ease: "sine.inOut" }, at),
    },
    knChip: {
      len: (n, o) => (o.d || 0.9) + 0.1 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: 0.8, y: 14, filter: "blur(8px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: o.d || 0.9, stagger: 0.1, ease: "back.out(1.4)" }, at),
    },
    knLogo: {
      len: (n, o) => o.d || 1.8,
      run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: 1.25, filter: "blur(24px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: o.d || 1.8, ease: "expo.out" }, at),
    },
  },

  transitions: {
    blur: {
      ov: 0.9,
      run: (tl, out, inn, at, ov) => {
        tl.to(out, { opacity: 0, filter: "blur(22px)", scale: 1.05, duration: ov * 0.8, ease: "power2.in" }, at - ov / 2);
        tl.fromTo(inn, { opacity: 0, filter: "blur(22px)", scale: 0.965 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ov, ease: "power3.out" }, at - ov / 4);
      },
    },
  },

  kinds: {
    // a keynote word beat breathes: each word gets its moment
    words: { min: (s) => Math.max(2.0, (s.items || []).length * 0.75) },
    screen: {
      min: (s) => MD.kinds.screen.min(s),
      plan: (s, c, dur) => {
        const e = MD.kinds.screen.plan(s, c, dur);
        const rev = e.find((x) => x.sel === ".devwrap");
        if (rev) rev.t = 0.15;
        e.push({ t: 0.15, sel: ".dev", move: "knTurn", n: 1, o: { d: Math.max(2, dur), from: s.side === "left" ? 8 : -8, to: s.side === "left" ? -3 : 3 }, sfx: null, hit: "start" });
        return e;
      },
    },
    screens: {
      min: (s) => MD.kinds.screens.min(s),
      plan: (s, c, dur) => {
        const e = MD.kinds.screens.plan(s, c, dur);
        e.push({ t: 0.2, sel: ".row", move: "knTurn", n: 1, o: { d: Math.max(2, dur), from: -5, to: 5 }, sfx: null, hit: "start" });
        return e;
      },
    },
    stat: {
      min: (s) => MD.kinds.stat.min(s),
      plan: (s, c, dur) => {
        const e = MD.kinds.stat.plan(s, c, dur);
        e.forEach((x) => { if (x.move === "count") x.o = { ...x.o, d: Math.min(2.4, Math.max(1.4, dur * 0.5)) }; });
        return e;
      },
    },
  },
});
