/* Paper — playful editorial. Warm paper, bold flat pebbles that pop in on springs and bleed off the
   edges, a serif headline with one *italic* word, sticker cards that land slightly askew. Between
   scenes the next scene's pebble swells to fill the frame and shrinks back into place. */
(function () {
  // seeded organic blob → an SVG path in a 0..100 box (same seed, same shape, every render)
  function blobPath(seed, wob) {
    let s = seed * 9301 + 49297;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const n = 7, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rad = 50 * (1 - (wob || 0.18) + r() * (wob || 0.18) * 1.6) * 0.92;
      pts.push([50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad]);
    }
    // closed Catmull-Rom → cubic béziers
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + "Z";
  }
  const blob = (seed, cls, style, wob) => `<i class="pp-blob ${cls || ""}" style="${style || ""}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${blobPath(seed, wob)}"/></svg></i>`;
  const COLORS = ["var(--accent)", "var(--accent2)", "var(--accent3)", "var(--c4)"];
  // corner layouts: [x%, y%, size in u, colour index] — always bleeding off an edge, never behind the middle
  const LAYOUTS = [
    [[-11, -18, 56, 0], [86, 68, 42, 1], [84, -9, 16, 2]],
    [[88, -20, 54, 1], [-14, 66, 46, 2], [12, 86, 14, 0]],
    [[-16, 58, 60, 2], [82, -16, 38, 0], [93, 56, 14, 3]],
    [[80, 62, 62, 3], [-10, -14, 32, 1], [-5, 50, 13, 0]],
    [[-12, -22, 42, 1], [90, 26, 48, 0], [15, 88, 18, 3]],
  ];
  const layoutFor = (i) => LAYOUTS[i % LAYOUTS.length];
  const ease = "back.out(1.9)";

  MD.style("paper", {
    order: 4,
    name: "Paper",
    tagline: "Playful paper, bold pebbles, a serif with an italic word",
    look: "Warm paper with bold flat pebbles that pop in on springs and bleed off the edges; a serif headline with one italic word underlined by hand; sticker cards that land slightly askew; the next scene's pebble swells to fill the frame between scenes.",
    bestFor: ["consumer app launches", "friendly brands", "explainers", "creators and courses", "lifestyle and food", "kids and education"],
    avoid: "serious enterprise, finance reports, dev tools, luxury or cinematic moods",
    fonts: [
      { name: "Fraunces Soft", display: "Fraunces", displayKind: "serif", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 600, "--dls": "-0.025em", "--dlh": "1.0", "--tcase": "none", "--dvs": '"SOFT" 100, "WONK" 1, "opsz" 144' } },
      { name: "Instrument", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "JetBrains Mono", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "0.96", "--tcase": "none", "--ts-hook": 15, "--ts-statement": 11 } },
      { name: "DM Serif", display: "DM Serif Display", displayKind: "serif", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "1.02", "--tcase": "none" } },
      { name: "Unbounded", display: "Unbounded", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 700, "--dls": "-0.04em", "--dlh": "1.0", "--tcase": "none", "--ts-hook": 11, "--ts-statement": 8 } },
    ],
    palettes: [
      { name: "Sorbet", bg: "#FBF6EE", ink: "#1F1A16", accent: "#EE5427", accentInk: "#FFFFFF", accent2: "#6E8BFF", accent3: "#FFC83A", muted: "#6F665D", surface: "#FFFFFF", vars: { "--c4": "#3DBE8B", "--paper-line": "#1F1A16" } },
      { name: "Mint", bg: "#F2F5EC", ink: "#15211A", accent: "#1C9B69", accentInk: "#FFFFFF", accent2: "#FF8DB0", accent3: "#FFD54A", muted: "#5E6B61", surface: "#FFFFFF", vars: { "--c4": "#5B7CFA", "--paper-line": "#15211A" } },
      { name: "Berry", bg: "#FFF3EF", ink: "#2A1420", accent: "#E5426D", accentInk: "#FFFFFF", accent2: "#3F5BFF", accent3: "#FFB547", muted: "#7A5D66", surface: "#FFFFFF", vars: { "--c4": "#22B5A4", "--paper-line": "#2A1420" } },
      { name: "Night", bg: "#1C1916", ink: "#FBF3E8", accent: "#FF7A45", accentInk: "#1C1916", accent2: "#8FA3FF", accent3: "#FFD15C", muted: "#B3A89C", surface: "#2A2622", vars: { "--c4": "#4FD1A0", "--paper-line": "#FBF3E8" } },
    ],
    T: { title: "bounce", body: "fadeUp", kicker: "sticker", item: "sticker", card: "sticker", word: "popWord", number: "count", numberIn: "bounce", media: "sticker", callout: "sticker", logo: "sticker", wordmark: "bounceChars", cta: "sticker", quote: "bounce", emph: "mark" },
    O: { title: { st: 0.06 }, word: {} },
    S: {
      title: { name: "pluck", gain: 0.7 },
      word: { name: ["pluck", "tap", "select"], gain: 0.85 },
      count: { name: "chips-stack", gain: 0.8 },
      item: { name: ["select", "tap"], gain: 0.75 },
      card: { name: ["card-place", "card-place-2"], gain: 0.85 },
      media: { name: "card-slide", gain: 0.8 },
      callout: { name: "tap", gain: 0.7 },
      logo: { name: "two-tone", gain: 0.8 },
      cta: { name: "confirm", gain: 0.75 },
      quote: { name: "land-light", gain: 0.7 },
      bars: { name: "card-fan", gain: 0.7 },
      strike: { name: "scratch", gain: 0.6 },
      transitions: { splat: "swish", cut: null },
    },
    sfxGain: 0.8,
    drift: 0.015,
    grain: 0.07,
    listIcon: "check",
    fill: { hook: { maxh: 54, max: 17 }, statement: { maxh: 50, max: 12.5 }, words: { maxh: 40, max: 24 }, stat: { maxh: 40, max: 34 }, outro: { maxh: 30, max: 16 } },
    transition: "splat",
    tone: () => "base",
    // three pebbles per scene, a different corner layout each time, plus the splat that opens the scene
    sceneDecor: (s, i, c) => {
      const L = layoutFor(i + (s.kind === "words" ? 1 : 0));
      const bl = L.map(([x, y, size, ci], j) => blob(i * 7 + j * 13 + 3, `pb${j}`, `left:${x}%;top:${y}%;width:calc(var(--u) * ${size});height:calc(var(--u) * ${size});--fill:${COLORS[(ci + i) % 4]}`)).join("");
      const [x, y, size, ci] = L[0];
      const splat = i > 0 ? `<i class="pp-splat" data-layout-ignore style="left:calc(${x}% + var(--u) * ${size / 2});top:calc(${y}% + var(--u) * ${size / 2});--fill:${COLORS[(ci + i) % 4]}"></i>` : "";
      return `<div class="pp-decor" data-layout-ignore data-decor-group>${bl}</div>${splat}`;
    },
    scene: {
      // pebbles pop in on a spring, then keep breathing and drifting until the scene leaves
      run: (tl, el, s) => {
        const bs = el.querySelectorAll(".pp-decor .pp-blob");
        const life = Math.max(0.5, s.vis1 - s.t0);
        bs.forEach((b, j) => {
          const dir = j % 2 ? -1 : 1;
          tl.fromTo(b, { scale: 0, rotation: -25 * dir }, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.6)" }, s.t0 + 0.05 + j * 0.12);
          tl.fromTo(b.firstChild, { rotation: 0, x: 0, y: 0 }, { rotation: 22 * dir, x: 42 * dir, y: -30 * dir, duration: life, ease: "sine.inOut" }, s.t0);
        });
        // cards, devices and stickers bob gently once they've landed
        const floaters = el.querySelectorAll(".card, .k-screens .devwrap, .k-screen .devwrap, .it, .k-compare .col, .cta, .pp-numblob");
        floaters.forEach((f, j) => {
          const amp = 5 + (j % 3) * 2;
          const d = 1.6 + (j % 3) * 0.35;
          const reps = Math.max(0, Math.floor((life - 1) / d) - 1);
          if (reps > 0) tl.fromTo(f, { y: 0 }, { y: -amp, duration: d, ease: "sine.inOut", yoyo: true, repeat: reps }, s.t0 + 1 + (j % 4) * 0.15);
        });
      },
    },
    moves: {
      // words hop up out of the line with a little tilt, and settle on a spring
      bounce: {
        len: (n, o) => (o.d || 0.75) + (o.st != null ? o.st : 0.06) * (n - 1),
        run: (tl, els, at, o) => {
          const ws = [];
          els.forEach((e) => e.querySelectorAll(".w").forEach((w) => ws.push(w)));
          const t = ws.length ? ws : els;
          tl.fromTo(t, { opacity: 0, yPercent: 70, rotation: (i) => (i % 2 ? 9 : -9), scale: 0.85 }, { opacity: 1, yPercent: 0, rotation: 0, scale: 1, duration: o.d || 0.75, stagger: o.st != null ? o.st : 0.06, ease: "back.out(2.1)" }, at);
        },
      },
      bounceChars: {
        len: (n) => 0.7 + 0.035 * (n - 1),
        run: (tl, els, at) => {
          const cs = [];
          els.forEach((e) => e.querySelectorAll(".c").forEach((x) => cs.push(x)));
          tl.fromTo(cs.length ? cs : els, { opacity: 0, yPercent: 80, rotation: (i) => (i % 2 ? 12 : -12) }, { opacity: 1, yPercent: 0, rotation: 0, duration: 0.7, stagger: 0.035, ease: "back.out(2.4)" }, at);
        },
      },
      // a sticker slapped onto the page: big, twisted, then pressed flat
      sticker: {
        len: (n, o) => (o.d || 0.75) + (o.st != null ? o.st : 0.11) * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: 0.45, rotation: (i) => (i % 2 ? 10 : -10) }, { opacity: 1, scale: 1, rotation: 0, duration: o.d || 0.75, stagger: o.st != null ? o.st : 0.11, ease: "back.out(1.9)" }, at),
      },
      popWord: {
        len: () => 0.6,
        run: (tl, els, at) => {
          els.forEach((el) => {
            const b = el.parentElement.querySelector(".pp-wblob");
            if (b) tl.fromTo(b, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)" }, at);
            tl.fromTo(el, { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.2)" }, at + 0.04);
          });
        },
      },
    },
    transitions: {
      // the incoming scene's pebble swells until it fills the frame, then shrinks back into its corner
      splat: {
        ov: 0.9,
        run: (tl, out, inn, at, ov, c) => {
          const sec = inn.closest("section");
          const sp = sec && sec.querySelector(".pp-splat");
          const outSec = out.closest("section");
          if (!sp) { tl.fromTo(inn, { opacity: 0 }, { opacity: 1, duration: ov }, at - ov / 2); return; }
          const r = sp.getBoundingClientRect(), root = document.getElementById("root").getBoundingClientRect();
          const cx = r.left + r.width / 2 - root.left, cy = r.top + r.height / 2 - root.top;
          const far = Math.max(Math.hypot(cx, cy), Math.hypot(c.W - cx, cy), Math.hypot(cx, c.H - cy), Math.hypot(c.W - cx, c.H - cy));
          const k = (far * 2.1) / (r.width || 1);
          tl.fromTo(sp, { scale: 0 }, { scale: k, duration: ov * 0.5, ease: "power2.in" }, at - ov * 0.5);
          if (outSec) tl.set(outSec, { opacity: 0 }, at);
          tl.to(sp, { scale: 0, duration: ov * 0.6, ease: "expo.inOut" }, at + 0.02);
        },
      },
    },
    kinds: {
      // each word sits on its own pebble, in its own colour
      words: {
        min: (s) => Math.max(1.8, (s.items || []).length * 0.7),
        markup: (s, c) => `<div class="k k-words">${(s.items || []).map((w, i) => `<div class="wd" data-i="${i}">${blob(31 + i * 17, "pp-wblob", `--fill:${COLORS[i % 4]}`, 0.12)}<div class="title" data-fit data-maxh="40">${MD.tx(w)}</div></div>`).join("")}</div>`,
      },
      stat: {
        markup: (s, c) => MD.kinds.stat.markup(s, c).replace('<div class="num"', `<div class="pp-numwrap">${blob(77, "pp-numblob", "--fill:var(--accent3)", 0.14)}<div class="num"`).replace(/(<div class="num"[^]*?<\/div>)/, "$1</div>"),
        plan: (s, c) => {
          const e = MD.kinds.stat.plan(s, c);
          e.unshift({ t: 0.05, sel: ".pp-numblob", move: "sticker", n: 1, o: { d: 0.8 }, sfx: null, hit: "start" });
          return e;
        },
      },
    },
  });
})();
