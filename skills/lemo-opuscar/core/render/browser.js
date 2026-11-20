// core/render/browser.js — Headless Chromium launcher via playwright-core
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
].filter(Boolean);

export async function launchBrowser(opts = {}) {
  let executablePath = CANDIDATES.find((p) => fs.existsSync(p));
  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-vsync', '--font-render-hinting=none', '--hide-scrollbars']
  };
  if (executablePath) launchOpts.executablePath = executablePath;
  return chromium.launch({ ...launchOpts, ...opts });
}
