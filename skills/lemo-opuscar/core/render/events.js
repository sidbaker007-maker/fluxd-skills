#!/usr/bin/env node
// core/render/events.js — Extracts window.__EVENTS from a demo into events.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.js';
import { startServer } from './serve.js';
import { openDemoPage } from './page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const demoDir = args[0] || '.';
let outFile = path.join(demoDir, 'events.json');
let size = '1920x1080';
let query = '';
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--out') outFile = args[++i];
  else if (args[i] === '--size') size = args[++i];
  else if (args[i] === '--q') query = args[++i];
}

const { server, url } = await startServer(ROOT);
const browser = await launchBrowser();
try {
  const { page } = await openDemoPage(browser, url, ROOT, demoDir, size, query);
  const events = await page.evaluate(() => window.__EVENTS || []);
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(events, null, 2));
  console.log(`Extracted ${events.length} events -> ${outFile}`);
} finally {
  await browser.close();
  server.close();
}
