// core/render/page.js — Opens a demo page in headless Chromium, waits for fonts & window.__READY
import path from 'node:path';

export async function openDemoPage(browser, baseUrl, rootDir, demoDir, size = '1920x1080', query = '') {
  const [width, height] = size.split('x').map(Number);
  const rel = path.relative(rootDir, path.resolve(demoDir)).replace(/\\/g, '/');
  const q = query ? `?${query.replace(/^\?/, '')}` : '';
  const url = `${baseUrl}/${rel}/index.html${q}`;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.waitForFunction(() => window.__READY === true || typeof window.__seek === 'function', { timeout: 30000 });
  const duration = await page.evaluate(() => Number(window.__DURATION || 15));
  return { context, page, duration, width, height };
}
