# Craft: the words and the timing

The kit handles easing, staggering, sound sync, fitting and transitions. What it can't do is write.
The words decide whether the video is good.

## Words on screen

- **One idea per scene.** A display line is ≤ 8 words; a hook ≤ 7. If a line needs a comma and an "and", split it.
- **Say the benefit, show the feature.** "Ship in an afternoon" on screen, the feature in the screenshot.
- **Concrete beats clever.** "1,240 apps launched this month" beats "Join thousands of happy makers".
- **Their words first.** Lift phrases from their site, README or outline; tighten them; keep their voice.
- **One emphasis per line**, on the word that carries the meaning (`*minutes*`, `*free*`, `*twice*`). Never
  emphasise the product name in the hook.
- **No filler**: no "Introducing…" on its own scene, no "Revolutionary", "Seamless", "Unlock", "Elevate",
  "Next-level", "Supercharge", "Game-changing", "In today's fast-paced world".
- **Numbers are real or absent.** Write them as people say them: "2×", "1,240", "$4.2M", "98%".
- **Lists**: 3–4 items, 1–4 words each, parallel grammar ("Plan it. Ship it. Grow it.").
- **The ending** has three things only: the name, one call to action ("Start free", "Get it on the App
  Store", "Join the waitlist"), the URL. No socials list.
- Sentence case by default; the style may set caps. Don't type words in capitals yourself.
- `words` scenes: 2–5 single words or very short phrases, each with its own full-frame beat.

## Pace (the kit enforces it)

Fast, not rushed. A scene lasts until its headline has landed, plus about 0.14 s per word on screen and
a short beat — most scenes come out at 2–3 s, a busy chart or a screen with callouts 3–4 s. Then it snaps
to the music's beat. Nobody needs 4 seconds to read one line. If a scene feels slow, it has too little
on it (merge it) or too much (split it) — don't pad it with `dur`. HyperFrames' own check (`frames`)
flags any line that's on screen too briefly to read (`line_unread`).

## Rhythm

- Open fast: the hook lands in the first second.
- Alternate density: a busy scene (screens, features) is followed by a simple one (statement, stat).
- Change something big at each cut: the kind, the side, the tone, or the scale.
- End on a hold: the outro stays ~1.5 s after its last element lands.

## Screens

- A screenshot must read at the size it's shown. A full desktop page at 40% width is mush: crop to the
  part that matters (ffmpeg `crop`), or use `device: "plain"` with a tight crop, or a phone shot.
- Long screenshots scroll by themselves inside the device (the `pan` move). A short one zooms slowly.
  `move: "still"` holds it.
- `callouts` are 1–3 words, at most 3, pointing at something that's actually on that screen.
- Screen recordings (`.mp4/.mov`) play inside the device for the scene's length, muted.
- `device`: `iphone` for app screenshots (tall), `macbook` for websites and desktop apps, `display` (Studio
  Display) for a bigger, calmer shot, `ipad` for tablet apps — real photographed hardware. `browser`
  (with `url`), `window` and `plain` are drawn frames for when real hardware would be wrong.

## Things that make it look AI-made (avoid)

- Every scene the same layout and size. Vary kind, side, tone and scale.
- Five features in a grid. Three, or split them across scenes.
- Lorem-ish copy, invented stats, invented testimonials, fake logos of customers.
- Emojis as icons (the kit has real icons: `references/video-json.md` → icons).
- A wall of text on the ending.
