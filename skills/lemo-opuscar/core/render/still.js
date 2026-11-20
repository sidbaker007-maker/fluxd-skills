#!/usr/bin/env node
// core/render/still.js — Captures style frames at specified timestamps t1, t2, ...
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.js';
import { startServer } from './serve.js';
import { openDemoPage } from './page.js';
import { syncVideoSlots } from './slot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const demoDir = args[0];
const times = [];
let outDir = path.join(demoDir, 'out/stills');
let prefix = 'frame_';
let size = '1920x1080';
let query = '';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--out') outDir = args[++i];
  else if (args[i] === '--prefix') prefix = args[++i];
  else if (args[i] === '--size') size = args[++i];
  else if (args[i] === '--q') query = args[++i];
  else if (!args[i].startsWith('--')) times.push(Number(args[i]));
}

fs.mkdirSync(outDir, { recursive: true });
const { server, url } = await startServer(ROOT);
const browser = await launchBrowser();
try {
  const { page } = await openDemoPage(browser, url, ROOT, demoDir, size, query);
  for (const t of times) {
    await syncVideoSlots(page, t);
    await page.evaluate((timeSec) => window.__seek(timeSec), t);
    const fname = `${prefix}${t.toFixed(2).replace('.', '_')}s.jpg`;
    const fpath = path.join(outDir, fname);
    await page.screenshot({ path: fpath, type: 'jpeg', quality: 92 });
    console.log(`Saved still @ ${t.toFixed(2)}s -> ${fpath}`);
  }
} finally {
  await browser.close();
  server.close();
}
