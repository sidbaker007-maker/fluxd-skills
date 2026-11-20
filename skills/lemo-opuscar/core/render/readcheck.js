#!/usr/bin/env node
// core/render/readcheck.js — Audits on-screen DOM text reading speed (CJK / 4.5 + Latin / 15 + 1.5s)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.js';
import { startServer } from './serve.js';
import { openDemoPage } from './page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const demoDir = args[0] || '.';
let step = 0.1;
let latinCps = 15;
let cjkCps = 4.5;
let pad = 1.5;
let minHold = 1.5;
let size = '1920x1080';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--step') step = Number(args[++i]);
  else if (args[i] === '--latin-cps') latinCps = Number(args[++i]);
  else if (args[i] === '--cjk-cps') cjkCps = Number(args[++i]);
  else if (args[i] === '--pad') pad = Number(args[++i]);
  else if (args[i] === '--min') minHold = Number(args[++i]);
}

const { server, url } = await startServer(ROOT);
const browser = await launchBrowser();
try {
  const { page, duration } = await openDemoPage(browser, url, ROOT, demoDir, size);
  const seen = new Map();
  for (let t = 0; t <= duration; t += step) {
    await page.evaluate((timeSec) => window.__seek(timeSec), t);
    const texts = await page.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const txt = node.nodeValue.trim();
        if (!txt || txt.length < 18) continue;
        const el = node.parentElement;
        if (!el) continue;
        const st = window.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.2) continue;
        out.push(txt);
      }
      return out;
    });
    for (const txt of texts) {
      if (!seen.has(txt)) seen.set(txt, { t0: t, t1: t });
      else seen.get(txt).t1 = t;
    }
  }
  let warnings = 0;
  for (const [txt, span] of seen.entries()) {
    const hold = span.t1 - span.t0 + step;
    const cjk = (txt.match(/[\u4e00-\u9fff]/g) || []).length;
    const latin = txt.length - cjk;
    const budget = Math.max(minHold, cjk / cjkCps + latin / latinCps + pad);
    if (hold + 0.15 < budget) {
      warnings++;
      console.log(`[READCHECK WARN] (${span.t0.toFixed(1)}s-${span.t1.toFixed(1)}s, held ${hold.toFixed(2)}s < budget ${budget.toFixed(2)}s): "${txt.slice(0, 64)}"`);
    }
  }
  console.log(`Readcheck complete: ${seen.size} text cards checked, ${warnings} warnings.`);
} finally {
  await browser.close();
  server.close();
}
