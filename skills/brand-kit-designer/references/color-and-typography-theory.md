# Color Theory, Perceptual Contrast & Typography System Reference

This reference governs how `brand-kit-designer` constructs color systems and typographic hierarchies so that every brand feels human-art-directed rather than AI-generated.

## Table of Contents

1. [Why AI Branding Looks Like Slop (And How to Fix It)](#1-why-ai-branding-looks-like-slop-and-how-to-fix-it)
2. [Perceptual Color Theory & The 6-Role Architecture](#2-perceptual-color-theory--the-6-role-architecture)
3. [Contrast Mathematics & Luminance Vibration Rules](#3-contrast-mathematics--luminance-vibration-rules)
4. [Industry Color Traps vs. High-Craft Alternatives](#4-industry-color-traps-vs-high-craft-alternatives)
5. [Typography Theory, Pairing Archetypes & Modular Scales](#5-typography-theory-pairing-archetypes--modular-scales)
6. [Micro-Typography & Optical Rules](#6-micro-typography--optical-rules)

---

## 1. Why AI Branding Looks Like Slop (And How to Fix It)

Default LLM and image-generator outputs fail in five predictable ways:

- **The Neon-Gradient Trap**: Defaulting to `#6366F1` (indigo) + `#8B5CF6` (violet) + `#06B6D4` (cyan) gradients on `#0F172A` dark slate for every SaaS, AI, or tech brand.
- **Un-tinted Pure Extremes**: Using raw `#000000` on `#FFFFFF` alongside fully saturated primary RGB colors (`#FF0000`, `#00FF00`, `#0000FF`), which creates harsh digital glare instead of tactile ink-on-paper warmth.
- **Chromostereopsis (Luminance Vibration)**: Pairing two high-chroma colors of nearly equal relative luminance (such as teal `#0D9488` directly on tangerine `#F97316`), causing the edges to visually buzz and fail legibility.
- **Decorative Palette Bloat**: Proposing 8 to 12 colors with no clear hierarchy or functional job, resulting in chaotic mockups.
- **Generic Font Defaults**: Slapping Inter, Roboto, or Arial onto everything with uniform `1.5` line-height and `0` letter-spacing regardless of scale or brand personality.

---

## 2. Perceptual Color Theory & The 6-Role Architecture

Every brand palette must contain **at most 6 colors** (including neutrals), with each color assigned an explicit semantic role, HEX code, RGB triplet, HSL/OKLCH character, and usage ratio following the **60-30-10 proportion rule**:

| Role | Target Share | Purpose | Craft Rule |
| :--- | :--- | :--- | :--- |
| **1. Surface Light (Canvas)** | ~60% (Light mode) | Primary page, card, packaging, or stationery background | Tint slightly toward the brand's temperature: warm ivory (`#FAF7F2`, `#F4EEE2`), stone (`#F3F4F1`), or crisp ice (`#F6F8FA`) rather than sterile `#FFFFFF` |
| **2. Surface Dark (Ink)** | ~60% (Dark mode) / Text | Primary typography, one-color ink mark, and dark-mode canvas | Undertone-matched deep ink (`#141413`, `#11181C`, `#1A1615`, `#0D1B1E`) rather than dead `#000000` |
| **3. Signature Brand Color** | ~10%–15% | First-glance recognition on app icons, packaging spines, primary CTAs, and hero focal points | Chosen for category separation and memorability; must pass $\ge 3.0:1$ against either Canvas or Ink |
| **4. Secondary Support** | ~20%–30% | Structural containers, secondary panels, brand patterns, or companion tone | Harmonizes via analogous warmth, split-complementary tension, or deep tonal anchor |
| **5. Accent / Signal** | ~5% | Micro-highlights, active states, badges, or a single focal cut in the logo | High-contrast spark; if its luminance is close to the Signature color, never place them directly on top of each other |
| **6. Muted Neutral (Border/Subtext)** | ~5%–10% | Secondary captions, hairline dividers, disabled states, and grid scaffolding | Mid-tone desaturated shade bridged between Canvas and Ink; must pass $\ge 4.5:1$ on Canvas if used for text |

### Harmony Models

Select one explicit harmony structure per concept route and state why it serves the positioning sentence:

- **Tonal / Monochromatic + Warm Neutral**: Deep forest ink (`#132A1E`), sage support (`#4A6B5B`), electric moss accent (`#A3E635` on dark only), and warm parchment (`#F6F4EE`). Best for quiet luxury, architecture, wealth management, and clinical wellness.
- **Split-Complementary with Undertone Bridge**: A warm terracotta signature (`#D95D39`) paired with deep Atlantic navy (`#142834`) and sunlit sand (`#F4ECE1`). Delivers energy without the harshness of direct opposites.
- **High-Contrast Editorial Duotone**: Heavy carbon ink (`#121212`), warm newsprint (`#F5F2EB`), and a single unmistakable signal color (e.g., Signal Vermilion `#E63926` or Cobalt `#1D4ED8`).

---

## 3. Contrast Mathematics & Luminance Vibration Rules

Before finalizing any palette, compute relative luminance $L$ for every color using the WCAG 2.1 formula:

$$L = 0.2126 \times R_{lin} + 0.7152 \times G_{lin} + 0.0722 \times B_{lin}$$

where $C_{lin} = (C/255)/12.92$ if $C/255 \le 0.04045$, else $((C/255 + 0.055)/1.055)^{2.4}$.

The contrast ratio between two colors with luminances $L_1 \ge L_2$ is:

$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

### Mandatory Thresholds (Enforced by `scripts/brand_audit.py`)

1. **Body Copy & Captions**: Must achieve **$CR \ge 4.5:1$** (prefer $\ge 7.0:1$ AAA for primary reading text) against both light and dark surface backgrounds.
2. **Large Display Headlines & Primary Logo Mark**: Must achieve **$CR \ge 3.0:1$** against the background surface where it is permitted to appear.
3. **Surface Polarity Allocation**: If a vivid accent (e.g., acid lime, cyan, or marigold) achieves $CR < 3.0:1$ on the light canvas (for instance, cyan at $1.5:1$ on white), explicitly lock that color in the usage rules to **dark surfaces only**, and define a one-color ink fallback for light surfaces.
4. **Anti-Vibration Rule (Chromostereopsis Guard)**: Never place two high-saturation chromatic colors directly on top of each other if their contrast ratio is $< 3.0:1$. When a secondary element sits inside a colored container of similar luminance, flip the inner element to **Ink** or **Canvas** (e.g., on a tangerine tile, a teal ribbon switches to deep ink).

---

## 4. Industry Color Traps vs. High-Craft Alternatives

| Sector | Overused Cliché Palette (Avoid) | High-Craft Strategic Alternatives |
| :--- | :--- | :--- |
| **AI & Developer Tools** | Purple-to-blue neon gradients on `#0F172A` dark slate | Carbon ink (`#111210`) + warm putty (`#F2EFE9`) + signal vermilion (`#E03C26`) or acid chartreuse (`#C8F53B`) |
| **Fintech & Banking** | Corporate trust blue (`#0052CC`) + generic emerald green | Deep aubergine/espresso ink + warm alabaster + tangerine, marigold, or oxidized copper |
| **Healthcare & Wellness** | Hospital teal/cyan + stock leaf green on sterile white | Warm clay/terracotta, sunlit chamomile yellow + cobalt ink, or deep spruce + oat milk |
| **Sustainability & Clean Energy** | Mid-tone grass green + sky blue | Volt orange + night navy, or raw earth umber + sulfur yellow + unbleached linen |
| **Luxury & Fashion** | Faux metallic gold gradients on pure black | High-contrast warm ivory + lampblack + muted oxblood, celadon, or stone gray |
| **Food & Beverage** | Fast-food primary red + yellow | Tomato red + zest lime + aubergine ink, or crust marigold + jam pink + kraft paper |

---

## 5. Typography Theory, Pairing Archetypes & Modular Scales

Every brand kit must define **at most 2 typeface families** (1 Display/Headline family + 1 Body/UI family), plus an optional Monospace family only when the brand features code, data tables, receipts, or technical specs.

### Five Proven Pairing Archetypes (Google Fonts / Open License Ready)

1. **Editorial Authority (High-Contrast Serif + Humanist/Neo-Grotesk Sans)**
   - *Best for*: Fintech, publishing, legal, B2B strategy, modern healthcare, premium consumer brands.
   - *Pairings*: `Fraunces` + `Plus Jakarta Sans`; `Instrument Serif` + `Inter`; `Playfair Display` + `DM Sans`; `Newsreader` + `Work Sans`.
2. **Technical Precision (Geometric/Industrial Display + Crisp UI Sans + Mono)**
   - *Best for*: Developer tools, AI infrastructure, hardware, cybersecurity, analytics.
   - *Pairings*: `Space Grotesk` + `IBM Plex Sans` (+ `JetBrains Mono`); `Syne` + `Manrope` (+ `Space Mono`); `Bricolage Grotesque` + `Geist` / `Inter`.
3. **Warm Craft & Hospitality (Expressive Humanist/Slab + Warm Sans or Readable Serif)**
   - *Best for*: Specialty coffee, food & beverage, outdoor gear, artisanal retail, architecture studios.
   - *Pairings*: `Cormorant Garamond` + `Outfit`; `Archivo Black` + `Lora`; `bespoke SVG wordmark` + `Sora` / `Karla`.
4. **Swiss Neo-Brutalist / Cultural (Tight Grotesque + Monospace)**
   - *Best for*: Design agencies, music festivals, cultural institutions, streetwear, creative labs.
   - *Pairings*: `Oswald` / `Anton` + `Space Mono`; `Plus Jakarta Sans` (800 weight, tight tracking) + `IBM Plex Mono`.
5. **Approachable Consumer & EdTech (Rounded/Friendly Display + Clean Humanist Sans)**
   - *Best for*: Consumer apps, kids' STEM, veterinary, mobility, community platforms.
   - *Pairings*: `Fredoka` / `ricolage Grotesque` + `Nunito Sans`; `Cabinet Grotesk` / `Outfit` + `Public Sans`.

---

## 6. Micro-Typography & Optical Rules

Specify concrete CSS-ready typographic tokens rather than vague adjectives:

- **Modular Type Scale**: Choose a mathematical ratio matched to the medium:
  - *1.200 (Minor Third)*: Dense SaaS dashboards and utility apps.
  - *1.250 (Major Third)*: Balanced brand systems, marketing sites, and documentation.
  - *1.333 (Perfect Fourth)*: Expressive editorial brands, pitch decks, and poster systems.
- **Scale-Dependent Tracking (Letter-Spacing)**:
  - Display & H1 (`36px`–`72px`): Tighten tracking to `-0.02em` to `-0.04em` so large letterforms hold together as a cohesive graphic block.
  - Body Copy (`16px`–`18px`): Keep tracking at `0em` (neutral) with line-height `1.5`–`1.65` and measure capped at `60ch`–`70ch`.
  - All-Caps Eyebrows / Labels (`11px`–`13px`): Open tracking to `+0.08em` to `+0.14em` with semi-bold weight (`600`) to prevent cramped capital letters.
- **Wordmark Customization Rule**: Never leave a logo wordmark as raw, unturned system text. In the SVG wordmark lockup, customize at least one structural detail that echoes the symbol (e.g., matching the angle of a diagonal terminal, customizing a ligature, cutting a counter to mirror the mark's geometry, or adjusting optical kerning between awkward pairs like `VA`, `TY`, `LA`, `KO`).
