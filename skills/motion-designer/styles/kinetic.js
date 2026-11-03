/* Kinetic — poster type that moves to a beat. Giant grotesque words fill the frame, scenes flip
   between paper, ink and one hot colour, cuts land hard. */
MD.style("kinetic", {
  order: 1,
  name: "Kinetic",
  tagline: "Poster type that moves to a beat",
  look: "Giant grotesque words fill the frame; each scene flips between paper, ink and one hot colour; words stretch and slam in; cuts land hard on a punch.",
  bestFor: ["launch hooks", "announcements", "social promos", "manifestos", "event promos", "anything with attitude"],
  avoid: "long explanations, lots of UI to show, calm or luxury brands",
  fonts: [
    { name: "Archivo Wide", display: "Archivo", text: "Inter", mono: "JetBrains Mono", vars: { "--dw": 900, "--dwdth": "125%", "--dls": "-0.035em", "--dlh": "0.9", "--tcase": "uppercase" } },
    { name: "Archivo Narrow", display: "Archivo", text: "Inter", mono: "JetBrains Mono", vars: { "--dw": 850, "--dwdth": "62%", "--dls": "-0.01em", "--dlh": "0.86", "--tcase": "uppercase", "--ts-hook": 17, "--ts-statement": 12, "--ts-words": 30 } },
    { name: "Bricolage", display: "Bricolage Grotesque", text: "Inter", mono: "JetBrains Mono", vars: { "--dw": 800, "--dwdth": "90%", "--dls": "-0.03em", "--dlh": "0.9", "--tcase": "none" } },
    { name: "Anton", display: "Anton", text: "Inter", mono: "JetBrains Mono", vars: { "--dw": 400, "--dls": "-0.005em", "--dlh": "0.92", "--tcase": "uppercase", "--ts-hook": 15, "--ts-statement": 11, "--ts-words": 28 } },
  ],
  palettes: [
    { name: "Signal", bg: "#F1EEE8", ink: "#0D0D0D", accent: "#FF3B1F", accentInk: "#FFFFFF", muted: "#6E6A62", surface: "#E3DED5" },
    { name: "Night", bg: "#0D0D0D", ink: "#F3EFE7", accent: "#FF3B1F", accentInk: "#FFFFFF", muted: "#8E8A83", surface: "#1C1C1C" },
    { name: "Acid", bg: "#101010", ink: "#F4F4EF", accent: "#D4FF3A", accentInk: "#0E0E0E", muted: "#8A8A84", surface: "#1D1D1D", vars: { "--accent-em": "#0E0E0E" } },
    { name: "Cobalt", bg: "#ECEAE4", ink: "#101010", accent: "#2F3CFF", accentInk: "#FFFFFF", muted: "#6B6962", surface: "#DFDCD4" },
  ],
  T: { title: "stretch", body: "fadeUp", kicker: "slideIn", item: "slideIn", card: "stretchCard", word: "slam", number: "count", numberIn: "stretch", media: "rise", callout: "pop", logo: "pop", wordmark: "charRise", cta: "pop", quote: "stretch", emph: null },
  O: { title: { d: 0.75, st: 0.07 }, word: { from: 2.2 } },
  S: {
    title: { name: ["punch", "land"], gain: 0.9 },
    word: { name: "punch", gain: 0.9 },
    count: { name: "land", gain: 0.9 },
    item: { name: ["tick", "tick-2"], gain: 0.7 },
    card: { name: ["card-place", "card-place-2"], gain: 0.8 },
    media: { name: "whoosh-up", gain: 0.6 },
    callout: { name: "pluck", gain: 0.5 },
    logo: { name: "sub-drop", gain: 1 },
    cta: { name: "pluck", gain: 0.7 },
    quote: { name: "land-light", gain: 0.7 },
    bars: { name: "card-fan", gain: 0.6 },
    strike: { name: "scratch", gain: 0.6 },
    transitions: { wipe: "swish", stack: "whoosh-down", cut: null },
  },
  // these kinds grow their type until it fills the frame (maxh = % of the short side it may use)
  fill: { hook: { maxh: 66, max: 30 }, statement: { maxh: 60, max: 22 }, words: { maxh: 60, max: 42 }, stat: { maxh: 52, max: 60 }, outro: { maxh: 34, max: 20 } },
  sfxGain: 0.85,
  drift: 0.025,
  grain: 0.14,
  listIcon: "arrow-right",
  // stack (the next scene slides up over this one) and wipe alternate; a beat of words cuts in hard
  transitionFor: (s, i) => (s.kind === "words" ? "cut" : i % 2 ? "stack" : "wipe"),
  tone: (s, i) => {
    if (s.kind === "words") return "invert";
    if (s.kind === "stat" || s.kind === "outro") return "accent";
    return ["base", "invert", "base", "accent"][i % 4];
  },
  sceneDecor: (s, i, c) => {
    const brand = (c.video.brand && c.video.brand.name) || c.video.title || "";
    const no = `${String(i + 1).padStart(2, "0")} / ${String(c.n).padStart(2, "0")}`;
    return `<div class="kx-hud" data-layout-ignore><span class="kx-b">${MD.esc(brand)}</span><span class="kx-n">${no}</span></div>`;
  },
  moves: {
    // words land wide: scaleX from narrow to full, out of a mask
    stretch: {
      mask: true,
      len: (n, o) => (o.d || 0.75) + (o.st != null ? o.st : 0.07) * (n - 1),
      run: (tl, els, at, o) => {
        const ws = [];
        els.forEach((e) => { e.classList.add("masked"); e.querySelectorAll(".wi").forEach((w) => ws.push(w)); });
        const t = ws.length ? ws : els;
        tl.fromTo(t, { yPercent: 105, scaleX: 0.35, transformOrigin: "0% 100%" }, { yPercent: 0, scaleX: 1, duration: o.d || 0.75, stagger: o.st != null ? o.st : 0.07, ease: "expo.out" }, at);
      },
    },
    stretchCard: {
      len: (n, o) => (o.d || 0.7) + 0.08 * (n - 1),
      run: (tl, els, at, o) => tl.fromTo(els, { scaleX: 0.2, opacity: 0, transformOrigin: "0% 50%" }, { scaleX: 1, opacity: 1, duration: o.d || 0.7, stagger: 0.08, ease: "expo.out" }, at),
    },
  },
  transitions: {
    stack: {
      ov: 0.6,
      run: (tl, out, inn, at, ov, c) => {
        const a = "yPercent";
        tl.to(out, { [a]: -22, scale: 0.94, duration: ov, ease: "expo.inOut" }, at - ov / 2);
        tl.fromTo(inn, { [a]: 100 }, { [a]: 0, duration: ov, ease: "expo.inOut" }, at - ov / 2);
      },
    },
  },
  kinds: {
    // every word gets the whole frame, and the frame flips colour on each one
    words: {
      markup: (s, c) => `<div class="k k-words">${(s.items || []).map((w, i) => `<div class="wd tone-${["invert", "accent", "base"][i % 3]}" data-i="${i}"><div class="title" data-fit data-maxh="64">${MD.tx(w)}</div></div>`).join("")}</div>`,
    },
  },
});
