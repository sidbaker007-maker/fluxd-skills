# Deciding from an outline

The person gave you a sentence or a paragraph. Turn it into five decisions, each with a one-line `why`
written in their terms ("You want it to stop the scroll on X" — not "kinetic typography maximises
salience"). All five are switches on the storyboard, so decide fast and decide well.

## 1. Purpose (what the video has to do)

| signal in the outline | purpose | the video's job |
|---|---|---|
| "launch", "introducing", "new", "out now", "we just shipped" | launch | name it, show it, say why it matters, where to get it |
| screenshots, "my app", "SaaS", "dashboard", "feature" | product demo | the product is the hero; every claim shown on a real screen |
| "announce", "we raised", "hiring", "event", "join us" | announcement | one message, unmissable, a date/place/link |
| numbers, "results", "grew", "report", "year in review" | data story | one number that matters, the context, the takeaway |
| "explain", "how it works", "what is" | explainer | the problem, the idea, 3 steps, the payoff |
| "hook", "for X", "viral", "ad", "promo" | social hook | first second stops the scroll; one idea; CTA |
| "teaser", "trailer", "coming soon", "brand film" | teaser | mood and anticipation; reveal late; little text |
| "logo", "intro", "sting", "outro card" | sting | 3–6 s, the mark and maybe a line |

## 2. Style

Match the *feeling* the product should have, then the content type.

- **Kinetic** — loud, confident, poster-like. Words are the image. Hooks, launches, manifestos, events.
  Not for calm/luxury brands or videos that are mostly UI.
- **Keynote** — the Apple product film. Dark (or studio white), big devices, slow reveals, gradient words.
  Apps, SaaS, hardware, anything with good screens. The safe premium default for products.
- **Aura** — soft, glowing, glassy, calm. AI products, fintech, wellness, subscriptions, "premium but warm".
- **Paper** — playful, editorial, colourful shapes, serif with an italic word. Consumer apps, creators,
  friendly brands, explainers for normal people.
- **Terminal** — mono type, typing, grids. Dev tools, APIs, CLIs, agents, infra — an audience of builders.
- **Data** — grids, charts that draw, count-ups, annotations. Results, reports, research, fundraising.
- **Story** — flat illustrated people act it out in simple sets (they walk in, type, think, cheer), with
  speech bubbles and a narrator's line. A customer's moment, before → after, explainers for normal people.
  Write it as a tiny plot: who, the problem, the turn (your product), the payoff.

Their brand beats the table: a brand that is already loud and colourful → Kinetic or Paper even for a
SaaS; a dark minimal dev brand → Terminal or Keynote. If they gave a reference ("like Apple", "like
Stripe's videos", "like a little animated story"), that decides it. Pick two alternates that are *different* from
each other (e.g. picked Keynote → alternates Kinetic and Aura), so the storyboard comparison is a real choice.

Fonts and palettes: start at index 0 unless the brand says otherwise (their brand colour goes in
`brand.color`; a dark brand → the style's dark palette).

## 3. Format

| where it goes | format |
|---|---|
| X / Twitter, YouTube, a website hero, a pitch deck, LinkedIn video | 16:9 |
| TikTok, Reels, Shorts, Stories | 9:16 |
| Instagram feed, LinkedIn feed | 1:1 or 4:5 |
| not said | 16:9 (and offer a 9:16 version at the end) |

## 4. Length

| purpose | natural length | scenes |
|---|---|---|
| sting | 3–6 s | 1–2 |
| social hook | 10–20 s | 4–6 |
| announcement | 15–25 s | 4–7 |
| launch | 20–35 s | 6–9 |
| product demo | 25–45 s | 7–11 |
| explainer, data story | 30–60 s | 8–14 |
| teaser | 15–30 s | 4–7 |

Leave `length: null` (natural, from reading time) unless they named one. Shorter is almost always better:
when in doubt, cut a scene.

## 5. The scenes

A shape that works for most videos:

1. **Hook** (0–3 s): the promise or the tension, in ≤ 8 words. Not the product name.
2. **Problem or context** (optional): `statement`, or `compare` (before/after).
3. **The thing**: `screen` / `screens` with the product — or `words` for a fast beat.
4. **Proof**: `stat` (a real number), `features` (3 max), `quote` (a real one), `chart`.
5. **How** (optional): `steps` — three, short.
6. **Ending**: `outro` with the name, one call to action, the URL. (`logo` for a sting.)

Vary the kinds: never two of the same kind in a row except `screen` (and then with different devices or sides).
Every scene has one job; if you need "and", it's two scenes.
