import { fitCanvas, seg, out3, inOut3, rgba, roundRect, vignette, grain } from '/core/lib.js';

window.__DURATION = 18.0;
window.__EVENTS = [
  { t: 0.15, kind: 'whoosh', gain: 0.35 },
  { t: 0.55, kind: 'thump', gain: 0.50 },
  { t: 1.20, kind: 'click', gain: 0.40 },
  { t: 6.00, kind: 'shutter', gain: 0.45 },
  { t: 12.00, kind: 'ding', gain: 0.40 }
];

const canvas = document.getElementById('canvas');
const ctx = fitCanvas(canvas, 1920, 1080);

export function renderAt(t) {
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, 1920, 1080);

  // Subtle forensic grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1920; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke(); }
  for (let y = 0; y < 1080; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke(); }

  // Top-left source attribution badge
  const pBadge = seg(t, 0.2, 0.9, out3);
  ctx.save();
  ctx.globalAlpha = pBadge;
  roundRect(ctx, 84, 64, 460, 44, 6);
  ctx.fillStyle = 'rgba(18, 22, 31, 0.92)';
  ctx.fill();
  ctx.strokeStyle = '#e03e2d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#d8dee9';
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillText('SOURCE: NATIONAL ARCHIVES / PUBLIC RECORD', 104, 92);
  ctx.restore();

  // Evidence frame + red callout box
  const pCard = seg(t, 0.5, 1.8, inOut3);
  ctx.save();
  ctx.globalAlpha = pCard;
  roundRect(ctx, 84, 150, 1752, 680, 10);
  ctx.fillStyle = '#131822';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.stroke();

  ctx.fillStyle = '#f2eee6';
  ctx.font = '700 54px Inter, system-ui, sans-serif';
  ctx.fillText('VISUAL INVESTIGATION // FORENSIC TIMELINE', 140, 270);

  ctx.fillStyle = '#e03e2d';
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillText(`TIMECODE // 00:00:${t.toFixed(2).padStart(5, '0')}`, 140, 340);
  ctx.restore();

  vignette(ctx, 1920, 1080, 0.48);
  grain(ctx, 1920, 1080, t, 0.035);
}

window.__seek = (t) => renderAt(Number(t));
window.__READY = true;
renderAt(0);
