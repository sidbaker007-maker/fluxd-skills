// headless: zero-dependency offline Chromium CDP renderer & QA checker for Gemini VM (replaces npx hyperframes)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4v": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
};

export function findChromium() {
  if (process.env.CHROMIUM_BIN && fs.existsSync(process.env.CHROMIUM_BIN)) return process.env.CHROMIUM_BIN;
  for (const bin of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    const r = spawnSync("which", [bin], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(mac)) return mac;
  return null;
}

// Serves a build directory over loopback HTTP. Uses 127.0.0.2 on Linux to avoid managed Chrome policies that block 127.0.0.1 and file://.
export async function withStaticServer(rootDir, fn) {
  const host = process.platform === "linux" ? "127.0.0.2" : "127.0.0.1";
  const resolvedRoot = path.resolve(rootDir);
  const srv = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, `http://${host}`);
      let rel = decodeURIComponent(u.pathname).replace(/^\/+/, "");
      if (!rel) rel = "index.html";
      const file = path.resolve(resolvedRoot, rel);
      if (!file.startsWith(resolvedRoot + path.sep) && file !== resolvedRoot) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(file).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const stat = fs.statSync(file);
      res.writeHead(200, {
        "content-type": type,
        "content-length": stat.size,
        "cache-control": "no-store",
      });
      fs.createReadStream(file).pipe(res);
    } catch (e) {
      res.writeHead(500);
      res.end(String(e.message || e));
    }
  });
  await new Promise((r) => srv.listen(0, host, r));
  const baseUrl = `http://${host}:${srv.address().port}`;
  try {
    return await fn(baseUrl);
  } finally {
    try { srv.close(); } catch {}
  }
}

export async function withBrowser(fn, { width = 1920, height = 1080 } = {}) {
  const bin = findChromium();
  if (!bin) throw new Error("Chromium is not installed (needed to render HTML compositions to frames/MP4).");
  const proc = spawn(bin, [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--mute-audio",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--remote-debugging-pipe",
    `--window-size=${width},${height}`,
  ], { stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] });

  const pipeWrite = proc.stdio[3];
  const pipeRead = proc.stdio[4];
  let buf = "";
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();

  pipeRead.on("data", (chunk) => {
    buf += chunk.toString("utf8");
    let idx;
    while ((idx = buf.indexOf("\0")) !== -1) {
      const raw = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (!raw) continue;
      let msg;
      try { msg = JSON.parse(raw); } catch { continue; }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        const cbs = listeners.get(msg.method);
        if (cbs) for (const cb of cbs) cb(msg.params, msg.sessionId);
      }
    }
  });

  function send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      pipeWrite.write(JSON.stringify(payload) + "\0");
    });
  }

  function on(method, cb) {
    if (!listeners.has(method)) listeners.set(method, []);
    listeners.get(method).push(cb);
  }

  async function openComposition(pageUrl, W, H) {
    const { targetId } = await send("Target.createTarget", { url: pageUrl });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const errors = [];
    on("Runtime.exceptionThrown", (p, sid) => {
      if (sid === sessionId && p && p.exceptionDetails) {
        errors.push(p.exceptionDetails.text || (p.exceptionDetails.exception && p.exceptionDetails.exception.description) || "runtime exception");
      }
    });
    await send("Page.enable", {}, sessionId);
    await send("Runtime.enable", {}, sessionId);
    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);

    let ready = false;
    for (let i = 0; i < 80; i++) {
      const res = await send("Runtime.evaluate", {
        expression: "Boolean(window.MDP && window.MDP.ready)",
        returnByValue: true,
      }, sessionId).catch(() => ({}));
      if (res && res.result && res.result.value === true) { ready = true; break; }
      await new Promise((r) => setTimeout(r, 75));
    }
    if (!ready) {
      throw new Error("Composition failed to initialize in headless Chromium.");
    }
    return { sessionId, targetId, errors };
  }

  async function seekTo(sessionId, t) {
    await send("Runtime.evaluate", {
      expression: `(async () => {
        if (!window.MDP) return false;
        window.MDP.seek(${Number(t).toFixed(4)});
        const vids = Array.from(document.querySelectorAll("video[data-start]")).filter(v => v.style.visibility !== "hidden" && v.seeking);
        if (vids.length) {
          await Promise.race([
            Promise.all(vids.map(v => new Promise(r => v.addEventListener("seeked", r, { once: true })))),
            new Promise(r => setTimeout(r, 150))
          ]);
        }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return true;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
  }

  try {
    return await fn({ send, on, openComposition, seekTo });
  } finally {
    try { proc.kill("SIGKILL"); } catch {}
  }
}

export async function snapshotAndCheck(report, buildDir, snapDir, runCheck = true) {
  fs.mkdirSync(snapDir, { recursive: true });
  const W = report.W || 1920;
  const H = report.H || 1080;

  return await withStaticServer(buildDir, async (baseUrl) => {
    const pageUrl = `${baseUrl}/index.html?sb=1`;
    return await withBrowser(async ({ send, openComposition, seekTo }) => {
      const { sessionId, errors } = await openComposition(pageUrl, W, H);
      const pngs = [];
      const findings = [];

      for (const err of errors) {
        findings.push({ severity: "error", code: "runtime_error", message: String(err) });
      }

      for (let i = 0; i < report.scenes.length; i++) {
        const s = report.scenes[i];
        await seekTo(sessionId, s.hero);
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
        }, sessionId);
        const dst = path.join(snapDir, `frame-${String(i).padStart(3, "0")}.png`);
        fs.writeFileSync(dst, Buffer.from(shot.data, "base64"));
        pngs.push(dst);

        if (runCheck) {
          const qaRes = await send("Runtime.evaluate", {
            expression: `(() => {
              const out = [];
              const sec = document.getElementById(${JSON.stringify(s.id)});
              if (!sec) return out;
              if (window.MD && window.MD.typeQA) {
                for (const x of window.MD.typeQA(sec)) {
                  out.push({
                    severity: "warning",
                    code: x.type === "clipped" ? "text_clip" : x.type,
                    message: x.type === "clipped" ? ("clipped by " + x.by + " on " + x.side + " (" + x.px + "px)") : (x.type + " (" + x.px + "px)"),
                    text: x.text || ""
                  });
                }
              }
              const TEXT = ".title, .sub, .label, .kicker, .it, .cta, .url, .by, .ct, .cx, .bv, .bl, .call";
              for (const el of sec.querySelectorAll(TEXT)) {
                const st = getComputedStyle(el);
                if (st.visibility === "hidden" || parseFloat(st.opacity) < 0.1) continue;
                const fs = parseFloat(st.fontSize) || 0;
                const txt = (el.textContent || "").trim();
                if (!txt) continue;
                if (fs > 0 && fs < 12) {
                  out.push({ severity: "warning", code: "text_below_floor", message: "font size " + fs.toFixed(1) + "px is below 12px floor", text: txt });
                }
                const r = el.getBoundingClientRect();
                if (r.width > 2 && r.height > 2) {
                  if (r.left < -8 || r.top < -8 || r.right > ${W} + 8 || r.bottom > ${H} + 8) {
                    out.push({ severity: "warning", code: "offscreen", message: "element bleeds off frame", text: txt });
                  }
                }
              }
              return out;
            })()`,
            returnByValue: true,
          }, sessionId);
          const list = (qaRes && qaRes.result && qaRes.result.value) || [];
          for (const item of list) {
            findings.push({ ...item, time: s.hero, sceneIdx: i });
          }
        }
      }

      return { pngs, findings };
    }, { width: W, height: H });
  });
}

export async function renderComposition(report, buildDir, outFile, { draft = false, fps = draft ? 24 : 30 } = {}) {
  const W = report.W || 1920;
  const H = report.H || 1080;
  const totalFrames = Math.max(1, Math.round(report.duration * fps));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-render-frames-"));
  const numWorkers = Math.min(4, Math.max(1, os.cpus().length), totalFrames);

  try {
    await withStaticServer(buildDir, async (baseUrl) => {
      const pageUrl = `${baseUrl}/index.html?sb=1`;
      const chunks = Array.from({ length: numWorkers }, (_, w) => {
        const start = Math.floor((w * totalFrames) / numWorkers);
        const end = Math.floor(((w + 1) * totalFrames) / numWorkers);
        return { start, end };
      });

      await Promise.all(chunks.map(({ start, end }) =>
        withBrowser(async ({ send, openComposition, seekTo }) => {
          const { sessionId } = await openComposition(pageUrl, W, H);
          for (let f = start; f < end; f++) {
            const t = Math.min(report.duration - 0.001, f / fps);
            await seekTo(sessionId, t);
            const shot = await send("Page.captureScreenshot", {
              format: "jpeg",
              quality: draft ? 82 : 94,
              clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
            }, sessionId);
            const dst = path.join(tmpDir, `frame-${String(f).padStart(5, "0")}.jpg`);
            fs.writeFileSync(dst, Buffer.from(shot.data, "base64"));
          }
        }, { width: W, height: H })
      ));
    });

    const ff = spawnSync("ffmpeg", [
      "-v", "error", "-y",
      "-framerate", String(fps),
      "-i", path.join(tmpDir, "frame-%05d.jpg"),
      "-c:v", "libx264",
      "-preset", draft ? "ultrafast" : "fast",
      "-crf", draft ? "23" : "18",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      outFile,
    ], { encoding: "utf8" });

    if (ff.status !== 0 || !fs.existsSync(outFile)) {
      throw new Error(`ffmpeg video encode failed: ${ff.stderr || ff.stdout}`);
    }
    return { ok: true, frames: totalFrames, fps };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export async function captureWebsite(url, capDir, maxShots = 8) {
  const shotsDir = path.join(capDir, "screenshots");
  const svgsDir = path.join(capDir, "assets/svgs");
  const extDir = path.join(capDir, "extracted");
  fs.mkdirSync(shotsDir, { recursive: true });
  fs.mkdirSync(svgsDir, { recursive: true });
  fs.mkdirSync(extDir, { recursive: true });

  try {
    return await withBrowser(async ({ send }) => {
      const { targetId } = await send("Target.createTarget", { url: "chrome://newtab" });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      await send("Page.enable", {}, sessionId);
      await send("Runtime.enable", {}, sessionId);
      await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);

      const nav = await send("Page.navigate", { url }, sessionId);
      if (nav.errorText) {
        return { ok: false, offline: true, error: nav.errorText };
      }
      await new Promise((r) => setTimeout(r, 1500));

      const metaRes = await send("Runtime.evaluate", {
        expression: `(() => {
          if (location.href.startsWith("chrome-error://")) return { blocked: true };
          const title = document.title || "";
          const descEl = document.querySelector('meta[name="description"], meta[property="og:description"]');
          const description = descEl ? descEl.getAttribute("content") || "" : "";
          const text = (document.body ? document.body.innerText : "").trim();
          const svgs = Array.from(document.querySelectorAll("header svg, nav svg, a svg, svg")).slice(0, 6).map(s => s.outerHTML);
          const colors = new Set();
          const fonts = new Set();
          for (const el of Array.from(document.querySelectorAll("body, header, main, h1, h2, button, a")).slice(0, 40)) {
            const st = getComputedStyle(el);
            for (const c of [st.color, st.backgroundColor]) {
              const m = c && c.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
              if (m) {
                const hex = "#" + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, "0")).join("");
                colors.add(hex);
              }
            }
            if (st.fontFamily) fonts.add(st.fontFamily.split(",")[0].replace(/['"]/g, "").trim());
          }
          return { title, description, text, svgs, colors: [...colors], fonts: [...fonts], scrollHeight: document.documentElement.scrollHeight || 900 };
        })()`,
        returnByValue: true,
      }, sessionId);

      const info = (metaRes && metaRes.result && metaRes.result.value) || {};
      if (info.blocked || (!info.title && !info.text)) {
        return { ok: false, offline: true, error: "Outbound internet access is disabled in the VM sandbox." };
      }

      const totalH = Math.min(info.scrollHeight || 900, maxShots * 900);
      const count = Math.max(1, Math.min(maxShots, Math.ceil(totalH / 900)));
      for (let i = 0; i < count; i++) {
        await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${i * 850}); true`, returnByValue: true }, sessionId);
        await new Promise((r) => setTimeout(r, 200));
        const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
        fs.writeFileSync(path.join(shotsDir, `scroll-${i}.png`), Buffer.from(shot.data, "base64"));
      }
      (info.svgs || []).forEach((svg, i) => {
        fs.writeFileSync(path.join(svgsDir, `logo-${i + 1}.svg`), svg);
      });
      const cssVars = Object.fromEntries((info.colors || []).map((c, i) => [`--c${i}`, c]));
      fs.writeFileSync(path.join(extDir, "tokens.json"), JSON.stringify({ title: info.title, description: info.description, cssVariables: cssVars }, null, 2));
      fs.writeFileSync(path.join(extDir, "fonts-manifest.json"), JSON.stringify((info.fonts || []).map((f) => ({ family: f })), null, 2));
      fs.writeFileSync(path.join(extDir, "visible-text.txt"), info.text || "");
      return { ok: true };
    }, { width: 1440, height: 900 });
  } catch (e) {
    return { ok: false, offline: true, error: e.message };
  }
}
