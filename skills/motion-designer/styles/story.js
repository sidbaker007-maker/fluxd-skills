/* Story — a little film with people in it. Flat illustrated characters (any name becomes a person with
   their own hair, skin and clothes) act out the story in simple sets: they walk in, wave, type, check a
   phone, think, slump, point and cheer, with speech bubbles and a narrator's caption. Story scenes
   follow one another like a camera panning along the street; the product shows up on a screen card. */
(function () {
  const D = (o, k, d) => (o && o[k] != null ? o[k] : d);
  const ev = (t, sel, move, n, o, sfx, hit) => ({ t: Math.max(0, t), sel, move, n: n || 1, o: o || {}, sfx: sfx || null, hit: hit || "start" });
  const esc = (s) => MD.esc(s);

  // ---------- the cast ----------
  const SKIN = ["#F7D7BC", "#EDB892", "#CF9468", "#A06A45", "#6E4630"];
  const HAIRC = ["#1E1915", "#4B2E1E", "#7B4A26", "#C98B3E", "#2E2E33", "#A8A29A", "#B4442E"];
  const HAIR = ["short", "bun", "long", "curly", "bob", "beard", "cap", "bald"];
  const TOPS = ["var(--accent)", "var(--cool)", "var(--pop)", "var(--leaf)", "var(--accent2)"];
  const BOTTOMS = ["#2B3A55", "#3A3633", "#5A4632", "#1F4E5F", "#47395E"];
  const hash = (s) => { let h = 2166136261; for (const ch of String(s || "x").toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
  const pickC = (v, list, h) => (typeof v === "number" ? list[((v % list.length) + list.length) % list.length] : typeof v === "string" && v ? v : list[h % list.length]);
  function lookOf(name, c) {
    const cast = (c.video && c.video.cast) || [];
    const own = (Array.isArray(cast) ? cast.find((x) => x && String(x.name || "").toLowerCase() === String(name || "").toLowerCase()) : cast[name]) || {};
    const h = hash(name);
    return {
      hair: HAIR.includes(own.hair) ? own.hair : HAIR[h % 6],
      skin: pickC(own.skin, SKIN, h >> 3),
      hairColor: pickC(own.hairColor, HAIRC, h >> 6),
      top: pickC(own.top, TOPS, (h >> 9) + 0),
      bottom: pickC(own.bottom, BOTTOMS, h >> 12),
    };
  }
  // "Lena", "Lena: wave", or {who, do, enter}
  const member = (m) => {
    if (typeof m === "string") { const [who, act] = m.split(":").map((x) => x.trim()); return { who, do: act || "stand" }; }
    return { who: m.who || m.name || "Alex", do: m.do || m.action || "stand", enter: m.enter || null, say: m.say || null };
  };
  const castOf = (s) => [].concat(s.cast || []).slice(0, 3).map(member);

  // ---------- a person (front view, 340×440 user units, joints at fixed points) ----------
  function hairBack(h) {
    if (h === "long") return `<path class="p-hair" d="M-35 -40C-37 -84 37 -84 35 -40L37 30Q0 40 -37 30Z"/>`;
    if (h === "bob") return `<path class="p-hair" d="M-37 -38C-39 -86 39 -86 37 -38L37 -4Q37 4 29 4L-29 4Q-37 4 -37 -4Z"/>`;
    if (h === "curly") return `<circle class="p-hair" cx="0" cy="-46" r="36"/>`;
    return "";
  }
  function hairFront(h) {
    if (h === "short" || h === "beard") return `<path class="p-hair" d="M-31 -34C-35 -70 -12 -80 4 -78C26 -77 37 -62 31 -36C28 -50 20 -56 10 -57C-4 -58 -10 -50 -22 -50C-27 -48 -30 -42 -31 -34Z"/>` + (h === "beard" ? `<path class="p-hair" d="M-29 -34C-28 -4 -12 6 0 6C12 6 28 -4 29 -34C24 -22 14 -16 0 -16C-14 -16 -24 -22 -29 -34Z"/><path class="p-skin" d="M-8 -22Q0 -18 8 -22Q0 -14 -8 -22Z"/>` : "");
    if (h === "bun") return `<circle class="p-hair" cx="0" cy="-82" r="15"/><path class="p-hair" d="M-31 -36C-33 -72 33 -72 31 -36C24 -56 8 -62 -2 -60C-16 -58 -26 -50 -31 -36Z"/>`;
    if (h === "long") return `<path class="p-hair" d="M-31 -36C-31 -72 31 -74 31 -36C22 -58 2 -62 -10 -56C-20 -52 -28 -44 -31 -36Z"/>`;
    if (h === "bob") return `<path class="p-hair" d="M-32 -42C-32 -76 32 -76 32 -42L32 -50C20 -46 -20 -46 -32 -50Z"/>`;
    if (h === "curly") return Array.from({ length: 9 }, (_, k) => { const a = Math.PI * (1.05 + (k / 8) * 0.9); return `<circle class="p-hair" cx="${(31 * Math.cos(a)).toFixed(1)}" cy="${(-42 + 31 * Math.sin(a)).toFixed(1)}" r="12"/>`; }).join("");
    if (h === "cap") return `<path class="p-cap" d="M-32 -44C-32 -84 32 -84 32 -44Z"/><path class="p-cap" d="M-32 -46L48 -46Q53 -40 46 -38L-32 -40Z"/><circle class="p-capdot" cx="0" cy="-80" r="4"/>`;
    return "";
  }
  function person(look, i, act) {
    const leg = (x, side) => `<g transform="translate(${x} 276)"><g class="r j-leg${side}"><rect class="p-bottom" x="-14" y="-4" width="28" height="58" rx="13"/><g transform="translate(0 50)"><g class="r j-shin${side}"><rect class="p-bottom" x="-13" y="-4" width="26" height="58" rx="12"/><ellipse class="p-shoe" cx="${side === "L" ? -6 : 6}" cy="56" rx="18" ry="9.5"/></g></g></g></g>`;
    const arm = (x, side) => `<g transform="translate(${x} 152)"><g class="r j-arm${side}"><rect class="p-top" x="-12" y="-8" width="24" height="62" rx="12"/><g transform="translate(0 50)"><g class="r j-fore${side}"><rect class="p-top p-sleeve" x="-11" y="-4" width="22" height="52" rx="11"/>${side === "R" ? `<g class="p-phone"><rect x="-10" y="34" width="20" height="34" rx="4"/><rect class="p-phonescr" x="-7.5" y="37" width="15" height="27" rx="2"/></g>` : ""}<circle class="p-skin" cx="0" cy="52" r="11.5"/></g></g></g></g>`;
    return `<svg class="sy-p" viewBox="-70 -24 340 424" aria-hidden="true" style="--skin:${look.skin};--hair:${look.hairColor};--top:${look.top};--bottom:${look.bottom}">
<ellipse class="p-shadow" cx="100" cy="390" rx="70" ry="10"/>
<g class="j-body">
${leg(85, "L")}${leg(115, "R")}
<rect class="p-bottom" x="66" y="248" width="68" height="36" rx="12"/>
<rect class="p-skin" x="91" y="112" width="18" height="34" rx="6"/>
<path class="p-top" d="M62 154Q62 136 80 136L120 136Q138 136 138 154L134 266Q134 272 128 272L72 272Q66 272 66 266Z"/>
<path class="p-skin" d="M90 138L100 154L110 138Z"/>
${arm(68, "L")}${arm(132, "R")}
<g transform="translate(100 132)"><g class="r j-head">
${hairBack(look.hair)}
<ellipse class="p-skin" cx="-30" cy="-36" rx="6" ry="8"/><ellipse class="p-skin" cx="30" cy="-36" rx="6" ry="8"/>
<ellipse class="p-skin" cx="0" cy="-40" rx="30" ry="34"/>
<ellipse class="p-cheek" cx="-17" cy="-25" rx="6" ry="4"/><ellipse class="p-cheek" cx="17" cy="-25" rx="6" ry="4"/>
<g class="p-eyes"><ellipse class="p-ink" cx="-11" cy="-38" rx="3.4" ry="4.2"/><ellipse class="p-ink" cx="11" cy="-38" rx="3.4" ry="4.2"/></g>
<g class="p-brows"><path class="p-line" d="M-16 -50Q-11 -53 -6 -50"/><path class="p-line" d="M6 -50Q11 -53 16 -50"/></g>
<path class="p-mouth p-line" d="M-7 -23Q0 -18 7 -23"/>
${hairFront(look.hair)}
</g></g>
</g>
${act === "laptop" ? `<g class="p-desk"><rect class="p-wood" x="-6" y="262" width="212" height="14" rx="5"/><rect class="p-wood2" x="6" y="276" width="188" height="120"/><path class="p-lid" d="M54 186Q54 180 60 180L140 180Q146 180 146 186L150 262L50 262Z"/><circle class="p-logo" cx="100" cy="220" r="7"/></g>` : ""}
</svg>`;
  }

  // ---------- the sets (1600×900, floor from y 760, sliced to the frame from the bottom) ----------
  const SETS = {
    home: () => `<rect class="c-wall2" x="0" y="600" width="1600" height="160"/><rect class="c-sky" x="930" y="150" width="380" height="320" rx="22"/><circle class="c-sun" cx="1200" cy="250" r="46"/><path class="c-cloud" d="M990 360a34 34 0 0 1 60 -18a40 40 0 0 1 74 10a26 26 0 0 1 4 52h-128a24 24 0 0 1 -10 -44z"/><path class="c-frame" d="M930 310H1310M1120 150V470" /><rect class="c-wood" x="910" y="466" width="420" height="20" rx="8"/><rect class="c-pic" x="420" y="210" width="190" height="140" rx="10"/><path class="c-leaf" d="M450 330l40 -60l34 40l26 -24l40 44z"/><circle class="c-pop" cx="560" cy="250" r="16"/><rect class="c-pot" x="270" y="640" width="90" height="120" rx="14"/><path class="c-leaf" d="M315 650C250 600 236 520 262 480C300 520 316 580 315 650ZM315 650C326 560 360 500 398 488C404 552 370 618 315 650ZM315 650C300 590 312 530 330 470C352 530 344 600 315 650Z"/><rect class="c-ink2" x="1430" y="430" width="10" height="330"/><path class="c-acc" d="M1380 440h110l-24 -86h-62z"/><ellipse class="c-rug" cx="800" cy="840" rx="520" ry="46"/>`,
    office: () => `<rect class="c-wall2" x="0" y="560" width="1600" height="200"/><rect class="c-wood" x="230" y="300" width="460" height="18" rx="6"/>${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect class="${["c-acc", "c-cool", "c-pop", "c-leaf", "c-ink2", "c-acc", "c-cool"][k]}" x="${250 + k * 34}" y="${214 + (k % 3) * 10}" width="26" height="${86 - (k % 3) * 10}" rx="4"/>`).join("")}<circle class="c-pot" cx="600" cy="282" r="20"/><circle class="c-clock" cx="1220" cy="230" r="64"/><path class="c-hands" d="M1220 230V190M1220 230H1254"/><rect class="c-sky" x="880" y="380" width="220" height="150" rx="14"/><path class="c-leaf" d="M900 510l50 -70l40 46l30 -28l60 52z"/><rect class="c-pot" x="1380" y="660" width="80" height="100" rx="12"/><path class="c-leaf" d="M1420 666C1370 620 1360 560 1380 520C1414 556 1424 610 1420 666ZM1420 666C1430 600 1460 560 1494 552C1496 604 1466 650 1420 666Z"/>`,
    street: () => `<rect class="c-b1" x="40" y="250" width="300" height="510" rx="10"/><rect class="c-b2" x="360" y="140" width="260" height="620" rx="10"/><rect class="c-b1" x="1000" y="200" width="280" height="560" rx="10"/><rect class="c-b2" x="1300" y="320" width="260" height="440" rx="10"/>${[[80, 300], [200, 300], [80, 420], [200, 420], [80, 540], [200, 540], [400, 200], [510, 200], [400, 330], [510, 330], [400, 460], [510, 460], [1040, 260], [1160, 260], [1040, 390], [1160, 390], [1340, 380], [1450, 380], [1340, 500], [1450, 500]].map(([x, y], k) => `<rect class="${k % 5 === 2 ? "c-pop" : "c-win"}" x="${x}" y="${y}" width="72" height="80" rx="6"/>`).join("")}<rect class="c-ink2" x="790" y="420" width="12" height="340"/><circle class="c-pop" cx="796" cy="410" r="22"/><circle class="c-leaf" cx="690" cy="560" r="80"/><rect class="c-wood" x="682" y="600" width="16" height="160"/><rect class="c-wall2" x="0" y="752" width="1600" height="16"/>`,
    shop: () => `<rect class="c-wall2" x="0" y="560" width="1600" height="200"/><path class="c-acc" d="M300 120H1300V200H300Z"/>${Array.from({ length: 10 }, (_, k) => `<path class="${k % 2 ? "c-bg" : "c-acc"}" d="M${300 + k * 100} 200h100v40a50 50 0 0 1 -100 0z"/>`).join("")}${Array.from({ length: 5 }, (_, k) => `<rect class="c-awn" x="${300 + k * 200 + 100}" y="120" width="100" height="80"/>`).join("")}<rect class="c-sky" x="380" y="300" width="840" height="300" rx="16"/><rect class="c-wood" x="380" y="420" width="840" height="14"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect class="${["c-pop", "c-acc", "c-leaf", "c-cool"][k % 4]}" x="${420 + k * 100}" y="${360 + (k % 2) * 6}" width="50" height="${60 - (k % 2) * 6}" rx="10"/>`).join("")}${[0, 1, 2, 3, 4].map((k) => `<circle class="${["c-acc", "c-pop", "c-leaf"][k % 3]}" cx="${460 + k * 170}" cy="${520}" r="34"/>`).join("")}`,
    park: () => `<circle class="c-sun" cx="1240" cy="220" r="90"/><ellipse class="c-hill2" cx="300" cy="780" rx="620" ry="240"/><ellipse class="c-hill" cx="1300" cy="800" rx="700" ry="220"/><circle class="c-leaf" cx="280" cy="420" r="110"/><rect class="c-wood" x="268" y="480" width="26" height="280"/><circle class="c-leaf2" cx="1420" cy="470" r="84"/><rect class="c-wood" x="1410" y="520" width="20" height="240"/><path class="c-cloud" d="M560 240a40 40 0 0 1 70 -20a48 48 0 0 1 88 12a30 30 0 0 1 4 60h-150a28 28 0 0 1 -12 -52z"/>`,
    plain: () => `<circle class="c-blob" cx="800" cy="520" r="330"/>`,
  };
  const SET_NAMES = Object.keys(SETS);
  const setSvg = (name) => `<svg class="sy-set" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect class="c-bg" x="-2000" y="-2000" width="5600" height="2760"/><rect class="c-floor" x="-2000" y="760" width="5600" height="2000"/>${(SETS[name] || SETS.plain)()}<rect class="c-floorline" x="-2000" y="760" width="5600" height="6"/></svg>`;

  // ---------- when things happen in a story scene (markup and plan share it) ----------
  const ENTER = 1.05;
  function beats(s) {
    const cast = castOf(s);
    const entering = cast.some((m) => m.enter);
    const act = entering ? ENTER : 0.35;
    const say = s.say ? act + 0.35 : null;
    return { cap: 0.12, act, say, media: entering ? 0.7 : 0.45, cast };
  }
  const slotsFor = (n, media, fmt) => {
    if (media && fmt !== "portrait") return n === 1 ? [27] : n === 2 ? [16, 38] : [12, 27, 42];
    return fmt === "portrait" ? (n === 1 ? [50] : n === 2 ? [29, 71] : [17, 50, 83]) : n === 1 ? [50] : n === 2 ? [35, 65] : [24, 50, 76];
  };

  // ---------- the rig: pose = f(time), drawn every frame by one modifier ----------
  const L1 = 50, L2 = 52;
  // two-bone IK: the upper arm and forearm angles that put the hand at (tx, ty), elbow bent outward
  function ik(sx, sy, tx, ty, out) {
    let dx = tx - sx, dy = ty - sy;
    let d = Math.hypot(dx, dy) || 1;
    const dc = Math.min(L1 + L2 - 0.5, Math.max(Math.abs(L1 - L2) + 2, d));
    dx *= dc / d; dy *= dc / d; d = dc;
    const base = Math.atan2(dy, dx);
    const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    let best = null;
    for (const sg of [1, -1]) {
      const ex = sx + L1 * Math.cos(base + sg * a), ey = sy + L1 * Math.sin(base + sg * a);
      const score = (ex - 100) * out;
      if (!best || score > best.score) best = { ex, ey, score };
    }
    const deg = (x, y) => (Math.atan2(-x, y) * 180) / Math.PI; // rotation that turns (0,1) toward (x,y)
    const u = deg(best.ex - sx, best.ey - sy);
    const f = deg(sx + dx - best.ex, sy + dy - best.ey);
    return [u, f - u];
  }
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const mix = (a, b, k) => a + (b - a) * k;
  const mixP = (p, q, k) => ({ ...q, hl: [mix(p.hl[0], q.hl[0], k), mix(p.hl[1], q.hl[1], k)], hr: [mix(p.hr[0], q.hr[0], k), mix(p.hr[1], q.hr[1], k)], y: mix(p.y, q.y, k), head: mix(p.head, q.head, k), lift: [mix(p.lift[0], q.lift[0], k), mix(p.lift[1], q.lift[1], k)], lean: mix(p.lean, q.lean, k) });
  const idle = (t, ph) => ({ hl: [56 + Math.sin(t * 1.3 + ph) * 1.5, 250], hr: [144 - Math.sin(t * 1.1 + ph) * 1.5, 250], y: Math.sin(t * 2.2 + ph) * 1.4, head: Math.sin(t * 0.8 + ph) * 2, lift: [0, 0], lean: 0, mouth: "smile", brows: false, look: 0, phone: false });
  // each action: the pose it holds, as a function of the time since it started (k = how far it has eased in)
  const ACTS = {
    stand: (t, p) => p,
    wave: (t, p) => ({ ...p, hr: [168 + Math.sin(t * 9) * 16, 62], head: 5 + Math.sin(t * 2) * 2, mouth: "open" }),
    talk: (t, p) => ({ ...p, hr: [158 + Math.sin(t * 2.6) * 10, 196 + Math.sin(t * 4.1) * 8], head: Math.sin(t * 2.4) * 4, mouth: Math.sin(t * 15) > 0 ? "open" : "smile" }),
    think: (t, p) => ({ ...p, hr: [108, 132], hl: [64, 250], head: -7 + Math.sin(t * 1.3) * 2, mouth: "flat", brows: true, look: -1 }),
    laptop: (t, p) => ({ ...p, hl: [86, 240 + (Math.sin(t * 19) > 0.3 ? 4 : 0)], hr: [114, 240 + (Math.sin(t * 19 + 2) > 0.3 ? 4 : 0)], head: 3 + Math.sin(t * 1.2) * 1.5, mouth: "flat", look: 1 }),
    phone: (t, p) => ({ ...p, hr: [114, 170], hl: [96, 196], head: 6, mouth: "smile", look: 1, phone: true }),
    cheer: (t, p) => ({ ...p, hl: [34 + Math.sin(t * 8) * 6, 58], hr: [166 - Math.sin(t * 8) * 6, 58], y: t < 1.6 ? -Math.abs(Math.sin(t * 5.4)) * 26 : 0, mouth: "open", head: Math.sin(t * 6) * 4 }),
    slump: (t, p) => ({ ...p, hl: [80, 262], hr: [120, 262], y: 6, head: -10, mouth: "frown", brows: true, look: 1 }),
    point: (t, p) => ({ ...p, hr: [234, 146 + Math.sin(t * 3) * 3], head: 6, mouth: "smile", look: -1 }),
    shrug: (t, p) => ({ ...p, hl: [32, 190 - Math.abs(Math.sin(t * 2)) * 6], hr: [168, 190 - Math.abs(Math.sin(t * 2)) * 6], head: 8 * Math.sin(t * 1.5), mouth: "flat", brows: true }),
  };
  const MOUTH = { smile: "M-7 -23Q0 -18 7 -23", open: "M-7 -24Q0 -12 7 -24Z", flat: "M-6 -22L6 -22", frown: "M-7 -19Q0 -25 7 -19" };
  function poseAt(r, t) {
    const ph = r.i * 1.7;
    let p = idle(t, ph);
    let x = 0;
    if (r.enter) {
      const W = r.offW, dir = r.enter === "right" ? 1 : -1;
      if (t < ENTER) {
        const k = t / ENTER, e = 1 - Math.pow(1 - k, 2);
        x = dir * W * (1 - e);
        const phi = t * Math.PI * 2 * 2.1;
        p = { ...p, lift: [Math.max(0, Math.sin(phi)) * 16, Math.max(0, -Math.sin(phi)) * 16], y: -Math.abs(Math.sin(phi)) * 5, hl: [58 + Math.sin(phi) * 10, 250], hr: [142 + Math.sin(phi) * 10, 250], mouth: "smile" };
        return { p, x };
      }
    }
    const start = r.act0;
    if (t >= start) {
      const act = ACTS[r.do] || ACTS.stand;
      const k = smooth((t - start) / 0.45);
      p = mixP(p, act(t - start, p), k);
    }
    return { p, x };
  }
  function draw(r, t) {
    const { p, x } = poseAt(r, t);
    const [ul, fl] = ik(68, 152, p.hl[0], p.hl[1], -1);
    const [ur, fr] = ik(132, 152, p.hr[0], p.hr[1], 1);
    const set = (el, v) => el && el.setAttribute("transform", v);
    set(r.armL, `rotate(${ul.toFixed(2)})`); set(r.foreL, `rotate(${fl.toFixed(2)})`);
    set(r.armR, `rotate(${ur.toFixed(2)})`); set(r.foreR, `rotate(${fr.toFixed(2)})`);
    set(r.legL, `translate(0 ${(-p.lift[0]).toFixed(2)})`); set(r.shinL, `rotate(${(p.lift[0] * 0.6).toFixed(2)})`);
    set(r.legR, `translate(0 ${(-p.lift[1]).toFixed(2)})`); set(r.shinR, `rotate(${(-p.lift[1] * 0.6).toFixed(2)})`);
    set(r.body, `translate(0 ${p.y.toFixed(2)})`);
    set(r.head, `rotate(${p.head.toFixed(2)})`);
    // blink every few seconds (seeded per person), eyes follow the action
    const bt = (t + r.i * 1.3) % 3.4;
    const blink = bt < 0.12 ? 0.15 : 1;
    if (r.eyes) r.eyes.setAttribute("transform", `translate(${(p.look * 2.5).toFixed(2)} ${(p.look ? 1.5 : 0).toFixed(2)}) translate(0 -38) scale(1 ${blink}) translate(0 38)`);
    if (r.mouth) r.mouth.setAttribute("d", MOUTH[p.mouth] || MOUTH.smile);
    if (r.mouth) r.mouth.classList.toggle("open", p.mouth === "open");
    if (r.brows) r.brows.style.opacity = p.brows ? 1 : 0;
    if (r.phone) r.phone.style.opacity = p.phone ? 1 : 0;
    r.wrap.style.transform = `translateX(${x.toFixed(1)}px)`;
    if (r.shadow) r.shadow.setAttribute("transform", `translate(100 390) scale(${(1 + p.y / 80).toFixed(3)}) translate(-100 -390)`);
  }

  MD.style("story", {
    order: 7,
    name: "Story",
    tagline: "A little film with people in it",
    look: "Flat illustrated people act the story out in simple sets: they walk in, wave, type, check a phone, think, slump and cheer, with speech bubbles and a narrator's line on top. Scenes pan along like a camera moving down the street; the product appears on a screen card. Warm, friendly, human.",
    bestFor: ["a story with a person in it (a customer, a founder, a user)", "before → after told as a moment", "explainers for normal people", "consumer apps", "services, shops and local businesses", "onboarding and how-it-helps films"],
    avoid: "dev tools, data-heavy reports, luxury or hard-edged brands",
    fonts: [
      { name: "Bricolage", display: "Bricolage Grotesque", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 720, "--dwdth": "92%", "--dls": "-0.025em", "--dlh": "1.02", "--tcase": "none" } },
      { name: "Fraunces", display: "Fraunces", displayKind: "serif", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 600, "--dls": "-0.02em", "--dlh": "1.04", "--tcase": "none", "--dvs": '"SOFT" 100, "WONK" 0, "opsz" 144' } },
      { name: "Manrope", display: "Manrope", text: "Manrope", mono: "JetBrains Mono", vars: { "--dw": 800, "--dls": "-0.03em", "--dlh": "1.02", "--tcase": "none" } },
      { name: "Unbounded", display: "Unbounded", text: "DM Sans", mono: "JetBrains Mono", vars: { "--dw": 600, "--dls": "-0.03em", "--dlh": "1.06", "--tcase": "none", "--ts-hook": 10, "--ts-statement": 7.5 } },
    ],
    palettes: [
      { name: "Sunday", bg: "#FFF1E2", ink: "#1E2A3A", accent: "#E8532F", accentInk: "#FFFFFF", accent2: "#5B7FE8", accent3: "#FFC24A", muted: "#6A6F7A", surface: "#F2D9BC", vars: { "--wall2": "#FBE4CB", "--sky": "#BFE2F5", "--leaf": "#3E9C6C", "--leaf2": "#62B588", "--wood": "#C98852", "--pop": "#FFC24A", "--cool": "#5B7FE8", "--floor2": "#E8C9A6", "--hill": "#A8D8A0", "--hill2": "#C6E6B4", "--b1": "#F7D2B0", "--b2": "#F3C29A", "--win": "#FFF8EE" } },
      { name: "Mint", bg: "#EAF6F0", ink: "#14302A", accent: "#F2694A", accentInk: "#FFFFFF", accent2: "#4D78F0", accent3: "#FFCF5A", muted: "#56706A", surface: "#CFE8DA", vars: { "--wall2": "#DDF0E5", "--sky": "#FFF0C7", "--leaf": "#2E8F68", "--leaf2": "#4FB085", "--wood": "#B97D4B", "--pop": "#FFCF5A", "--cool": "#4D78F0", "--floor2": "#BBDCCB", "--hill": "#9ED3B5", "--hill2": "#C2E5CF", "--b1": "#CDE7DA", "--b2": "#B9DECB", "--win": "#FFFDF5" } },
      { name: "Lilac", bg: "#F2EEFF", ink: "#251B3D", accent: "#F2557E", accentInk: "#FFFFFF", accent2: "#5E7BFF", accent3: "#FFC34D", muted: "#6D6487", surface: "#DDD3F8", vars: { "--wall2": "#E6DFFB", "--sky": "#FFE2C4", "--leaf": "#3FA37A", "--leaf2": "#68BE97", "--wood": "#C08F5E", "--pop": "#FFC34D", "--cool": "#5E7BFF", "--floor2": "#CBBFF0", "--hill": "#B6E0C5", "--hill2": "#D2EBD9", "--b1": "#E1D8FA", "--b2": "#D2C6F6", "--win": "#FFFBF2" } },
      { name: "Dusk", bg: "#262A44", ink: "#FFF1E4", accent: "#FF9555", accentInk: "#1D2036", accent2: "#8FB1FF", accent3: "#FFD166", muted: "#B3B3C9", surface: "#34395C", vars: { "--wall2": "#2E3352", "--sky": "#46507E", "--leaf": "#5CB892", "--leaf2": "#7CCBA8", "--wood": "#9A7150", "--pop": "#FFD166", "--cool": "#8FB1FF", "--floor2": "#2E3252", "--hill": "#3E6A64", "--hill2": "#35565A", "--b1": "#33385C", "--b2": "#2C3152", "--win": "#FFD98F" } },
    ],
    T: { title: "maskUp", body: "fadeUp", kicker: "fadeUp", item: "pop", card: "pop", word: "pop", number: "count", numberIn: "pop", media: "pop", callout: "pop", logo: "pop", wordmark: "charRise", cta: "pop", quote: "maskUp", emph: null },
    O: { title: { d: 0.8, st: 0.05 } },
    S: {
      title: null,
      word: { name: "pluck", gain: 0.6 },
      count: { name: "land", gain: 0.7 },
      item: { name: "tap", gain: 0.6 },
      card: { name: "card-place", gain: 0.6 },
      media: { name: "swish", gain: 0.6 },
      callout: { name: "tap", gain: 0.5 },
      logo: { name: "bell", gain: 0.7 },
      cta: { name: "pop", gain: 0.6 },
      quote: null,
      bars: { name: "card-fan", gain: 0.6 },
      strike: { name: "scratch", gain: 0.5 },
      say: { name: "pop", gain: 0.55 },
      cheer: { name: "chime", gain: 0.6 },
      typing: { name: "typing", gain: 0.45 },
      transitions: { push: "whoosh", iris: null, fade: null, cut: null },
    },
    sfxGain: 0.8,
    drift: 0.018,
    grain: 0.04,
    listIcon: "check",
    transitionFor: (s, i, sc) => {
      const prev = sc && sc[i - 1];
      if (s.kind === "story" && prev && prev.kind === "story") return "push";
      if (s.kind === "outro" || s.kind === "logo") return "iris";
      return "fade";
    },
    tone: () => "base",
    // the type-only scenes stand in the same world: the floor and a soft sun behind the words
    sceneDecor: (s) => (s.kind === "story" ? "" : `<div class="sy-bgset" data-layout-ignore>${setSvg("plain")}</div>`),
    scene: {
      // the set drifts the other way to the people: a little depth while the camera pushes in
      run: (tl, el, s) => {
        const life = Math.max(0.5, s.vis1 - s.vis0);
        const set = el.querySelector(".k-story .sy-set");
        if (set) tl.fromTo(set, { xPercent: 0.8 }, { xPercent: -0.8, duration: life, ease: "none" }, s.vis0);
      },
    },
    after: {
      run: (tl, c) => {
        const rigs = [];
        c.P.scenes.forEach((s) => {
          const el = document.getElementById(s.id);
          if (!el) return;
          el.querySelectorAll(".sy-who").forEach((w, i) => {
            const q = (sel) => w.querySelector(sel);
            rigs.push({
              s, i: +w.dataset.i + (rigs.length % 3), wrap: w, do: w.dataset.do, enter: w.dataset.enter || null, act0: +w.dataset.act,
              offW: c.W * 0.62,
              armL: q(".j-armL"), foreL: q(".j-foreL"), armR: q(".j-armR"), foreR: q(".j-foreR"), legL: q(".j-legL"), legR: q(".j-legR"), shinL: q(".j-shinL"), shinR: q(".j-shinR"),
              body: q(".j-body"), head: q(".j-head"), eyes: q(".p-eyes"), mouth: q(".p-mouth"), brows: q(".p-brows"), phone: q(".p-phone"), shadow: q(".p-shadow"),
            });
          });
        });
        if (!rigs.length) return;
        // one tween across the film; its modifier draws every person at that moment (seek-safe:
        // modifiers run whenever the timeline renders, in any order)
        const clock = { t: 0 };
        const drawAll = (T) => { for (const r of rigs) if (T >= r.s.vis0 - 0.05 && T <= r.s.vis1 + 0.05) draw(r, Math.max(0, T - r.s.t0)); };
        drawAll(0);
        tl.fromTo(clock, { t: 0 }, { t: c.P.duration, duration: c.P.duration, ease: "none", modifiers: { t: (v) => { drawAll(+v); return v; } } }, 0);
      },
    },
    kinds: {
      story: {
        fields: ["text", "cast", "set", "say", "media"],
        min: (s) => {
          const b = beats(s);
          const act = { cheer: 1.6, wave: 1.3, laptop: 1.4, phone: 1.3, think: 1.3, slump: 1.3 }[b.cast[0] && b.cast[0].do] || 1.1;
          return Math.max(2.8, b.act + act, 0.45 + MD.count(s.text) * 0.24 + 0.9, b.say != null ? b.say + 0.6 + MD.count(s.say) * 0.26 : 0);
        },
        markup: (s, c) => {
          const b = beats(s);
          const n = b.cast.length || 0;
          const slots = slotsFor(Math.max(1, n), !!s.media, c.fmt);
          const set = SET_NAMES.includes(s.set) ? s.set : "plain";
          const speaker = Math.max(0, b.cast.findIndex((m) => m.say)) || 0;
          const who = b.cast.map((m, i) => {
            const look = lookOf(m.who, c);
            const say = (i === speaker && s.say) ? `<div class="sy-say${m.do === "think" ? " think" : ""}${slots[i] > 60 ? " left" : ""}"><span>${MD.tx(s.say)}</span></div>` : "";
            return `<div class="sy-who" data-i="${i}" data-do="${esc(m.do)}" data-enter="${esc(m.enter || "")}" data-act="${b.act}" style="--x:${slots[i]}">${person(look, i, m.do)}${say}</div>`;
          }).join("");
          const media = s.media ? `<div class="sy-media">${MD.device(s.media, c, { device: s.device || "plain" })}</div>` : "";
          return `<div class="k k-story set-${set}${s.media ? " has-media" : ""} n${n}">${setSvg(set)}<div class="sy-cap"><h2 class="title" data-fit data-maxh="${c.fmt === "portrait" ? 16 : 19}">${MD.tx(s.text || "")}</h2></div><div class="sy-stage">${media}${who}</div></div>`;
        },
        plan: (s, c) => {
          const b = beats(s);
          const e = [];
          if (s.text) e.push(ev(b.cap, ".sy-cap .title", "maskUp", MD.count(s.text), { d: 0.8, st: 0.05 }, null));
          if (s.media) e.push(ev(b.media, ".sy-media", "pop", 1, {}, c.S.media, "start"));
          const lead = b.cast[0];
          if (lead && lead.do === "cheer") e.push(ev(b.act, ".sy-who", "show", 1, {}, c.S.cheer, "start"));
          if (lead && lead.do === "laptop") e.push(ev(b.act + 0.1, ".sy-who", "show", 1, {}, c.S.typing, "start"));
          if (s.say) e.push(ev(b.say, ".sy-say", "pop", 1, {}, c.S.say, "start"));
          return e;
        },
        hero: (s, c, dur) => Math.min(dur - 0.2, beats(s).act + 1.0),
      },
    },
  });
})();
