# video.json

```jsonc
{
  "title": "Launchr",                 // shown on the storyboard; names the output file
  "brief": "…their outline, verbatim…",
  "purpose": "app launch",
  "style": "keynote",                 // kinetic | keynote | aura | paper | terminal | data | story
  "alternates": ["kinetic", "aura"],  // two other styles shown playing on the storyboard
  "format": "16:9",                   // 16:9 | 9:16 | 1:1 | 4:5
  "length": null,                     // seconds, or null = natural (reading time)
  "font": 0,                          // index into the style's pairings (MD styles), or a brand font object (below)
  "palette": 0,                       // index, or a brand palette object (below)
  "why": { "style": "…", "format": "…", "length": "…" },
  "brand": { "name": "Launchr", "url": "launchr.app", "color": "#ff5a1f", "logo": "assets/logo-1.svg" },
  "sound": { "sfx": "on", "music": "auto", "preset": null, "bpm": null, "musicVolume": 0.8, "musicStart": 0 },
  "drift": null, "grain": null,       // override the style's slow camera drift / film grain (0 = off)
  "scenes": [ … ]
}
```

Brand objects (shown as "Your brand" on the storyboard):

```jsonc
"font": { "display": "Bricolage Grotesque", "text": "Inter", "mono": "JetBrains Mono",
          "vars": { "--dw": 800, "--dwdth": "92%", "--dls": "-0.03em", "--dlh": "0.92", "--tcase": "none" } },
"palette": { "bg": "#F8F3EA", "ink": "#0B1957", "accent": "#CF604C", "accentInk": "#FFFFFF", "muted": "#5B6380", "surface": "#EFE7DA" }
```

Fonts must be bundled ones: Inter, Inter Tight, Geist, Geist Mono, JetBrains Mono, Archivo (width 62–125%),
Bricolage Grotesque (width 75–100%), Instrument Sans, Instrument Serif, Fraunces, DM Serif Display, DM Sans,
Space Grotesk, Unbounded, Big Shoulders, Bebas Neue, Anton, Cormorant, Manrope, Syne, Doto. `vars`: `--dw`
display weight, `--dwdth` width, `--dls` tracking, `--dlh` line height, `--tcase` text-transform. At
display sizes keep tracking ≥ −0.035em and check `frames` for letters touching. A style's preset font
object (`MD styles --json`) is a good starting point.

Every scene: `kind`, its fields below, and optionally `dur` (seconds — overrides reading time),
`transition` (into this scene: `cut fade blur push zoom wipe iris` + the style's own), `tone`
(`base | invert | accent` where the style uses tones), `plan` and `why` (shown on the storyboard),
`off: true` (kept in the file, left out of the video). `ask` holds the person's storyboard note to you —
never shown in the video. Text fields take `*emphasis*` and `|` line breaks.
Media paths are relative to the project folder.

| kind | fields | use it for |
|---|---|---|
| `hook` | `text`, `kicker?`, `sub?` | the opening line |
| `statement` | `text`, `kicker?`, `sub?` | one line that matters |
| `words` | `items[]` (2–5 short) | a fast beat, one word per frame |
| `stat` | `value` ("1,240", "$4.2M", "98%", "10x"), `label`, `kicker?` | one real number, counts up |
| `list` | `title?`, `items[]` (3–4) | a short list |
| `steps` | `title?`, `items[]` (3) | how it works, numbered |
| `screen` | `media`, `device` (`iphone macbook display ipad` real hardware · `browser window plain` drawn; default from the image's shape), `title?`, `sub?`, `kicker?`, `url?`, `callouts[]?` (≤3), `side?` (`left`/`right`), `move?` (`still`) | a screenshot or screen recording with its line |
| `screens` | `media[]` (2–4), `device?` (default `iphone`), `title?` | a row of screens |
| `features` | `title?`, `items[]` of `{icon, title, text?}` (2–4) | what it does |
| `compare` | `title?`, `before: {label, items[]}`, `after: {label, items[]}` | old way vs new way |
| `quote` | `text`, `name`, `role?`, `media?` (avatar) | a real testimonial |
| `chart` | `title?`, `bars[]` of `{label, value, display?, highlight?}`, `unit?` | a few numbers compared |
| `logo` | `media?` (logo file), `text?` (wordmark), `sub?` | a sting / the mark |
| `outro` | `text`, `cta?`, `url?`, `media?` (logo), `kicker?` | the ending |
| `custom` | `html`, `events[]` | anything else (below) |

Some styles add their own kinds — `MD styles` lists them (e.g. Data's `line`, `donut`).

### Story's `story` scene (people)

```jsonc
"cast": [{ "name": "Lena", "hair": "bun", "skin": 1, "hairColor": 1, "top": "var(--accent)" }],   // top level, optional
{ "kind": "story", "set": "office", "text": "Lena ships her app on *Friday*.",
  "cast": [{ "who": "Lena", "do": "laptop", "enter": "left" }, "Sam: wave"],
  "say": "Two weeks? I have two days.", "media": "assets/shot.png" }
```

`do`: `stand wave talk think laptop phone cheer slump point shrug` · `enter`: `left`/`right` (walks in
first) · `set`: `home office street shop park plain` · `say`: a speech bubble from the first person (or
the one with `"say"`; `think` makes it a thought) · `media`: the product on a card beside them (16:9).
Up to 3 people. Anyone not in `cast` gets a look from their name. `hair`: `short bun long curly bob
beard cap bald`; `skin` 0–4; `hairColor` 0–6; `top`/`bottom`: a colour or `var(--accent|--cool|--pop|--leaf)`.
Keep `text` to one short line and `say` to a few words: the people carry the scene.

## Icons (for `features`)

arrow-right arrow-up-right bar-chart-3 battery-charging bell bot brain calendar camera check circle-check
clock cloud code cpu credit-card database download eye file-text flame folder gift globe heart image
infinity layers layout-grid leaf lightbulb link lock mail map-pin message-circle mic moon music palette
pen-tool phone play plus puzzle refresh-cw repeat rocket scissors search send settings shield
shopping-cart sliders-horizontal smartphone sparkles star sun target timer trending-up trophy upload
users video wallet wand-2 wifi x zap  (Lucide, ISC)

## custom scenes

Your own markup inside the scene, styled with the style's tokens, animated by the kit's moves:

```json
{ "kind": "custom", "dur": 4,
  "html": "<div class='k'><div class='box'><h2 class='title' data-fit data-maxh='40'>Three <span class='w em'><span class='wi'>taps</span></span>.</h2><div class='cta'><span>Try it</span></div></div></div>",
  "events": [
    { "t": 0.1, "sel": ".title", "move": "fadeUp" },
    { "t": 0.8, "sel": ".cta", "move": "pop", "sfx": "pluck" }
  ] }
```

Tokens: `var(--bg) --ink --accent --accent-ink --muted --surface --f-display --f-text --f-mono`, sizes
in `calc(var(--u) * N)` (1u = 1% of the short side). `data-fit` shrinks a title to its box
(`data-fit="fill"` grows it to fill; `data-maxh` = max height in u).

Moves (`t` = seconds from the scene's start; `o` = options): `fadeIn fadeUp maskUp slam blurIn charRise
typewriter scramble trackIn pop rise scaleIn slideIn wipeIn mark grow growX draw count strike float drift
pan tilt show hide` + the style's own. Text moves that work per character need the text split into
`.c` spans (`maskUp`/`slam`/`blurIn` work per word: `.w > .wi`). `sfx` is one of the designed sounds: `whoosh`, `swish`, `thump`, `impact`, `bell`, `blip`, `key`, `riser`
(pitched to the soundtrack's key and mixed in; see SKILL.md → Sound).
`assets/sfx/sounds.json`.
