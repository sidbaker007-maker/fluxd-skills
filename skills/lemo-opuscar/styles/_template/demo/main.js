import { fitCanvas, seg, out3, inOut3, rgba, vignette, grain } from '/core/lib.js';

window.__DURATION = 18.0;
window.__EVENTS = [
  { t: 0.2, kind: 'whoosh', gain: 0.35 },
  { t: 0.6, kind: 'thump', gain: 0.5 },
  { t: 6.0, kind: 'click', gain: 0.4 },
  { t: 12.0, kind: 'ding', gain: 0.45 }
];

const canvas = document.getElementById('canvas');
const ctx = fitCanvas(canvas, 1920, 1080);

export function renderAt(t) {
  ctx.fillStyle = '#0d1017';
  ctx.fillRect(0, 0, 1920, 1080);

  const pIntro = seg(t, 0.2, 1.4, out3);
  ctx.save();
  ctx.fillStyle = rgba('#f2eee6', pIntro);
  ctx.font = '700 64px Inter, system-ui, sans-serif';
  ctx.fillText('LEMO-OPUSCAR FILM ENGINE', 140, 220 - (1 - pIntro) * 30);
  ctx.restore();

  vignette(ctx, 1920, 1080, 0.45);
  grain(ctx, 1920, 1080, t, 0.03);
}

window.__seek = (t) => renderAt(Number(t));
window.__READY = true;
renderAt(0);
