/* Data — results that read like a well-made report. A drafting grid with rulers, mono labels,
   numbers that count, charts that draw, one highlight colour for the number that matters, and
   annotations on leader lines. Scenes hand over with a scan line sweeping across the grid. */
(function () {
  const esc = (s) => MD.esc(s);
  const num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.\-]/g, "")) || 0);
  const fmtVal = (v, s) => {
    const p = MD.parseNumber(`${s.prefix || ""}${v}${s.unit || ""}`) || { pre: "", to: num(v), dec: 0, suf: "", sep: false };
    return `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>`;
  };
  const split = (c) => (c.T.title === "charRise" ? "chars" : "words");
  const title = (s, c, cls = "") => (s.title ? `<h2 class="title ${cls}" data-fit data-maxh="16">${MD.tx(s.title, { split: split(c) })}</h2>` : "");
  const kick = (s) => (s.kicker ? `<div class="kicker">${MD.tx(s.kicker)}</div>` : "");
  const note = (text, cls = "") => (text ? `<div class="dt-note ${cls}"><i class="lead"></i><span class="nt">${MD.tx(text)}</span></div>` : "");
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });
  const titleEv = (s, c, t) => ev(t, ".title", c.T.title, MD.count(s.title, "words"), c.O.title || {}, c.S.title);
  const after = (e) => e.t + MD.moveLen(e.move, e.n, e.o);
  const LABEL = { hook: "Overview", statement: "Finding", words: "Key terms", stat: "Key figure", list: "Summary", steps: "Method", screen: "Product", screens: "Product", features: "Drivers", compare: "Comparison", quote: "Voice", chart: "Distribution", line: "Trend", donut: "Share", rank: "Ranking", logo: "", outro: "", custom: "" };
  // y-axis ticks: 0, half, max (rounded to something a person would print)
  const nice = (max) => { const p = Math.pow(10, Math.floor(Math.log10(max || 1))); const m = (max || 1) / p; return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => m <= x) || 10) * p; };
  const tick = (v) => (Math.abs(v) >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1e3 ? `${+(v / 1e3).toFixed(1)}k` : `${+v.toFixed(1)}`);
  const axis = (top) => `<div class="dt-axis">${[1, 0.5, 0].map((k) => `<div class="tk" style="bottom:${k * 100}%"><span>${esc(tick(top * k))}</span></div>`).join("")}</div>`;

  MD.style("data", {
    order: 6,
    name: "Data",
    tagline: "Numbers that count, charts that draw",
    look: "A drafting grid with rulers and mono labels; big numbers count up, bars grow and lines draw with a moving dot; everything is neutral except one highlight colour for the number that matters, called out on a leader line; scenes hand over with a scan line.",
    bestFor: ["results and growth stories", "reports and investor updates", "explainers with numbers", "benchmarks", "surveys and research", "year in review"],
    avoid: "emotional brand films, products with nothing to measure, playful consumer launches",
    fonts: [
      { name: "Inter Tight", display: "Inter Tight", text: "Inter", mono: "JetBrains Mono", num: "Inter Tight", vars: { "--dw": 650, "--dls": "-0.045em", "--dlh": "1.0", "--tcase": "none", "--nw": 600 } },
      { name: "Instrument Sans", display: "Instrument Sans", text: "Instrument Sans", mono: "Geist Mono", num: "Instrument Sans", vars: { "--dw": 650, "--dwdth": "88%", "--dls": "-0.035em", "--dlh": "1.0", "--tcase": "none", "--nw": 600 } },
      { name: "Geist", display: "Geist", text: "Geist", mono: "Geist Mono", num: "Geist", vars: { "--dw": 620, "--dls": "-0.045em", "--dlh": "1.02", "--tcase": "none", "--nw": 560 } },
      { name: "Space Grotesk", display: "Space Grotesk", text: "Inter", mono: "JetBrains Mono", num: "Space Grotesk", vars: { "--dw": 600, "--dls": "-0.04em", "--dlh": "1.0", "--tcase": "none", "--nw": 600 } },
    ],
    palettes: [
      { name: "Report", bg: "#F4F4F1", ink: "#0F1113", accent: "#3456FF", accentInk: "#FFFFFF", muted: "#686C72", surface: "#FFFFFF", line: "#D9DAD5", vars: { "--grid": "rgba(15,17,19,0.055)", "--grid2": "rgba(15,17,19,0.11)", "--neutral": "#C6C8C2" } },
      { name: "Signal", bg: "#F6F3EE", ink: "#121110", accent: "#E8480F", accentInk: "#FFFFFF", muted: "#6D6861", surface: "#FFFFFF", line: "#DDD8D0", vars: { "--grid": "rgba(18,17,16,0.055)", "--grid2": "rgba(18,17,16,0.11)", "--neutral": "#CBC5BC" } },
      { name: "Terminal", bg: "#0B0D10", ink: "#ECEFF3", accent: "#3DDC97", accentInk: "#06120C", muted: "#858D98", surface: "#13171C", line: "#252B33", vars: { "--grid": "rgba(236,239,243,0.045)", "--grid2": "rgba(236,239,243,0.09)", "--neutral": "#3A424D" } },
      { name: "Midnight", bg: "#0D0F1E", ink: "#F0F1F7", accent: "#FFD23F", accentInk: "#141414", muted: "#8E92AA", surface: "#161931", line: "#272B48", vars: { "--grid": "rgba(240,241,247,0.045)", "--grid2": "rgba(240,241,247,0.09)", "--neutral": "#3A3F66" } },
    ],
    T: { title: "maskUp", body: "fadeUp", kicker: "tag", item: "row", card: "riseIn", word: "maskUp", number: "count", numberIn: "fadeUp", media: "riseIn", callout: "tag", logo: "scaleIn", wordmark: "charRise", cta: "tag", quote: "maskUp", emph: "mark" },
    O: { title: { d: 0.7, st: 0.045 } },
    S: {
      title: null,
      word: { name: ["tick", "tick-2"], gain: 0.8 },
      count: { name: "glass", gain: 0.55 },
      item: { name: ["tick", "tick-2"], gain: 0.6 },
      card: { name: ["card-place", "card-place-2"], gain: 0.6 },
      media: { name: "panel-in", gain: 0.6 },
      callout: { name: "select", gain: 0.6 },
      logo: { name: "glass", gain: 0.7 },
      cta: { name: "confirm", gain: 0.6 },
      quote: null,
      bars: { name: "card-fan", gain: 0.55 },
      line: { name: "riser-air", gain: 0.35 },
      note: { name: "select", gain: 0.6 },
      strike: { name: "scratch", gain: 0.5 },
      transitions: { scan: "swish", cut: null },
    },
    sfxGain: 0.75,
    drift: 0,
    grain: 0,
    listIcon: "arrow-right",
    fill: { hook: { maxh: 50, max: 16 }, statement: { maxh: 44, max: 9.5 }, words: { maxh: 40, max: 24 }, outro: { maxh: 30, max: 12 } },
    transition: "scan",
    tone: () => "base",
    background: {
      markup: (c) => `<div class="dt-grid"></div><div class="dt-ruler top"></div><div class="dt-ruler left"></div><div class="dt-clock" data-layout-ignore>T+00:00.00</div>`,
      run: (tl, c) => {
        const g = document.querySelector(".dt-grid");
        const D = c.P.duration;
        if (g) {
          tl.fromTo(g, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0);
          tl.fromTo(g, { backgroundPosition: "0px 0px" }, { backgroundPosition: `${-c.u * 24}px ${-c.u * 12}px`, duration: D, ease: "none" }, 0);
        }
        document.querySelectorAll(".dt-ruler").forEach((r) => tl.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.2));
        // a running timecode, the one thing that never stops moving
        const clk = document.querySelector(".dt-clock");
        if (clk) {
          const p = { t: 0 };
          const draw = () => { const t = p.t; clk.textContent = `T+${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}.${String(Math.floor((t % 1) * 100)).padStart(2, "0")}`; };
          tl.fromTo(p, { t: 0 }, { t: D, duration: D, ease: "none", onUpdate: draw, onReverseComplete: draw }, 0);
        }
      },
    },
    sceneDecor: (s, i, c) => {
      const brand = (c.video.brand && c.video.brand.name) || "";
      const lab = s.figure || LABEL[s.kind] || "";
      const fig = s.kind === "outro" || s.kind === "logo" ? "" : `FIG. ${String(i + 1).padStart(2, "0")}${lab ? ` — ${esc(lab)}` : ""}`;
      return `<div class="dt-hud" data-layout-ignore><span>${fig}</span><span>${esc(brand)}</span></div>${s.source ? `<div class="dt-src" data-layout-ignore>Source: ${esc(s.source)}</div>` : ""}${i > 0 ? '<i class="dt-scan" data-layout-ignore></i>' : ""}`;
    },
    scene: {
      run: (tl, el, s) => {
        const hud = el.querySelectorAll(".dt-hud span, .dt-src");
        if (hud.length) tl.fromTo(hud, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, s.t0 + 0.1);
      },
    },
    moves: {
      // a mono tag wiped in like a highlighter pass
      tag: {
        len: (n, o) => (o.d || 0.5) + 0.08 * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: o.d || 0.5, stagger: 0.08, ease: "power3.inOut" }, at),
      },
      row: {
        len: (n, o) => (o.d || 0.6) + 0.08 * (n - 1),
        run: (tl, els, at, o) => {
          els.forEach((el, j) => {
            const rule = el.querySelector(".dt-rule");
            if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "expo.out" }, at + j * 0.08);
            tl.fromTo(el.querySelectorAll(".bul, .no, .tx"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: o.d || 0.6, stagger: 0.06, ease: "power3.out" }, at + j * 0.08 + 0.05);
          });
        },
      },
      riseIn: {
        len: (n, o) => (o.d || 0.8) + (o.st != null ? o.st : 0.1) * (n - 1),
        run: (tl, els, at, o) => tl.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: o.d || 0.8, stagger: o.st != null ? o.st : 0.1, ease: "expo.out" }, at),
      },
      // a leader line drops, then the annotation wipes in at its end
      note: {
        len: () => 0.85,
        run: (tl, els, at) => els.forEach((el) => {
          const lead = el.querySelector(".lead"), nt = el.querySelector(".nt");
          if (lead) tl.fromTo(lead, { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "power2.out" }, at);
          if (nt) tl.fromTo(nt, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" }, at + 0.35);
        }),
      },
      // the line chart: built at load from its numbers, drawn with a dot riding its head
      lineDraw: {
        len: (n, o) => o.d || 1.8,
        run: (tl, els, at, o) => els.forEach((plot) => {
          const vals = JSON.parse(plot.dataset.values || "[]");
          const top = +plot.dataset.top || Math.max(...vals, 1);
          const w = plot.offsetWidth, h = plot.offsetHeight;
          if (!vals.length || !w || !h) return;
          const pts = vals.map((v, i) => [vals.length === 1 ? w : (i / (vals.length - 1)) * w, h - (v / top) * h]);
          const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
          const svg = plot.querySelector("svg");
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
          const line = svg.querySelector(".dl-line"), area = svg.querySelector(".dl-area");
          line.setAttribute("d", d);
          area.setAttribute("d", `${d}L${w},${h}L0,${h}Z`);
          svg.querySelectorAll(".dl-pt").forEach((c, i) => { if (pts[i]) { c.setAttribute("cx", pts[i][0]); c.setAttribute("cy", pts[i][1]); } });
          const L = line.getTotalLength();
          line.style.strokeDasharray = `${L} ${L}`;
          const dot = plot.querySelector(".dl-dot"), end = plot.querySelector(".dl-end");
          const last = pts[pts.length - 1];
          if (end) { end.style.left = last[0] + "px"; end.style.top = last[1] + "px"; }
          const p = { v: 0 };
          const draw = () => {
            line.style.strokeDashoffset = L * (1 - p.v);
            const q = line.getPointAtLength(L * p.v);
            if (dot) { dot.style.left = q.x + "px"; dot.style.top = q.y + "px"; }
          };
          draw();
          const dur = o.d || 1.8;
          tl.fromTo(p, { v: 0 }, { v: 1, duration: dur, ease: "power2.inOut", onUpdate: draw, onReverseComplete: draw }, at);
          tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out" }, at + dur * 0.6);
          tl.fromTo(svg.querySelectorAll(".dl-pt"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" }, { scale: 1, duration: 0.3, stagger: dur / Math.max(1, vals.length), ease: "back.out(3)" }, at);
          if (dot) tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at);
        }),
      },
      ring: {
        len: (n, o) => o.d || 1.6,
        run: (tl, els, at, o) => els.forEach((arc) => {
          const C = 2 * Math.PI * 42;
          const share = Math.max(0, Math.min(1, +arc.dataset.share || 0));
          arc.style.strokeDasharray = `${C} ${C}`;
          tl.fromTo(arc, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - share), duration: o.d || 1.6, ease: "expo.out" }, at);
        }),
      },
    },
    transitions: {
      // a hairline sweeps across the grid; the old figure is wiped off behind it, the new one revealed
      scan: {
        ov: 0.75,
        run: (tl, out, inn, at, ov, c) => {
          const sec = inn.closest("section");
          const line = sec && sec.querySelector(".dt-scan");
          const a = at - ov / 2;
          tl.fromTo(out, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: ov, ease: "power2.inOut" }, a);
          tl.fromTo(inn, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ov, ease: "power2.inOut" }, a);
          if (line) {
            tl.fromTo(line, { left: "0%", opacity: 1 }, { left: "100%", duration: ov, ease: "power2.inOut" }, a);
            tl.to(line, { opacity: 0, duration: 0.15 }, a + ov);
          }
          const hud = out.closest("section").querySelectorAll(".dt-hud, .dt-src");
          if (hud.length) tl.to(hud, { opacity: 0, duration: ov * 0.5 }, a);
        },
      },
    },
    kinds: {
      stat: {
        fields: ["kicker", "value", "label", "delta", "note"],
        min: (s) => Math.max(2.4, 1.6 + MD.count(s.label) * 0.2 + (s.note ? 0.8 : 0)),
        markup: (s, c) => {
          const p = MD.parseNumber(s.value);
          const n = p ? `<span class="pre">${esc(p.pre)}</span><span class="val" data-to="${p.to}" data-dec="${p.dec}" data-sep="${p.sep ? 1 : 0}">${MD.formatNumber(p.to, p.dec, p.sep)}</span><span class="suf">${esc(p.suf)}</span>` : `<span class="val-text">${esc(s.value)}</span>`;
          const trend = Array.isArray(s.trend) && s.trend.length > 1 ? `<div class="dt-spark" data-values="${esc(JSON.stringify(s.trend.map(num)))}" data-top="${Math.max(...s.trend.map(num)) * 1.05}"><svg preserveAspectRatio="none"><path class="dl-area"/><path class="dl-line"/></svg><i class="dl-dot"></i></div>` : "";
          return `<div class="k k-stat"><div class="box">${kick(s)}<div class="num" data-fit data-maxh="34">${n}</div>${s.delta ? `<div class="dt-delta">${/^[-−▼]/.test(s.delta) ? "▼" : "▲"} ${esc(String(s.delta).replace(/^[+\-−▲▼]\s*/, ""))}</div>` : ""}${trend}${s.label ? `<p class="label">${MD.tx(s.label)}</p>` : ""}${note(s.note, "stat-note")}</div></div>`;
        },
        plan: (s, c) => {
          const e = [];
          if (s.kicker) e.push(ev(0.1, ".kicker", "tag", 1));
          e.push(ev(0.2, ".num", "fadeUp", 1, { y: 30 }));
          if (MD.parseNumber(s.value)) e.push(ev(0.2, ".val", "count", 1, { d: 1.8 }, c.S.count, "end"));
          if (s.delta) e.push(ev(1.4, ".dt-delta", "tag", 1, {}, c.S.callout));
          if (Array.isArray(s.trend) && s.trend.length > 1) e.push(ev(0.4, ".dt-spark", "lineDraw", 1, { d: 1.6 }));
          if (s.label) e.push(ev(0.7, ".label", "fadeUp", MD.count(s.label)));
          if (s.note) e.push(ev(1.9, ".dt-note", "note", 1, {}, c.S.note));
          return e;
        },
      },
      chart: {
        fields: ["title", "bars", "unit", "note"],
        min: (s) => Math.max(3.2, (s.title ? MD.count(s.title) * 0.24 : 0) + (s.bars || []).length * 0.2 + 1.6 + (s.note ? 0.6 : 0)),
        markup: (s, c) => {
          const bars = s.bars || [];
          const max = Math.max(1, ...bars.map((b) => Math.abs(num(b.value))));
          const top = nice(max);
          const hi = bars.reduce((bi, b, i) => (num(b.value) > num((bars[bi] || {}).value) ? i : bi), 0);
          return `<div class="k k-chart n${bars.length}${s.note ? " has-note" : ""}"><div class="box">${kick(s)}${title(s, c)}<div class="dt-frame">${axis(top)}<div class="plot">${bars.map((b, i) => {
            const isHi = b.highlight != null ? b.highlight : i === hi;
            return `<div class="bar${isHi ? " hi" : ""}" data-i="${i}" style="--v:${(Math.abs(num(b.value)) / top).toFixed(4)}"><div class="col"><i class="fill"></i><div class="bv">${fmtVal(b.display || b.value, s)}</div>${isHi && s.note ? note(s.note, "bar-note") : ""}</div><div class="bl">${esc(b.label || "")}</div></div>`;
          }).join("")}</div></div></div></div>`;
        },
        plan: (s, c) => {
          const e = [];
          let t = 0.1;
          if (s.kicker) e.push(ev(0.05, ".kicker", "tag", 1));
          if (s.title) { const te = titleEv(s, c, 0.1); e.push(te); t = after(te) - 0.3; }
          const n = (s.bars || []).length;
          e.push(ev(t, ".dt-axis .tk", "fadeIn", 3, { st: 0.06, d: 0.4 }));
          e.push(ev(t, ".bl", "fadeIn", n, { st: 0.06, d: 0.4 }));
          e.push(ev(t + 0.15, ".fill", "grow", n, { d: 1.1, st: 0.1 }, c.S.bars));
          e.push(ev(t + 0.15, ".bv", "fadeUp", n, { y: 10, st: 0.1, d: 0.5 }));
          e.push(ev(t + 0.15, ".val", "count", n, { d: 1.1 + 0.1 * (n - 1) }));
          if (s.note) e.push(ev(t + 1.5 + 0.1 * n, ".dt-note", "note", 1, {}, c.S.note));
          return e;
        },
      },
      line: {
        fields: ["kicker", "title", "values", "labels", "unit", "prefix", "note"],
        min: (s) => Math.max(3.4, (s.title ? MD.count(s.title) * 0.24 : 0) + 2.4 + (s.note ? 0.6 : 0)),
        markup: (s, c) => {
          const vals = (s.values || []).map(num);
          const top = nice(Math.max(1, ...vals) * 1.1);
          const labels = s.labels || [];
          const last = vals.length ? s.values[s.values.length - 1] : 0;
          return `<div class="k k-line"><div class="box">${kick(s)}${title(s, c)}<div class="dt-frame">${axis(top)}<div class="plot dl-plot" data-values="${esc(JSON.stringify(vals))}" data-top="${top}"><svg preserveAspectRatio="none"><path class="dl-area"/><path class="dl-line"/>${vals.map(() => '<circle class="dl-pt" r="5"/>').join("")}</svg><i class="dl-dot"></i><div class="dl-end"><div class="bv">${fmtVal(last, s)}</div>${note(s.note, "line-note")}</div></div><div class="dl-x">${labels.map((l) => `<span>${esc(l)}</span>`).join("")}</div></div></div></div>`;
        },
        plan: (s, c) => {
          const e = [];
          let t = 0.1;
          if (s.kicker) e.push(ev(0.05, ".kicker", "tag", 1));
          if (s.title) { const te = titleEv(s, c, 0.1); e.push(te); t = after(te) - 0.3; }
          e.push(ev(t, ".dt-axis .tk, .dl-x span", "fadeIn", 6, { st: 0.04, d: 0.4 }));
          e.push(ev(t + 0.2, ".dl-plot", "lineDraw", 1, { d: 1.9 }, c.S.line));
          e.push(ev(t + 1.75, ".dl-end .bv", "fadeUp", 1, { y: 10, d: 0.5 }, c.S.count));
          e.push(ev(t + 0.2, ".dl-end .val", "count", 1, { d: 1.9, ease: "power2.inOut" }));
          if (s.note) e.push(ev(t + 2.3, ".dt-note", "note", 1, {}, c.S.note));
          return e;
        },
      },
      donut: {
        fields: ["kicker", "title", "value", "label", "note"],
        min: (s) => Math.max(2.9, 1.8 + MD.count(s.label) * 0.2 + (s.title ? MD.count(s.title) * 0.2 : 0)),
        markup: (s, c) => {
          const p = MD.parseNumber(s.value) || { pre: "", to: 0, dec: 0, suf: "%", sep: false };
          const share = /%/.test(p.suf) ? p.to / 100 : Math.min(1, p.to);
          return `<div class="k k-donut"><div class="dd-wrap"><div class="dd-ring"><svg viewBox="0 0 100 100"><circle class="dd-track" cx="50" cy="50" r="42"/><circle class="dd-arc" cx="50" cy="50" r="42" data-share="${share.toFixed(4)}"/></svg><div class="dd-num">${fmtVal(s.value, {})}</div></div><div class="dd-copy">${kick(s)}${title(s, c)}${s.label ? `<p class="label">${MD.tx(s.label)}</p>` : ""}${note(s.note, "donut-note")}</div></div></div>`;
        },
        plan: (s, c) => {
          const e = [];
          e.push(ev(0.1, ".dd-ring", "riseIn", 1, { d: 0.7 }));
          e.push(ev(0.25, ".dd-arc", "ring", 1, { d: 1.7 }, c.S.count, "end"));
          e.push(ev(0.25, ".dd-num .val", "count", 1, { d: 1.7 }));
          if (s.kicker) e.push(ev(0.2, ".kicker", "tag", 1));
          if (s.title) e.push(titleEv(s, c, 0.3));
          if (s.label) e.push(ev(0.9, ".label", "fadeUp", MD.count(s.label)));
          if (s.note) e.push(ev(2.0, ".dt-note", "note", 1, {}, c.S.note));
          return e;
        },
      },
      rank: {
        fields: ["kicker", "title", "items", "unit", "prefix"],
        min: (s) => Math.max(3.0, (s.title ? MD.count(s.title) * 0.24 : 0) + (s.items || []).length * 0.28 + 1.4),
        markup: (s, c) => {
          const items = (s.items || []).map((x) => (typeof x === "string" ? { label: x, value: 0 } : x));
          const max = Math.max(1, ...items.map((x) => Math.abs(num(x.value))));
          const hi = items.reduce((bi, x, i) => (num(x.value) > num((items[bi] || {}).value) ? i : bi), 0);
          return `<div class="k k-rank"><div class="box">${kick(s)}${title(s, c)}<div class="rk-rows">${items.map((x, i) => `<div class="rk${(x.highlight != null ? x.highlight : i === hi) ? " hi" : ""}" data-i="${i}"><span class="rl">${esc(x.label)}</span><span class="rt"><i class="rf" style="--v:${(Math.abs(num(x.value)) / max).toFixed(4)}"></i></span><span class="bv">${fmtVal(x.display || x.value, s)}</span></div>`).join("")}</div></div></div>`;
        },
        plan: (s, c) => {
          const e = [];
          let t = 0.1;
          if (s.kicker) e.push(ev(0.05, ".kicker", "tag", 1));
          if (s.title) { const te = titleEv(s, c, 0.1); e.push(te); t = after(te) - 0.3; }
          const n = (s.items || []).length;
          e.push(ev(t, ".rl", "fadeUp", n, { y: 10, st: 0.08, d: 0.5 }));
          e.push(ev(t + 0.15, ".rf", "growX", n, { d: 1.1, st: 0.09 }, c.S.bars));
          e.push(ev(t + 0.15, ".bv", "fadeIn", n, { st: 0.09, d: 0.4 }));
          e.push(ev(t + 0.15, ".val", "count", n, { d: 1.1 + 0.09 * (n - 1) }));
          return e;
        },
      },
      list: {
        markup: (s, c) => MD.kinds.list.markup(s, c).replace(/<li class="it" data-i="(\d+)">/g, (m, i) => `<li class="it" data-i="${i}"><i class="dt-rule"></i><span class="no">${String(+i + 1).padStart(2, "0")}</span>`),
      },
      steps: {
        markup: (s, c) => MD.kinds.steps.markup(s, c).replace(/<li class="it" data-i="(\d+)">/g, (m, i) => `<li class="it" data-i="${i}"><i class="dt-rule"></i>`),
      },
      words: {
        hero: (s, c, dur) => dur - 0.5,
        markup: (s, c) => `<div class="k k-words">${(s.items || []).map((w, i, a) => `<div class="wd" data-i="${i}"><div class="dw-n">${String(i + 1).padStart(2, "0")} / ${String(a.length).padStart(2, "0")}</div><div class="title" data-fit data-maxh="40">${MD.tx(w)}</div></div>`).join("")}</div>`,
      },
    },
  });
})();
