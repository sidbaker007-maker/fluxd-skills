#!/usr/bin/env node
// core/render/video.js — Parallel headless Chromium frame renderer piped to FFmpeg H.264
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.js';
import { startServer } from './serve.js';
import { openDemoPage } from './page.js';
import { syncVideoSlots } from './slot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const demoDir = args[0] || '.';
let fps = 24;
let size = '1920x1080';
let workers = 3;
let outFile = path.join(demoDir, 'out/video.mp4');
let query = '';
let durOverride = null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--fps') fps = Number(args[++i]);
  else if (args[i] === '--size') size = args[++i];
  else if (args[i] === '--workers') workers = Number(args[++i]);
  else if (args[i] === '--out') outFile = args[++i];
  else if (args[i] === '--q') query = args[++i];
  else if (args[i] === '--duration') durOverride = Number(args[++i]);
}

const tmpFrames = path.join(path.dirname(path.resolve(outFile)), '_frames');
fs.mkdirSync(tmpFrames, { recursive: true });

const { server, url } = await startServer(ROOT);
const browser = await launchBrowser();
try {
  const probe = await openDemoPage(browser, url, ROOT, demoDir, size, query);
  const duration = durOverride || probe.duration;
  await probe.context.close();

  const totalFrames = Math.ceil(duration * fps);
  console.log(`Rendering ${totalFrames} frames (${duration.toFixed(2)}s @ ${fps}fps, ${size}) with ${workers} workers...`);

  const runWorker = async (workerId) => {
    const { context, page } = await openDemoPage(browser, url, ROOT, demoDir, size, query);
    for (let f = workerId; f < totalFrames; f += workers) {
      const t = f / fps;
      await syncVideoSlots(page, t);
      await page.evaluate((timeSec) => window.__seek(timeSec), t);
      const framePath = path.join(tmpFrames, `f_${String(f).padStart(6, '0')}.jpg`);
      await page.screenshot({ path: framePath, type: 'jpeg', quality: 95 });
    }
    await context.close();
  };

  await Promise.all(Array.from({ length: workers }, (_, i) => runWorker(i)));

  spawnSync('ffmpeg', [
    '-y', '-framerate', String(fps),
    '-i', path.join(tmpFrames, 'f_%06d.jpg'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
    '-pix_fmt', 'yuv420p', outFile
  ], { stdio: 'inherit' });
  fs.rmSync(tmpFrames, { recursive: true, force: true });
  console.log(`Rendered video -> ${outFile}`);
} finally {
  await browser.close();
  server.close();
}
