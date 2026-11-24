---
name: motion-designer
description: Makes motion graphics videos from a one-line outline: product launches, app and SaaS promos, announcements, explainers, stat stories, social hooks, teasers, logo stings. It decides the style (Kinetic, Keynote, Aura, Paper, Terminal, Data, Story), format, length, words and its own soundtrack, asks at most one question, then opens a storyboard on localhost that plays the real video with every choice one tap away, and renders after approval in about a minute. Real iPhone, MacBook, Studio Display and iPad frames; grabs screenshots, logo and colours from a URL. Use for "make a motion graphics video", "product video", "launch video", "promo", "animated explainer", "kinetic type", "animate these stats", "app promo from my screenshots", "logo animation", "teaser", or any video made from text, numbers, screenshots or a website rather than camera footage.
---

# Motion Designer

An outline in, a finished motion graphics video out, in about five minutes. The person never sees a
timeline or a keyframe: they describe it, look at a storyboard that already plays, flip anything they
don't like, and approve. Nothing renders before that one approval.

```
outline ─► decide (style · format · length · copy) ─► video.json ─► frames (you check)
       ─► STORYBOARD on localhost (they flip choices, edit words, add notes, Approve) ─► render ─► deliver
                                                                  ▲                               │
                                                                  └──── one-sentence revisions ◄──┘
```

`MD` below stands for `node ~/.claude/skills/motion-designer/scripts/motion.mjs` (or this skill's
`scripts/motion.mjs`). Write the full command each time — a shell variable holding it breaks in zsh.
Needs Node 22+, ffmpeg, and `npx hyperframes` (installs itself; renders HTML → MP4).
One folder per video: `WORK=./<slug>-video` (next to where they are working, or `~/Desktop` if nowhere
better). Inside: `video.json` (the plan), `assets/` (their files), `build/` (the composition), `frames/`,
`renders/vN.mp4` (+ the plan that made it), `<title-slug>.mp4` (the latest, named from `title` — set it
to the product's name), `qa/sheet.jpg`.

## 1. Read the outline and decide — don't interrogate

Nobody wants a questionnaire. Read what they wrote (and what you already know about them, their product,
their brand, the repo you're in) and **make every decision yourself**: purpose, style, format, length,
scenes, the words on screen, fonts, colours, sound. Each one shows up on the storyboard as a switch they
can flip in one tap, so a wrong guess costs them nothing.

Ask **one** short message only when the answer changes the video and you can't find it:
- a product video with no product in sight → "Got screenshots, a screen recording, a logo or a URL? Drop
  them in — or I'll make it all type." (if they have a URL, you `grab` it — never ask for screenshots then)
- you genuinely can't tell what the thing is.

Never ask about style, length, format, fonts, colours or music up front — decide, and let the storyboard
ask. If they named one ("30 seconds", "for TikTok", "use Inter"), it's decided.

Decide with `references/decide.md` (purpose → style, platform → format, purpose → length, copy). In short:

| they want | style | format | length |
|---|---|---|---|
| launch / announcement with attitude, a hook for X | **kinetic** | 16:9 (X, YouTube, site) | 15–25 s |
| app / SaaS / product with screens | **keynote** | 16:9, or 9:16 for socials | 25–40 s |
| AI, fintech, wellness, calm premium | **aura** | 16:9 / 1:1 | 20–35 s |
| consumer app, friendly brand, explainer | **paper** | 9:16 / 1:1 / 16:9 | 20–40 s |
| dev tool, CLI, API, agent | **terminal** | 16:9 | 20–35 s |
| numbers, results, report, "we grew 10×" | **data** | 16:9 / 1:1 | 20–40 s |
| a story with people in it, a customer's moment, an explainer for normal people | **story** | 16:9 | 15–30 s |

TikTok / Reels / Shorts / Stories → 9:16. Instagram / LinkedIn feed → 1:1 or 4:5. `MD styles` prints the
full catalog (looks, fonts, palettes). Pick the style plus **two alternates** that would also fit — the
storyboard shows all three playing so they can compare.

## 2. Gather what's real

```bash
MD new "$WORK" --style keynote --format 16:9
MD grab "$WORK" https://their-site.com     # ~1 min: screenshots, logo, brand colours, the site's own words
```

`grab` writes `assets/site-N.png` (page screenshots, top first), logo candidates (`assets/logo-N.svg`,
`favicon.png`), `assets/site.json` (title, description, colours, fonts) and `assets/site-text.txt` (the
page's own words). Look at every screenshot (crop away cookie banners) and every logo candidate (some are
a "powered by" mark — use the one that is theirs). Read the text: the best copy is usually their own
words, tightened. Also look in their repo: README, App Store metadata and screenshots, brand files.
Their files (screenshots, a screen recording `.mp4/.mov`, a logo) go in `assets/`.

Brand look: one brand colour → `brand.color` (it becomes the accent). A full brand (background, ink,
accent, a display font we bundle) → a `palette` object and/or a `font` object (`references/video-json.md`);
the storyboard shows it as "Your brand" next to the style's presets. Emphasised words are drawn in the
accent on the background, so the accent must be deep enough to read there — compose warns when it isn't.
**Never invent numbers, quotes, customers or features.** No real number → no `stat` scene. No real quote → no `quote`.

## 3. Write the plan

`video.json` — schema and every scene kind in `references/video-json.md`; copy and timing rules in
`references/craft.md`. The words are the video: write them like a great ad, not a feature list.

```json
{
  "title": "Launchr",
  "brief": "their outline, verbatim",
  "purpose": "app launch",
  "style": "keynote", "alternates": ["kinetic", "paper"],
  "format": "16:9", "length": null, "font": 0, "palette": 0,
  "why": { "style": "…one line in their terms…", "format": "…", "length": "…" },
  "brand": { "name": "Launchr", "url": "launchr.app", "color": "#ff5a1f", "logo": "assets/logo-1.svg" },
  "sound": { "sfx": "on", "music": null },
  "scenes": [
    { "kind": "hook", "text": "Your app deserves a *real* launch.", "plan": "The line builds word by word, then holds.", "why": "Stops the scroll in the first second." },
    { "kind": "screen", "title": "Plan it in *minutes*.", "media": "assets/site-1.png", "device": "browser", "url": "launchr.app", "callouts": ["Auto checklist"] },
    { "kind": "stat", "value": "1,240", "label": "apps launched this month" },
    { "kind": "outro", "text": "Launchr", "cta": "Start free", "url": "launchr.app", "media": "assets/logo-1.svg" }
  ]
}
```

- `*word*` = the one emphasised word (the style decides how: colour, italic serif, gradient…). `|` = line break.
- `plan` (what happens, plain words) and `why` (one line) are shown on the storyboard — write them for the
  person. Describe motion and content, not colours: styles pick each scene's tone (paper / ink / accent)
  themselves; set `tone` on a scene only to override it.
- `why.style/format/length` explains your decisions on the storyboard in one line each.
- Screens go on real hardware: `device: "iphone" | "macbook" | "display"` (Studio Display) `| "ipad"`
  (photographed frames, screen measured to the pixel), or `"browser" | "window" | "plain"`. Leave it out
  and a tall screenshot goes on the iPhone, a wide one on the MacBook. App screenshots → iphone; a
  website → macbook (or display for a bigger, calmer shot); an iPad app → ipad.
- Scene lengths come from reading time; `length` fits the whole video to a target. Leave `length: null`
  unless they asked for one.

## 4. Look before you show

```bash
MD frames "$WORK"      # composes, one real frame per scene at its landed moment → frames/sheet.jpg,
                       # then HyperFrames' check (unreadable lines, tiny type, contrast, errors)
```

Open `frames/sheet.jpg` and every `frames/scene-NN.jpg` that looks off. Fix before showing anything: clipped
or tiny text, letters touching, a scene that says too much, a screenshot that reads as mush at that size
(crop it, pick another, or use a phone shot), weak hierarchy, two scenes that look the same, and every ⚠/✗
the command prints ("too fast to read" / `line_unread` → fewer words or a longer `dur`; `text_below_floor`
→ that text is too small: shorten it or drop it). Overlaps while two scenes cross are expected and aren't
reported.

## 5. The storyboard — mandatory, once

```bash
MD board "$WORK" --open        # run in the background; it waits for them
```

Tell them one line: "Your storyboard is open — it plays the real video. Flip anything (style, format,
length, font, colour, sound), edit the words, leave notes, then **Approve and render**."

The page plays the composition live with its sound, shows the picked style next to the two alternates
(playing), every decision as one-tap chips with your `why`, and each scene with its words editable and a
note box. Their edits re-compose instantly; their notes are for you. When the command exits 0 it prints
what they changed and every note. Do every note in `video.json` (or the scene's HTML for `custom`), run
`MD frames` to check, then render straight away — **never show the storyboard twice**. Skip it only if
they say so (`--skip-review`).

## 6. Render, check, deliver

```bash
MD render "$WORK"              # ~30–90 s → renders/vN.mp4, <slug>.mp4, qa/sheet.jpg
```

Open `qa/sheet.jpg` (every scene from the real video). If anything's wrong, fix and render again before
showing. Then `open "$WORK/<slug>.mp4"` (macOS) and tell them in two short lines what it is (style, length,
format) and: "Tell me what to change — one sentence is enough."

Once they're happy, offer **one** line, never a step: "Want a 9:16 / 1:1 version too?" (`MD set "$WORK"
format='"9:16"'` then render — the layout adapts.)

## 7. One-sentence revisions

Map the sentence to the smallest change (`references/revisions.md`), `MD frames` to check, render, show.
No second storyboard.

```bash
MD set "$WORK" style='"aura"'                 # "try it calmer"
MD set "$WORK" length=15                      # "make it 15 seconds"
MD set "$WORK" palette=1                      # "darker"
MD set "$WORK" scenes.2.text='"…"'            # "change the second line"
MD set "$WORK" sound.sfx='"subtle"'           # "less sound"
```

Every render is kept (`renders/v1.mp4`, `v2.mp4`…): "go back to the first one" is a copy.

## Going beyond the kinds

The 14 scene kinds cover most videos. When a moment needs something they can't say, write a `custom`
scene: your own HTML using the style's tokens (`var(--accent)`, `var(--f-display)`, `calc(var(--u) * N)`)
and `events` that run the kit's moves (`references/video-json.md` → custom). Keep it in the style.

## Sound

Every video gets its own soundtrack, composed when it's built (`scripts/lib/audio.mjs`): a music bed in
the style's genre, played on warm instruments in the low and middle register (electric piano, felt
plucks, pads, a round sub, soft drums), never beeps or bells up high. Kinetic = warm house, Keynote =
soft piano pulse, Aura = ambient pads, Paper = muted plucks with brushes, Terminal = a low filtered
arpeggio, Data = lofi, Story = fingerpicked guitar. Every cut lands on the beat (scene lengths snap to
half-beats) and the ending gets one low swell and hit. Effects are soft and low (air moving, a felt tap,
a deep thump), pitched to the music's key, and placed only where they matter: air on transitions that
move across the frame, one accent per headline, the number landing, the logo. Everything is mixed to one
file at −16 LUFS, under −1 dBTP: full, never shouty, never clipped. All synthesized: no licences, free
to post.

- `sound.music`: `"auto"` (default, composed), `"none"`, or their own track (`"assets/track.mp3"`;
  `musicStart` skips an intro, `musicVolume` 0–1). With their own track, set `sound.bpm` if they know it
  so cuts snap to it.
- `sound.sfx`: `"on"` (default) | `"subtle"` (transitions and the ending only) | `"off"` (music only).
- `sound.preset`: borrow another style's music (`"aura"` under a Keynote video, say).
- `frames` and `render` print the soundtrack's loudness; anything outside −17…−15 LUFS is a bug.

## When something goes wrong

| symptom | fix |
|---|---|
| "too fast to read" | cut words, drop a scene, or raise `length` |
| a scene's text looks tiny | too many words for the kind — split into two scenes |
| "missing file" | path is relative to `$WORK`; placeholders show until it exists |
| screenshot reads as mush | crop to the part that matters, or a phone/zoomed shot; `move: "still"` stops the scroll |
| render fails | `npx hyperframes check "$WORK/build"` |
| board won't open | it printed the URL — open it yourself; port in use → `--port 4811` |
