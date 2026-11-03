/* Aura — soft light, glass and a sunrise. One glossy dusk orb travels the whole video from scene to
   scene over slow drifting colour; words blur into focus; cards are frosted glass with an inner glow;
   numbers are dot-matrix lights. */
(function () {
  // where the dusk orb sits in each kind of scene: [x %, y % of the frame, size in u (1% short side)]
  const SPOT = {
    hook: [50, 124, 118], statement: [88, 16, 42], words: [12, 84, 38], stat: [86, 76, 44],
    list: [94, 56, 48], steps: [94, 56, 48], screen: [66, 58, 70], screens: [50, 74, 92],
    features: [50, 136, 112], compare: [84, 12, 38], quote: [10, 18, 36], chart: [88, 14, 34],
    logo: [50, 116, 110], outro: [50, 118, 118], custom: [80, 20, 40],
  };
  const SPOT_TALL = {
    hook: [50, 104, 120], statement: [86, 12, 46], words: [16, 88, 44], stat: [80, 84, 50],
    list: [92, 16, 46], steps: [92, 16, 46], screen: [50, 70, 86], screens: [50, 72, 100],
    features: [50, 108, 110], compare: [86, 8, 40], quote: [12, 14, 40], chart: [88, 10, 40],
    logo: [50, 104, 116], outro: [50, 104, 120], custom: [80, 20, 40],
  };
  const D = (o, k, d) => (o && o[k] != null ? o[k] : d);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });

  MD.style("aura", {
    order: 2,
    name: "Aura",
    tagline: "Soft light, glass and a sunrise",
    look: "A glossy dusk orb travels the whole video over slow drifting colour; words blur into focus; cards are frosted glass with an inner glow; numbers are dot-matrix lights.",
    bestFor: ["AI products", "fintech", "wellness", "consumer subscriptions", "premium apps", "calm product launches"],
    avoid: "hype, sports, loud promos, anything that should feel raw or urgent",
    fonts: [
      { name: "Geist", display: "Geist", text: "Geist", mono: "Geist Mono", num: "Doto", vars: { "--dw": 500, "--dls": "-0.045em", "--dlh": "1.02", "--nw": 700 } },
      { name: "Instrument", display: "Instrument Serif", displayKind: "serif", text: "Inter", mono: "Geist Mono", num: "Doto", vars: { "--dw": 400, "--dls": "-0.02em", "--dlh": "0.98", "--nw": 700, "--ts-hook": 15, "--ts-statement": 11 } },
      { name: "Manrope", display: "Manrope", text: "Manrope", mono: "Geist Mono", num: "Doto", vars: { "--dw": 600, "--dls": "-0.04em", "--dlh": "1.04", "--nw": 700 } },
      { name: "DM Sans", display: "DM Sans", text: "DM Sans", mono: "Geist Mono", num: "Doto", vars: { "--dw": 500, "--dls": "-0.045em", "--dlh": "1.02", "--nw": 700 } },
    ],
    palettes: [
      { name: "Dusk", bg: "#0A0E2A", ink: "#F6F2FF", accent: "#FF9A6B", accentInk: "#1A0E14", muted: "#A9A8CC", surface: "#1A1F45",
        vars: { "--o1": "#FF6A45", "--o2": "#E2457E", "--o3": "#2E3FD0", "--o4": "#FFC46B", "--glass": "rgba(255,255,255,0.075)", "--glass-line": "rgba(255,255,255,0.16)", "--glow": "rgba(255,138,92,0.55)", "--bg-hi": "#1B1650" } },
      { name: "Dawn", bg: "#F3ECE6", ink: "#1D1A26", accent: "#E5582F", accentInk: "#FFFFFF", muted: "#6E6878", surface: "#FFFFFF",
        vars: { "--o1": "#FF9B72", "--o2": "#F59AC0", "--o3": "#8CB8FF", "--o4": "#FFE08F", "--glass": "rgba(255,255,255,0.46)", "--glass-line": "rgba(255,255,255,0.8)", "--glow": "rgba(255,140,100,0.45)", "--bg-hi": "#FFF6EE" } },
      { name: "Mint", bg: "#05171A", ink: "#EAFBF4", accent: "#7EF0C4", accentInk: "#04221B", muted: "#8DB6AC", surface: "#0E2C2E",
        vars: { "--o1": "#1FC79E", "--o2": "#2B6EE0", "--o3": "#0B5A55", "--o4": "#C6F77A", "--glass": "rgba(255,255,255,0.07)", "--glass-line": "rgba(200,255,235,0.18)", "--glow": "rgba(60,230,180,0.45)", "--bg-hi": "#0A2D33" } },
      { name: "Mono", bg: "#0B0B0D", ink: "#F3F3F4", accent: "#FFFFFF", accentInk: "#0B0B0D", muted: "#9A9AA3", surface: "#1A1A1E",
        vars: { "--o1": "#8E8E99", "--o2": "#3A3A44", "--o3": "#1F1F26", "--o4": "#E6E6EC", "--glass": "rgba(255,255,255,0.06)", "--glass-line": "rgba(255,255,255,0.14)", "--glow": "rgba(255,255,255,0.28)", "--bg-hi": "#17171C" } },
    ],
    T: { title: "focusIn", body: "softUp", kicker: "softUp", item: "softUp", card: "glassIn", word: "focusIn", number: "count", numberIn: "focusBlock", media: "floatIn", callout: "glassPop", logo: "focusBlock", wordmark: "focusIn", cta: "glassPop", quote: "focusIn", emph: null },
    O: { title: { d: 1.15, st: 0.075 }, quote: { d: 1.2, st: 0.06 }, word: { d: 0.9, st: 0.06 } },
    S: {
      title: null,
      word: { name: "glass", gain: 0.45 },
      count: { name: "glass", gain: 0.75, offset: -0.4 },
      item: { name: ["tick", "tick-2"], gain: 0.45 },
      card: { name: "select", gain: 0.55 },
      media: { name: "whoosh-up", gain: 0.45 },
      callout: { name: "pluck", gain: 0.45 },
      logo: { name: "bell", gain: 0.5 },
      cta: { name: "confirm", gain: 0.55 },
      quote: null,
      bars: { name: "tone-up", gain: 0.5 },
      strike: { name: "tone-down", gain: 0.4 },
      transitions: { blur: "whoosh-long", fade: null, cut: null },
    },
    sfxGain: 0.62,
    drift: 0.02,
    grain: 0.05,
    listIcon: "check",
    transitionFor: (s, i) => (i % 3 === 2 ? "fade" : "blur"),
    tone: () => "base",
    // a soft sunrise swell under the first title, and a closing chime as the orb rises again
    extraCues: (scenes) => {
      const out = [];
      const last = scenes[scenes.length - 1];
      if (scenes[0]) out.push({ name: "whoosh-up", at: scenes[0].t0 + 0.55, gain: 0.5 });
      if (last && /outro|logo/.test(last.kind)) out.push({ name: "riser-air", at: last.t0 + 0.05, gain: 0.35 });
      return out;
    },

    background: {
      markup: () => {
        const blobs = [1, 2, 3, 4, 5].map((i) => `<i class="au-blob b${i}"></i>`).join("");
        const motes = Array.from({ length: 22 }, (_, i) => `<i class="au-mote" data-i="${i}"></i>`).join("");
        return `<div class="au-sky" data-layout-ignore></div><div class="au-blobs" data-layout-ignore>${blobs}</div><div class="au-motes" data-layout-ignore>${motes}</div><div class="au-orb" data-layout-ignore><i class="au-core"></i><i class="au-swirl"></i><i class="au-rim"></i><i class="au-spec"></i></div><div class="au-vig" data-layout-ignore></div>`;
      },
      run: (tl, c) => {
        const P = c.P, W = c.W, H = c.H, u = c.u, dur = P.duration;
        let seed = 29;
        const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
        // ambient colour: five big blurred blobs wander slowly, one waypoint every ~6 s
        document.querySelectorAll(".au-blob").forEach((b, i) => {
          const pts = [];
          for (let t = 0; t <= dur + 6; t += 5.5 + r() * 2) pts.push({ t, x: (r() * 1.1 - 0.05) * W, y: (r() * 1.1 - 0.05) * H, s: 0.8 + r() * 0.6 });
          gsap.set(b, { x: pts[0].x, y: pts[0].y, scale: pts[0].s, xPercent: -50, yPercent: -50 });
          for (let k = 1; k < pts.length; k++) tl.to(b, { x: pts[k].x, y: pts[k].y, scale: pts[k].s, duration: pts[k].t - pts[k - 1].t, ease: "sine.inOut" }, pts[k - 1].t);
        });
        // motes: tiny lights rising
        document.querySelectorAll(".au-mote").forEach((m) => {
          const x = r() * W, y0 = H * (0.25 + r() * 0.9), rise = H * (0.25 + r() * 0.45), sz = 0.25 + r() * 0.5;
          gsap.set(m, { x, y: y0, scale: sz, opacity: 0 });
          const start = r() * Math.min(4, dur * 0.3);
          tl.fromTo(m, { y: y0, opacity: 0 }, { y: y0 - rise, opacity: 0.35 + r() * 0.5, duration: Math.max(2, dur - start), ease: "none" }, start);
        });
        // the dusk orb travels from spot to spot, scene by scene
        const orb = document.querySelector(".au-orb");
        const scenes = P.scenes.map((s) => {
          const el = document.getElementById(s.id);
          const kind = el ? (el.className.match(/kind-([\w-]+)/) || [])[1] : "custom";
          const map = c.fmt === "landscape" ? SPOT : SPOT_TALL;
          let sp = map[kind] || map.custom;
          // a square frame is short: the sunrise sits lower so it never reaches the words
          if (c.fmt === "square" && sp[1] > 100) sp = [sp[0], sp[1] + 24, sp[2]];
          if (kind === "screen" && el && el.querySelector(".media-left")) sp = [100 - sp[0], sp[1], sp[2]];
          return { s, sp };
        });
        const pos = (sp) => ({ x: (sp[0] / 100) * W - 50 * u, y: (sp[1] / 100) * H - 50 * u, scale: sp[2] / 100 });
        if (orb && scenes.length) {
          gsap.set(orb, pos(scenes[0].sp));
          tl.fromTo(orb, { opacity: 0, ...pos([scenes[0].sp[0], scenes[0].sp[1] + 30, scenes[0].sp[2]]) }, { opacity: 1, ...pos(scenes[0].sp), duration: 2.4, ease: "power3.out" }, 0);
          scenes.slice(1).forEach(({ s, sp }) => tl.to(orb, { ...pos(sp), duration: 1.7, ease: "power2.inOut" }, Math.max(0, s.t0 - 0.6)));
          // continuous life inside the orb: the swirl turns, the core breathes
          tl.fromTo(orb.querySelector(".au-swirl"), { rotation: 0 }, { rotation: dur * 14, duration: dur, ease: "none" }, 0);
          const br = Math.max(1, Math.floor(dur / 3.2));
          tl.fromTo(orb.querySelector(".au-core"), { scale: 0.97 }, { scale: 1.03, duration: dur / br, ease: "sine.inOut", yoyo: true, repeat: br - 1 }, 0);
        }
      },
    },

    moves: {
      // words come into focus: blur → sharp, a touch of rise
      focusIn: {
        len: (n, o) => D(o, "d", 1.1) + D(o, "st", 0.075) * (n - 1),
        run: (tl, els, at, o) => {
          const ws = [];
          els.forEach((e) => { const q = e.querySelectorAll(".w"); q.length ? q.forEach((w) => ws.push(w)) : ws.push(e); });
          tl.fromTo(ws, { opacity: 0, filter: "blur(18px)", y: D(o, "y", 18), scale: 1.04 }, { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: D(o, "d", 1.1), stagger: D(o, "st", 0.075), ease: "power3.out" }, at);
        },
      },
      focusBlock: {
        len: (n, o) => D(o, "d", 1.3),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, filter: "blur(24px)", scale: 0.94 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: D(o, "d", 1.3), ease: "power3.out" }, at),
      },
      softUp: {
        len: (n, o) => D(o, "d", 0.95) + D(o, "st", 0.1) * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, y: D(o, "y", 26), filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: D(o, "d", 0.95), stagger: D(o, "st", 0.1), ease: "power3.out" }, at),
      },
      glassIn: {
        len: (n, o) => D(o, "d", 1.1) + 0.12 * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, y: 40, scale: 0.96, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: D(o, "d", 1.1), stagger: 0.12, ease: "expo.out" }, at),
      },
      glassPop: {
        len: (n, o) => D(o, "d", 0.8) + 0.1 * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, scale: 0.82, y: 14, filter: "blur(6px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: D(o, "d", 0.8), stagger: 0.1, ease: "back.out(1.4)" }, at),
      },
      // the device floats up out of the light, then keeps breathing
      floatIn: {
        len: (n, o) => D(o, "d", 1.4) + 0.14 * (n - 1),
        run: (tl, els, at, o, c, s) => {
          tl.fromTo(els, { opacity: 0, y: 90, scale: 0.94, filter: "blur(12px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: D(o, "d", 1.4), stagger: 0.14, ease: "expo.out" }, at);
          const hold = s ? Math.max(0.5, s.dur - (at - s.t0) - 1.2) : 3;
          els.forEach((e, i) => tl.to(e, { y: -10 - 4 * (i % 2), duration: hold, ease: "sine.inOut" }, at + D(o, "d", 1.4) * 0.8));
        },
      },
      wdIn: {
        len: (n, o) => D(o, "d", 0.9),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, filter: "blur(22px)", scale: 1.06 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: D(o, "d", 0.9), ease: "power3.out" }, at),
      },
      wdOut: {
        len: () => 0,
        run: (tl, els, at) => tl.to(els, { opacity: 0, filter: "blur(18px)", scale: 0.97, duration: 0.45, ease: "power2.in" }, at),
      },
    },

    kinds: {
      // each word arrives out of focus and dissolves into the next
      words: {
        // (restates the kit's min: the composer reads `min` from the style's kind alone)
        min: (s) => Math.max(1.8, (s.items || []).length * 0.7),
        plan: (s, c, dur) => {
          const items = s.items || [];
          const n = items.length || 1, beat = dur / n, e = [];
          items.forEach((w, i) => {
            e.push(ev(i * beat, `.wd[data-i="${i}"]`, "wdIn", 1, { d: Math.min(0.9, beat * 0.6) }, c.S.word, "start"));
            if (i < n - 1) e.push(ev((i + 1) * beat - 0.42, `.wd[data-i="${i}"]`, "wdOut", 1));
          });
          return e;
        },
        hero: (s, c, dur) => dur - 0.2,
      },
    },
  });
})();
