// core/render/slot.js — Deterministic <video data-slot> frame stepping via separate hidden tabs
export async function syncVideoSlots(page, t) {
  await page.evaluate(async (timeSec) => {
    const vids = Array.from(document.querySelectorAll('video[data-slot]'));
    await Promise.all(vids.map((v) => new Promise((resolve) => {
      const start = Number(v.dataset.start || 0);
      const trim = Number(v.dataset.trim || 0);
      const rate = Number(v.dataset.rate || 1);
      const target = Math.max(0, trim + (timeSec - start) * rate);
      if (Math.abs((v.currentTime || 0) - target) < 0.01) return resolve();
      const onSeeked = () => { v.removeEventListener('seeked', onSeeked); resolve(); };
      v.addEventListener('seeked', onSeeked);
      v.currentTime = target;
    })));
  }, t);
}
