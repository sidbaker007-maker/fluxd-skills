// core/lib.js — Pure math, easing, deterministic PRNG, colour, Canvas 2D & WebGL helpers for lemo-opuscar
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (a === b ? 0 : clamp((v - a) / (b - a), 0, 1));
export const remap = (x, a0, a1, b0, b1) => lerp(b0, b1, invLerp(a0, a1, x));
export const smooth = (t) => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };

// Easing curves
export const out3 = (t) => { const u = 1 - clamp(t, 0, 1); return 1 - u * u * u; };
export const out4 = (t) => { const u = 1 - clamp(t, 0, 1); return 1 - u * u * u * u; };
export const out5 = (t) => { const u = 1 - clamp(t, 0, 1); return 1 - u * u * u * u * u; };
export const in3 = (t) => { const u = clamp(t, 0, 1); return u * u * u; };
export const inOut3 = (t) => {
  const u = clamp(t, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
};
export const spring = (t, zeta = 0.25, omega = 12) => {
  const u = clamp(t, 0, 1);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.exp(-zeta * omega * u) * Math.cos(omega * Math.sqrt(1 - zeta * zeta) * u);
};
export const over = (t, s = 1.70158) => {
  const u = clamp(t, 0, 1) - 1;
  return 1 + u * u * ((s + 1) * u + s);
};

// Timeline progress helper: seg(t, t0, t1, easeFn)
export const seg = (t, t0, t1, ease = (x) => x) => {
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  return ease((t - t0) / Math.max(1e-6, t1 - t0));
};

// Envelope helper: env(t, tIn, tHold, tOut, dur, easeIn, easeOut)
export const env = (t, t0, fadeIn, fadeOut, t1, easeIn = out3, easeOut = in3) => {
  if (t <= t0 || t >= t1) return 0;
  if (t < t0 + fadeIn) return easeIn((t - t0) / Math.max(1e-6, fadeIn));
  if (t > t1 - fadeOut) return 1 - easeOut((t - (t1 - fadeOut)) / Math.max(1e-6, fadeOut));
  return 1;
};

// Mulberry32 deterministic PRNG & 1D/2D Value Noise
export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const hash = (n) => {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
export const noise1D = (x) => {
  const i = Math.floor(x), f = x - i;
  return lerp(hash(i), hash(i + 1), smooth(f));
};
export const hash2 = (x, y) => {
  const d = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return d - Math.floor(d);
};
export const noise2D = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
};

// Colour utilities
export const hexToRgb = (hex) => {
  const s = hex.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (hex, alpha = 1) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
};

// Canvas 2D layout & drawing helpers
export const fitCanvas = (canvas, w = 1920, h = 1080) => {
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return canvas.getContext('2d');
};
export const roundRect = (ctx, x, y, w, h, r = 8) => {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
};
export const cover = (ctx, img, x, y, w, h, zoom = 1, panX = 0, panY = 0) => {
  if (!img || !img.width || !img.height) return;
  const ir = img.width / img.height;
  const br = w / h;
  let dw = w, dh = h;
  if (ir > br) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  dw *= zoom; dh *= zoom;
  const dx = x + (w - dw) * 0.5 + panX * w;
  const dy = y + (h - dh) * 0.5 + panY * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
};
export const vignette = (ctx, w, h, strength = 0.45, color = '#000000') => {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.25, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(1, rgba(color, strength));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
};
export const grain = (ctx, w, h, t, alpha = 0.04) => {
  const rng = mulberry32(Math.floor(t * 24) + 1337);
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let i = 0; i < 320; i++) {
    const gx = rng() * w, gy = rng() * h, sz = 1 + rng() * 1.5;
    ctx.fillRect(gx, gy, sz, sz);
  }
  ctx.restore();
};
export const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = String(text).split(/\s+/);
  let line = '';
  let cy = y;
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line ? line + ' ' + words[n] : words[n];
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push({ text: line, x, y: cy });
      line = words[n];
      cy += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push({ text: line, x, y: cy });
  for (const l of lines) ctx.fillText(l.text, l.x, l.y);
  return lines;
};
