---
name: motion-designer
description: Makes motion graphics videos from a one-line outline including product launches, app and SaaS promos, announcements, explainers, stat stories, social hooks, teasers, and logo stings. Decides the style (Kinetic, Keynote, Aura, Paper, Terminal, Data, Story), format, length, words, and synthesized soundtrack, shows an interactive storyboard in Canvas that plays the real video with every choice one tap away, and renders a finished MP4 with audio. Supports real iPhone, MacBook, Studio Display, and iPad frames. Use when the user asks for a "motion graphics video", "product video", "launch video", "promo video", "animated explainer", "kinetic typography", "animate these stats", "app promo from screenshots", "logo animation", "teaser", or any video made from text, numbers, screenshots, or a website.
---

# Motion Designer

Turn a one-line outline into a finished motion graphics MP4 video with a custom synthesized soundtrack and an interactive Canvas storyboard.

```
outline -> decide (style, format, length, copy) -> video.json -> frames (visual QA check)
        -> interactive STORYBOARD in Canvas (google:show_file) -> render -> deliver MP4 (google:show_file)
```

## When to Use

- The user wants a motion graphics video, product launch video, SaaS or app promo, animated explainer, stat story, social hook, teaser, or logo sting.
- The user wants to animate headlines, metrics, feature callouts, device screenshots (iPhone, MacBook, iPad, Studio Display), or website content into an MP4 video.
- The user wants to preview and tweak an animated video storyboard in Canvas before rendering the final MP4.

## Locating the CLI in Gemini

In the commands below, `MD` refers to `node /working_dir/memory/default/motion-designer/scripts/motion.js` if that path exists on disk, or `node skills/motion-designer/scripts/motion.js` in your current workspace directory.

1. Check if `/working_dir/memory/default/motion-designer/scripts/motion.js` exists via `execute_bash`.
2. If it does not exist yet, call `get_skill_resources` for `motion-designer` to materialize the files under `skills/motion-designer/`.
3. Always write the full `node .../scripts/motion.js` command in `execute_bash` rather than relying on shell variables across turns.
4. Keep each video project in its own working folder, such as `WORK=/working_dir/<conversation_id>/artifacts/file_generation/ttl=63d/intermediate/<slug>-video`. Inside `$WORK`: `video.json` (the plan), `assets/` (user screenshots, recordings, logos), `build/` (the HTML/GSAP/WAV composition), `frames/` (QA preview frames and contact sheet), `storyboard.html`, `renders/vN.mp4`, `<title-slug>.mp4`, and `qa/sheet.jpg`.
5. Final deliverables (`<slug>-storyboard.html` and `<slug>.mp4`) are automatically copied to `artifacts/file_generation/ttl=63d/output/` so you can present them with `google:show_file`.

## Steps

### 1. Read the outline and decide (do not interrogate)

Read what the user wrote (and any attached files, URLs, or context) and make every creative decision yourself: purpose, style, format, length, scenes, on-screen words, fonts, colours, and sound. Every decision appears on the interactive Canvas storyboard as a one-tap switch, so a bold choice costs the user nothing.

Ask at most one short question only when the answer materially changes the video and you cannot find it:

- A product video with no product details or visuals in sight: ask if they have screenshots, a screen recording, a logo, or a URL to share, or offer to make an all-typography video.
- You genuinely cannot tell what the product or topic is.

Never ask upfront questionnaires about style, length, format, fonts, colours, or music. Decide, and let the storyboard offer the switches. If the user explicitly named a preference ("30 seconds", "for TikTok", "use Inter"), honor it.

Read `references/decide.md` (via `get_skill_resources` or from the skill folder) for the decision tables:

| User goal | Style | Format | Length |
|---|---|---|---|
| Launch or announcement with attitude, social hook | **kinetic** | 16:9 (X, YouTube, web) | 15 to 25 s |
| App, SaaS, or product with screens | **keynote** | 16:9, or 9:16 for socials | 25 to 40 s |
| AI, fintech, wellness, calm premium | **aura** | 16:9 or 1:1 | 20 to 35 s |
| Consumer app, friendly brand, explainer | **paper** | 9:16, 1:1, or 16:9 | 20 to 40 s |
| Dev tool, CLI, API, AI agent | **terminal** | 16:9 | 20 to 35 s |
| Numbers, results, report, growth metrics | **data** | 16:9 or 1:1 | 20 to 40 s |
| Illustrated character story, customer moment, simple explainer | **story** | 16:9 | 15 to 30 s |

Use `9:16` for TikTok, Reels, Shorts, and Stories. Use `1:1` or `4:5` for Instagram and LinkedIn feeds. Run `MD styles` to print the full catalog of looks, fonts, and palettes. Pick the best style plus **two alternates** that also fit so the storyboard lets the user compare all three live.

### 2. Gather real assets and facts

Initialize the project folder:

```bash
MD new "$WORK" --style keynote --format 16:9
```

- **User-uploaded files**: Copy any user-uploaded screenshots, screen recordings (`.mp4`, `.mov`), or logos from `user_uploaded_files/` into `$WORK/assets/`.
- **Websites and URLs**: Because the VM sandbox has no direct outbound internet access, when the user provides a URL, use `google:browse` or `google:search` to extract the site's exact title, value proposition, real numbers, and brand colours. Save extracted text or notes if helpful, and never invent numbers, quotes, customers, or features. If there is no real number, do not add a `stat` scene. If there is no real quote, do not add a `quote` scene.
- **Brand look**: Set `brand.color` to their primary hex colour (it becomes the accent). For a full custom brand palette or font pairing, see `references/video-json.md`. Emphasised words (`*word*`) render in the accent colour over the background, so ensure strong contrast (compose warns when contrast is too low).

### 3. Write the plan (`video.json`)

Consult `references/video-json.md` for the full schema and all 14+ scene kinds, and `references/craft.md` for copywriting and pacing rules. Write tight, concrete ad copy rather than generic feature lists:

```json
{
  "title": "Launchr",
  "brief": "their outline, verbatim",
  "purpose": "app launch",
  "style": "keynote",
  "alternates": ["kinetic", "paper"],
  "format": "16:9",
  "length": null,
  "font": 0,
  "palette": 0,
  "why": {
    "style": "One line explaining why this style fits their product.",
    "format": "One line explaining the aspect ratio choice.",
    "length": "One line explaining the pacing."
  },
  "brand": { "name": "Launchr", "url": "launchr.app", "color": "#ff5a1f", "logo": "assets/logo-1.svg" },
  "sound": { "sfx": "on", "music": "auto" },
  "scenes": [
    { "kind": "hook", "text": "Your app deserves a *real* launch.", "plan": "The line builds word by word, then holds.", "why": "Stops the scroll in the first second." },
    { "kind": "screen", "title": "Plan it in *minutes*.", "media": "assets/site-1.png", "device": "browser", "url": "launchr.app", "callouts": ["Auto checklist"] },
    { "kind": "stat", "value": "1,240", "label": "apps launched this month" },
    { "kind": "outro", "text": "Launchr", "cta": "Start free", "url": "launchr.app", "media": "assets/logo-1.svg" }
  ]
}
```

- Use `*word*` for the single emphasised word in a line, and `|` for an explicit line break.
- Write `plan` (what happens visually, in plain words) and `why` (one sentence) for the user to read on the storyboard.
- Hardware frames: set `device` to `"iphone"`, `"macbook"`, `"display"` (Studio Display), or `"ipad"` for real photographed hardware frames, or `"browser"`, `"window"`, or `"plain"` for drawn frames. If omitted, tall screenshots default to `"iphone"` and wide ones to `"macbook"`.
- Leave `length: null` so scene durations derive naturally from reading time and snap to half-beats of the soundtrack, unless the user requested a specific duration.

### 4. Inspect frames before showing anything

Render the hero frame of every scene and run automated typography and layout checks:

```bash
MD frames "$WORK"
```

Call `view_file` on `$WORK/frames/sheet.jpg` (and individual `$WORK/frames/scene-NN.jpg` files if needed) to visually inspect the composition before showing anything to the user. Fix any issues immediately:

- Clipped or tiny text (`text_below_floor` or `text_clip`): shorten the copy or split into two scenes.
- Lines too fast to read: cut words, drop a scene, or increase `length`.
- Screenshots that look cramped: crop to the focal UI area using `ffmpeg` or switch `device`.
- Two consecutive scenes that look too similar: vary the scene `kind`, `side`, or `tone`.

### 5. Present the interactive storyboard in Canvas (or render directly if requested)

Build the self-contained interactive HTML storyboard:

```bash
MD board "$WORK"
```

This generates `$WORK/storyboard.html` and copies it to `artifacts/file_generation/ttl=63d/output/<slug>-storyboard.html`.

- Call `google:show_file` on `/working_dir/<conversation_id>/artifacts/file_generation/ttl=63d/output/<slug>-storyboard.html` so the user gets the live interactive storyboard in Canvas.
- Tell the user in a concise message that their interactive storyboard is open in Canvas: they can play the live video with its synthesized soundtrack, flip style, format, length, font, colour, or sound in one tap, edit scene text or add notes, and then either reply **"Approve"** in chat (or click **Approve and render** in the storyboard to copy their changes into chat) to render the final MP4.
- If the user explicitly asked for the final MP4 video right away (or said to skip review), you may run `MD render "$WORK" --skip-review` in the same turn and present both the interactive storyboard and the rendered MP4 via `google:show_file`.

### 6. Render, verify, and deliver the MP4

When the user approves the storyboard (or shares edits/notes from the storyboard):

1. Apply any edits or scene notes to `video.json` (using `MD set "$WORK" key=value` or editing `video.json`), and run `MD frames "$WORK"` if you changed scene layout or copy.
2. Render the final MP4 video:

```bash
MD render "$WORK" --skip-review
```

3. Inspect `$WORK/qa/sheet.jpg` with `view_file` to confirm every scene in the encoded MP4 looks crisp.
4. Present the final MP4 (`/working_dir/<conversation_id>/artifacts/file_generation/ttl=63d/output/<slug>.mp4`) to the user by calling `google:show_file`.
5. Keep your handoff concise (state the style, format, and duration, and let them know they can ask for any change in one sentence or request a `9:16` / `1:1` version).

### 7. One-sentence revisions

When the user asks for a revision after seeing the storyboard or video, map their request to the smallest change (`references/revisions.md`), run `MD frames "$WORK"` to verify, run `MD render "$WORK" --skip-review`, and show the new MP4 with `google:show_file`:

```bash
MD set "$WORK" style='"aura"'
MD set "$WORK" length=15
MD set "$WORK" palette=1
MD set "$WORK" format='"9:16"'
MD set "$WORK" scenes.1.text='"New headline *here*."'
MD set "$WORK" sound.sfx='"subtle"'
```

Every render is saved (`renders/v1.mp4`, `v2.mp4`, along with `v1.json`, `v2.json`), so `MD restore "$WORK" v1` restores any earlier version.

## Custom Scenes and Sound

- **Custom scenes**: When the 14 built-in scene kinds cannot express a specific visual moment, write a `custom` scene using the style's CSS tokens (`var(--accent)`, `var(--f-display)`, `calc(var(--u) * N)`) and kit moves (`references/video-json.md`).
- **Soundtrack**: Every video gets a synthesized stereo soundtrack (`scripts/lib/audio.js`) matched to the style's genre (Kinetic = warm house, Keynote = soft piano pulse, Aura = ambient pads, Paper = muted plucks with brushes, Terminal = low filtered arpeggio, Data = lofi, Story = fingerpicked guitar), mixed with pitched sound effects at -16 LUFS.
- **Sound options**: Set `sound.music` to `"auto"` (default), `"none"`, or a path in `assets/`. Set `sound.sfx` to `"on"`, `"subtle"`, or `"off"`. Set `sound.preset` to borrow another style's music bed.

## Gotchas

- **Never run a blocking localhost server in Gemini**: Always run `MD board "$WORK"` without `--serve` so it generates the standalone Canvas HTML file and exits cleanly.
- **No fabricated stats or quotes**: Never invent metrics, customer names, or testimonials. Use qualitative copy (`statement`, `hook`, `features`, `steps`) when the user has not provided numbers.
- **Visual check is mandatory**: Always inspect `frames/sheet.jpg` via `view_file` before presenting the storyboard or final video so clipped text, tiny fonts, or awkward line wraps are caught and fixed first.
