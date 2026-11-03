/* Motion Designer — type guard (browser only).
 * Measures the real ink of display text and fixes what a person would see as broken:
 *   - glyphs cut by a mask or a gradient fill (the tails of g, y, p, j; italic overhangs)
 *   - a line's descenders touching the next line's ascenders
 *   - letters touching each other (tight tracking, heavy weights)
 * MD.typeFix(root) corrects line height / tracking / padding before the timeline is built.
 * MD.typeQA(root) reports anything left, as a list (the storyboard and the checker read it).
 */
(function (G) {
  "use strict";
  const MD = (G.MD = G.MD || {});
  const cv = document.createElement("canvas");
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const DISPLAY = ".title, .wordmark, .num, .card .ct, .k-words .wd .title, .cta, .bv";

  // canvas takes width only as a keyword (a % in the font string makes it ignore the whole font)
  const STRETCH = [[50, "ultra-condensed"], [62.5, "extra-condensed"], [75, "condensed"], [87.5, "semi-condensed"], [100, "normal"], [112.5, "semi-expanded"], [125, "expanded"], [150, "extra-expanded"], [200, "ultra-expanded"]];
  const stretchKw = (v) => { const n = parseFloat(v) || 100; return STRETCH.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))[1]; };
  function fontOf(el) {
    const s = getComputedStyle(el);
    return { css: `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`, stretch: stretchKw(s.fontStretch), size: parseFloat(s.fontSize), ls: s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing) || 0, tt: s.textTransform, s };
  }
  function setFont(f) {
    cx.font = f.css;
    try { cx.fontStretch = f.stretch; } catch (e) {}
    try { cx.letterSpacing = f.ls + "px"; } catch (e) {}
    const px = (cx.font.match(/([\d.]+)px/) || [])[1]; if (!px || Math.abs(+px - f.size) > 0.5) MD.typeFontMiss = (MD.typeFontMiss || 0) + 1; // font string rejected
  }
  const shown = (t, tt) => (tt === "uppercase" ? t.toUpperCase() : tt === "lowercase" ? t.toLowerCase() : t);

  // baseline of an inline element: a zero-size probe sitting on it
  function baseline(el) {
    const p = document.createElement("span");
    p.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0";
    el.appendChild(p);
    const y = p.getBoundingClientRect().top;
    p.remove();
    return y;
  }
  // the ink of a word, in page pixels (before any transform is applied by the timeline)
  function ink(wi) {
    const f = fontOf(wi);
    setFont(f);
    const txt = shown(wi.textContent, f.tt);
    const m = cx.measureText(txt);
    const r = wi.getBoundingClientRect();
    const b = baseline(wi);
    const pl = parseFloat(f.s.paddingLeft) || 0;
    return { top: b - m.actualBoundingBoxAscent, bottom: b + m.actualBoundingBoxDescent, left: r.left + pl - m.actualBoundingBoxLeft, right: r.left + pl + m.actualBoundingBoxRight, size: f.size, txt };
  }
  // boxes that would cut a word's ink: overflow on an ancestor, or a text-clipped gradient on itself
  function clips(wi, root) {
    const out = [];
    for (let e = wi; e && e !== root; e = e.parentElement) {
      if (e.classList && (e.classList.contains("k") || e.classList.contains("scene") || e.classList.contains("k-wrap"))) break;
      const s = getComputedStyle(e);
      const bgText = (s.webkitBackgroundClip || s.backgroundClip) === "text";
      const ov = s.overflow !== "visible" || s.overflowX !== "visible" || s.overflowY !== "visible";
      if (bgText || (ov && e !== wi)) out.push({ el: e, r: e.getBoundingClientRect(), why: bgText ? "gradient" : "mask" });
    }
    return out;
  }
  // smallest horizontal gap between two neighbouring letters, in px (negative = overlapping)
  function pairGap(a, b, f) {
    setFont(f);
    const wa = cx.measureText(a), wab = cx.measureText(a + b), wb = cx.measureText(b);
    const x1 = wab.width - wb.width; // where b starts, kerning + tracking included
    const H = Math.ceil(f.size * 1.6), W = Math.ceil(x1 + wb.width + f.size);
    cv.width = W; cv.height = H;
    setFont(f);
    const y = Math.round(f.size * 1.15), x0 = Math.round(f.size * 0.3);
    cx.fillStyle = "#000";
    cx.clearRect(0, 0, W, H); cx.fillText(a, x0, y);
    const A = cx.getImageData(0, 0, W, H).data;
    cx.clearRect(0, 0, W, H); cx.fillText(b, x0 + x1, y);
    const B = cx.getImageData(0, 0, W, H).data;
    let gap = Infinity;
    for (let row = 0; row < H; row++) {
      let ra = -1, lb = -1;
      for (let x = W - 1; x >= 0; x--) if (A[(row * W + x) * 4 + 3] > 96) { ra = x; break; }
      for (let x = 0; x < W; x++) if (B[(row * W + x) * 4 + 3] > 96) { lb = x; break; }
      if (ra >= 0 && lb >= 0) gap = Math.min(gap, lb - ra - 1);
    }
    void wa;
    return gap;
  }

  function lines(words) {
    const by = [];
    for (const w of words) {
      const r = w.getBoundingClientRect();
      let L = by.find((l) => Math.abs(l.top - r.top) < r.height * 0.4);
      if (!L) by.push((L = { top: r.top, words: [] }));
      L.words.push(w);
    }
    return by.sort((a, b) => a.top - b.top);
  }

  function issuesIn(block, root, opts = {}) {
    const out = [];
    const wis = Array.from(block.querySelectorAll(".wi"));
    const units = wis.length ? wis : [block];
    const inks = new Map(units.map((w) => [w, ink(w)]));
    // 1. clipped ink
    for (const w of units) {
      const k = inks.get(w);
      for (const c of clips(w, root)) {
        const tol = 0.75;
        const cut = { top: c.r.top - k.top, bottom: k.bottom - c.r.bottom, left: c.why === "gradient" ? c.r.left - k.left : 0, right: c.why === "gradient" ? k.right - c.r.right : 0 };
        const worst = Object.entries(cut).sort((a, b) => b[1] - a[1])[0];
        if (worst[1] > tol) out.push({ type: "clipped", by: c.why, side: worst[0], px: +worst[1].toFixed(1), text: k.txt, el: w, clip: c.el });
      }
    }
    // 2. lines touching (only where the words sit over each other)
    const ls = lines(units);
    for (let i = 0; i + 1 < ls.length; i++) {
      for (const a of ls[i].words) for (const b of ls[i + 1].words) {
        const A = inks.get(a), B = inks.get(b);
        if (A.right < B.left || B.right < A.left) continue;
        const gap = B.top - A.bottom;
        if (gap < A.size * 0.03) out.push({ type: "lines-touch", px: +gap.toFixed(1), text: `${A.txt} / ${B.txt}`, el: block, need: A.size * 0.05 - gap });
      }
    }
    // 3. letters touching
    if (!opts.skipPairs) for (const w of units) {
      const f = fontOf(w);
      if (f.size < 40) continue;
      const t = shown(w.textContent, f.tt);
      for (let i = 0; i + 1 < t.length; i++) {
        if (/\s/.test(t[i]) || /\s/.test(t[i + 1])) continue;
        const g = pairGap(t[i], t[i + 1], f);
        if (g < Math.max(1, f.size * 0.008)) { out.push({ type: "letters-touch", px: g === Infinity ? null : g, text: t.slice(i, i + 2), word: t, el: w, size: f.size }); break; }
      }
    }
    return out;
  }

  MD.typeQA = function (root = document) {
    const out = [];
    root.querySelectorAll(DISPLAY).forEach((b) => {
      if (!b.offsetParent && getComputedStyle(b).position !== "fixed") return;
      for (const x of issuesIn(b, root)) out.push({ type: x.type, by: x.by, side: x.side, px: x.px, text: x.text || x.word, scene: (b.closest(".scene") || {}).id || "" });
    });
    return out;
  };

  // fix before anything moves: open masks/gradients to the real ink, loosen lines and tracking that touch
  MD.typeFix = function (root = document, refit) {
    const fixed = [];
    root.querySelectorAll(DISPLAY).forEach((b) => {
      for (let pass = 0; pass < 6; pass++) {
        const iss = issuesIn(b, root, { skipPairs: pass > 3 });
        if (!iss.length) break;
        let changed = false;
        for (const x of iss) {
          // every correction is in em, so it scales with the type when the fitter resizes it
          if (x.type === "clipped") {
            // grow the clipping box on that side by what's cut (+ a little air), without moving the layout
            const e = x.clip, es = getComputedStyle(e), efs = parseFloat(es.fontSize) || 16;
            const k = { top: "Top", bottom: "Bottom", left: "Left", right: "Right" }[x.side];
            const add = (x.px + 2) / efs;
            const pad = (parseFloat(es["padding" + k]) || 0) / efs + add;
            const mar = (parseFloat(es["margin" + k]) || 0) / efs - add;
            e.style["padding" + k] = pad.toFixed(3) + "em"; e.style["margin" + k] = mar.toFixed(3) + "em";
            changed = true;
          } else if (x.type === "lines-touch" && !b.dataset.mdLh) {
            const s = getComputedStyle(b), fs = parseFloat(s.fontSize);
            const lh = (parseFloat(s.lineHeight) || fs) / fs;
            const next = Math.min(1.3, lh + (x.need + 1) / fs);
            if (next > lh + 0.001) { b.style.lineHeight = next.toFixed(3); changed = true; }
            b.dataset.mdLh = "1";
          } else if (x.type === "letters-touch") {
            const s = getComputedStyle(b), fs = parseFloat(s.fontSize);
            const ls = (s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing)) / fs;
            const base = b.dataset.mdLs0 != null ? +b.dataset.mdLs0 : (b.dataset.mdLs0 = ls, ls);
            // open the tracking a step at a time, never more than 0.04em over the design
            if (ls < base + 0.06 && ls < 0.03) { b.style.letterSpacing = (ls + 0.01).toFixed(3) + "em"; changed = true; }
          }
          fixed.push({ type: x.type, text: x.text || x.word, scene: (b.closest(".scene") || {}).id || "" });
        }
        if (!changed) break;
        if (refit) refit(b);
        delete b.dataset.mdLh;
      }
    });
    return fixed;
  };
})(typeof window !== "undefined" ? window : globalThis);
