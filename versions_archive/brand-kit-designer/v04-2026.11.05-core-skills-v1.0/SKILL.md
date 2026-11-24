---
name: brand-kit-designer
description: End-to-end brand identity, logo design, and brand kit engineering system. Use whenever the user asks to design a logo, build a brand kit, create brand assets, choose a brand color palette and font pairing, audit or refresh an existing visual identity, generate a brand board or style guide, or export production-ready SVG logos, favicons, app icons, design tokens, and AI-rendered brand mockups without generic AI cliches.
allowed-tools: default_api google image_gen
---
# Brand Kit Designer

A disciplined brand identity and logo engineering skill that transforms a short product or company brief into production-ready SVG marks, mathematically verified color and typography systems, photorealistic AI brand boards, and a complete 8-module HTML/SVG Brand Asset Kit.

## When to Use

- Designing a new logo, wordmark, monogram, pictorial symbol, or mascot mark from scratch.
- Creating a complete brand kit, visual identity board, or brand guidelines book with color palettes, font pairings, and mockups.
- Auditing, refreshing, or recoloring an existing logo or visual identity so it works across light, dark, monochrome, and 16px favicon surfaces.
- Exporting a production brand asset bundle (`logo-primary.svg`, `logo-mark.svg`, `logo-monochrome-ink.svg`, `logo-inverted-light.svg`, `favicon.svg`, `site.webmanifest`, `brand-tokens.json`, and `brand-board.html`).

## Core Anti-AI-Slop Philosophy

Default AI branding fails because models reach for the most statistically common visual tropes in their training data: purple-to-cyan gradients on dark slate, generic industry clip-art (sparkles for AI, padlocks for security, coffee cups with steam, green crosses for health), un-tinted `#000000` on `#FFFFFF`, vibrating chromatic color pairs, and over-complex vector paths that collapse into mush at 16px.

To make every identity look human-art-directed, follow four foundational rules:

1. **Positioning First, Metaphor Second, Geometry Third**: Every visual decision must serve a single positioning sentence (`For [audience], [brand] is the [category] that [differentiator]`). Ban the first-thought literal noun of the sector and use structural metaphors instead.
2. **Prove the Silhouette in Monochrome First**: A great mark works in a single ink on paper and survives at 16x16 pixels before color is ever added.
3. **Mathematical Color & Contrast Discipline**: Cap the palette at 6 semantic roles following the 60-30-10 proportion rule. Tint light canvases and dark inks toward the brand's temperature, verify WCAG 2.1 contrast (`4.5:1` for text, `3.0:1` for marks), and prevent chromostereopsis (luminance vibration) between adjacent chromatic colors.
4. **Intentional Typographic Tension**: Pair at most 2 typeface families (1 expressive Display/Headline + 1 workhorse Body/UI font, plus optional Monospace for technical metadata) with scale-dependent tracking (`-0.025em` on display, `+0.1em` on uppercase labels) and a customized wordmark lockup.

## Bundled References and Scripts

Consult these bundled files at the exact stage they apply:

- `references/logo-construction-and-anti-slop.md`: Read during **Step 1 & Step 2** for the sector-by-sector banned cliche matrix, the 3-column metaphor word-mapping protocol, the 7 mark archetypes, mascot single-feature extraction rules, SVG optical corrections (overshoot, irradiation, 1/48th gap floor), and the 12 showcase lighting environments.
- `references/color-and-typography-theory.md`: Read during **Step 3** for the 6-role color architecture, WCAG luminance math, chromostereopsis guards, industry color alternatives, 5 Google Fonts pairing archetypes, and modular type scales.
- `scripts/brand_audit.py`: Run during **Step 2 & Step 4** to programmatically audit SVG files (viewBox, anchor point economy, near-miss angles, tiny details) and `brand_spec.json` (WCAG contrast ratios, polarity locks, and palette hygiene).
- `scripts/generate_brand_board.py`: Run to compile either the 3-concept checkpoint sheet (`--mode checkpoint`) or the complete 8-module interactive Brand System Board and exported SVG/token bundle (`--mode kit`).

## Workflow

### Step 1: Brief Discovery & Positioning Lock

Check what context the user has already provided. If the prompt already specifies the brand name, category, and vibe, proceed immediately by stating any minor assumptions clearly rather than stalling with a long questionnaire. If critical context is missing, ask at most 1 concise message covering:

- **Brand Name & Category**: What is it and what does it do?
- **Audience & Positioning**: Who is it for, and is it quiet luxury, technical/industrial, warm artisanal, or playful consumer?
- **Workflow Mode**: Does the user want to pause at the **3-Concept Checkpoint** to pick a logo direction first, or generate the **Full Brand Kit** end-to-end immediately? (If the user asks for a complete brand kit or assets in one go, deliver the full kit while including the 3 explored concepts on the board.)

Write out the one-sentence positioning statement and consult `references/logo-construction-and-anti-slop.md` to list 4-5 **Banned Sector Cliches** that this brand will explicitly avoid.

### Step 2: Metaphor Word-Mapping & SVG Concept Engineering

Read `references/logo-construction-and-anti-slop.md` and perform a 3-column word map (Tangible Objects, Actions/Mechanics, Letterform Anatomy).

1. **Diverge 8-10 One-Line Ideas, Select the Top 3**:
   Choose 3 structurally distinct directions across different mark archetypes:
   - *Direction A*: Geometric Lettermark or Monogram (built from the brand initial with a metaphorical cut or negative-space reveal).
   - *Direction B*: Dual-Meaning Pictorial or Architectural Symbol (two concepts fused into one restrained silhouette).
   - *Direction C*: Negative-Space Mark or Mascot Feature-Extracted Mark (isolating one iconic anatomical/celestial feature into a flat silhouette).
2. **Construct Clean Vector SVGs**:
   Write pure, handcrafted SVG code for each mark (`viewBox="0 0 256 256"`, using `fill="currentColor"` or explicit semantic fills):
   - Keep anchor points lean (target under 120 anchors; iconic logos average 53-75).
   - Snap diagonal lines and polygon edges to clean angles (`30`, `45`, `60`, `75`, `90` degrees).
   - Enforce the **1/48th minimum gap floor**: every stroke and negative-space cutout must be at least `5.5` units wide on a `256x256` canvas so it remains crisp at `16x16` favicon scale.
   - Apply optical corrections: add `1.5%-2%` overshoot on curved/pointed apexes and widen internal gaps slightly so white-on-black inversion does not plug up.
   - Craft a horizontal wordmark lockup (`viewBox="0 0 800 256"`) where the typography is optically kerned and echoes a structural angle or cut from the symbol.
3. **Run the Programmatic SVG Audit**:
   Save the SVG files and run:
   ```bash
   python3 <skill_dir>/scripts/brand_audit.py --svg concept_a.svg concept_b.svg concept_c.svg
   ```
   Fix any errors or warnings (such as near-miss angles, tiny sub-shapes, or anchor bloat) until every SVG scores `90+/100`.

### Step 3: Perceptual Color System & Typography Architecture

Read `references/color-and-typography-theory.md` to design a cohesive visual system that avoids AI color and font tropes:

1. **Build the 6-Role Palette (60-30-10 Proportion)**:
   - `surface_light` (~60% Light Canvas): Undertone-tinted paper/ivory/stone (e.g., `#FAF7F2`, `#F4EEE2`, `#F3F5F6`), avoiding sterile `#FFFFFF`.
   - `surface_dark` (~60% Dark Ink): Undertone-matched deep ink (e.g., `#141413`, `#11181C`, `#1B1615`), avoiding dead `#000000`.
   - `signature` (~10%-15% First-Glance Brand Color): Chosen for immediate shelf/app-screen memorability and differentiation from competitors.
   - `secondary` (~20%-30% Support Container): Structural companion shade that harmonizes with the signature color.
   - `accent` (~5% Signal Spark): High-contrast highlight for micro-interactions or focal cuts.
   - `muted_neutral` (~5%-10% Subtext/Hairlines): Mid-tone neutral passing `>= 4.5:1` on Canvas for captions.
2. **Verify WCAG Contrast & Surface Polarity Rules**:
   - Body copy must pass `>= 4.5:1` (prefer `>= 7.0:1` AAA).
   - Large headlines and logo marks must pass `>= 3.0:1`.
   - If a bright accent or secondary color has `< 3.0:1` contrast on `surface_light`, explicitly lock it to dark surfaces only and define a 1-color ink fallback for light backgrounds.
   - Never layer two chromatic colors with `< 3.0:1` mutual contrast directly on top of each other (chromostereopsis guard).
3. **Select the Typography Pairing & Modular Scale**:
   - Pick 1 Display/Headline font + 1 Body/UI font (+ optional Monospace font) from freely licensed Google Fonts matching one of the 5 archetypes in `references/color-and-typography-theory.md`.
   - Define the modular scale ratio (`1.200`, `1.250`, or `1.333`) and scale-specific letter-spacing (`-0.025em` to `-0.035em` for display headings, `0em` for body, `+0.08em` to `+0.12em` for uppercase mono labels).

### Step 4: Audit, Render & Assemble the Brand Kit

1. **Write `brand_spec.json` and Run the Full Brand Audit**:
   Create `brand_spec.json` with `brand_name`, `tagline`, `category`, `positioning`, `metaphor_summary`, `cliches_avoided`, `construction_notes`, `donts`, `palette`, `typography`, `concepts`, `svg_mark`, `svg_lockup`, and `svg_seal`. Run:
   ```bash
   python3 <skill_dir>/scripts/brand_audit.py --spec brand_spec.json
   ```
   Resolve any contrast or specification warnings until the audit passes cleanly.
2. **Generate Interactive HTML Boards & Production SVG/Token Exports**:
   - If stopping at the **Concept Checkpoint**, run:
     ```bash
     python3 <skill_dir>/scripts/generate_brand_board.py --mode checkpoint --spec brand_spec.json --out-dir <output_dir>
     ```
   - When building the **Full Brand Kit**, run:
     ```bash
     python3 <skill_dir>/scripts/generate_brand_board.py --mode kit --spec brand_spec.json --out-dir <output_dir>
     ```
   This outputs the 8-module `brand-board.html`, `logo-primary.svg`, `logo-mark.svg`, `logo-monochrome-ink.svg`, `logo-inverted-light.svg`, `favicon.svg`, `site.webmanifest`, and `brand-tokens.json`.
3. **Render Photorealistic AI Showcase Visuals (When `image_gen` is Available)**:
   Pair the deterministic SVG/HTML kit with 1-2 photorealistic brand showcase images using `image_gen:generate_image`:
   - Select one of the **12 Showcase Lighting & Material Environments** from `references/logo-construction-and-anti-slop.md` (e.g., *Editorial Paper* blind deboss, *Frosted Dome* acrylic, *Studio Spotlight*, or *Swiss Flat* poster print).
   - Lock the exact HEX values and symbol geometry in the `image_gen` prompt: specify flat vector silhouette precision, exact color names + HEX codes, realistic material texture (such as 350gsm cotton card, brushed aluminum, or kraft packaging), and zero decorative clutter.
4. **Present the Deliverables**:
   Copy the final `brand-board.html` (and any downloadable assets requested by the user) to the sandbox output directory (`/working_dir/<id>/artifacts/file_generation/ttl=63d/output/`) and display the interactive board using `google:show_file`, while embedding any `image_gen` showcase visuals inline in chat.

## Quality Checklist Before Responding

- [ ] Does the logo avoid all banned first-thought cliches for its industry?
- [ ] Did `brand_audit.py` score `90+/100` on both the SVG geometry and the color/typography spec?
- [ ] Does the mark remain unmistakable at `16x16` pixels and in 1-color monochrome ink?
- [ ] Are light and dark surfaces subtly undertone-tinted rather than harsh `#FFFFFF` and `#000000`?
- [ ] Are all 8 modules populated in `brand-board.html` and presented cleanly to the user?
