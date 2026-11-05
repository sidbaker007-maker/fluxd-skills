#!/usr/bin/env python3
"""
generate_brand_board.py - Builds interactive HTML/SVG Concept Checkpoints and 8-Module Brand System Boards.

Inspired by:
- kaankiziltug/logo-design-skill (Concept checkpoint with 64/32/16px pixel ladder, one-color & dark tests)
- SanbaoAI/logo-generator-skill (8-module Brand-System Board layout, signature colorway & scenario mockups)
- Collective Brain Brandkit (Single-page HTML/SVG brand board, WCAG badges, font pairing scale, 3 don'ts)
- cofoundy/brand-skills (Structured machine-readable brand-tokens.json + production SVG/manifest exports)

Usage:
  1) Generate a 3-Concept Checkpoint Sheet before building the full kit:
     python3 generate_brand_board.py --mode checkpoint --spec brand_spec.json --out-dir ./output

  2) Generate the full 8-Module Brand System Board & exported SVG/token asset kit:
     python3 generate_brand_board.py --mode kit --spec brand_spec.json --out-dir ./output
"""

import argparse
import html
import json
import re
import sys
from pathlib import Path

# Import contrast utilities from sibling brand_audit module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from brand_audit import audit_brand_spec, audit_svg_file, contrast_ratio, parse_hex, rgb_to_hsl


def replace_current_color(svg_str: str, fill_hex: str, bg_hex: str = None) -> str:
    """Produce a standalone SVG string with currentColor replaced by fill_hex and optional background rect."""
    cleaned = svg_str.strip()
    cleaned = cleaned.replace("currentColor", fill_hex)
    if bg_hex:
        m = re.search(r'viewBox=["\']([^"\']+)["\']', cleaned)
        vb = [float(x) for x in re.split(r"[\s,]+", m.group(1).strip()) if x] if m else [0, 0, 256, 256]
        x, y, w, h = vb if len(vb) == 4 else (0, 0, 256, 256)
        bg_rect = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{round(min(w, h)*0.18, 1)}" fill="{bg_hex}"/>'
        cleaned = re.sub(r"(<svg[^>]*>)", r"\1\n  " + bg_rect, cleaned, count=1)
    return cleaned


def google_fonts_url(families: list) -> str:
    """Build a Google Fonts CSS2 URL for the given font family names."""
    valid = []
    for fam in families:
        if fam and fam.lower() not in ("system-ui", "sans-serif", "serif", "monospace"):
            q = fam.strip().replace(" ", "+")
            valid.append(f"family={q}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400")
    if not valid:
        return ""
    return "https://fonts.googleapis.com/css2?" + "&".join(valid) + "&display=swap"


def generate_checkpoint_html(spec: dict, out_dir: Path) -> Path:
    """Generate the Concept Checkpoint HTML sheet for comparing 3 distinct SVG concepts."""
    brand_name = html.escape(spec.get("brand_name", "Brand"))
    category = html.escape(spec.get("category", "Brand Identity"))
    positioning = html.escape(spec.get("positioning", ""))
    cliches_avoided = [html.escape(c) for c in spec.get("cliches_avoided", [])]
    concepts = spec.get("concepts", [])
    palette = spec.get("palette", [])

    light_hex = palette[0]["hex"] if len(palette) > 0 else "#FAF7F2"
    dark_hex = palette[1]["hex"] if len(palette) > 1 else "#141413"
    sig_hex = palette[2]["hex"] if len(palette) > 2 else "#D95D39"

    typo = spec.get("typography", {})
    h_font = typo.get("headline", {}).get("family", "Plus Jakarta Sans")
    b_font = typo.get("body", {}).get("family", "Inter")
    gf_link = google_fonts_url([h_font, b_font])

    cards_html = []
    for idx, c in enumerate(concepts):
        c_id = html.escape(c.get("id", chr(65 + idx)))
        c_title = html.escape(c.get("name", f"Concept {c_id}"))
        c_type = html.escape(c.get("archetype", "Symbol Mark"))
        c_metaphor = html.escape(c.get("metaphor", ""))
        c_risk = html.escape(c.get("honest_risk", "None identified"))
        is_rec = bool(c.get("recommended", idx == 0))
        svg_mark = c.get("svg_mark", "")

        # Save temp svg to audit
        tmp_svg = out_dir / f"_concept_{c_id.lower()}.svg"
        tmp_svg.write_text(svg_mark, encoding="utf-8")
        audit_res = audit_svg_file(str(tmp_svg))
        tmp_svg.unlink(missing_ok=True)

        badge = (
            f'<span class="rec-badge">★ Recommended Direction</span>'
            if is_rec
            else f'<span class="alt-badge">Direction {c_id}</span>'
        )

        cards_html.append(f"""
        <div class="concept-card {'recommended' if is_rec else ''}">
          <div class="card-header">
            <div>
              {badge}
              <h2>{c_id}. {c_title}</h2>
              <div class="archetype-tag">{c_type} · SVG Craft Score: {audit_res['score']}/100 ({audit_res.get('anchors', 0)} anchors)</div>
            </div>
          </div>

          <div class="stage-grid">
            <div class="stage light-stage" style="background:{light_hex}; color:{dark_hex};">
              <div class="stage-svg">{svg_mark}</div>
              <span class="stage-label">1-Color Ink on Canvas</span>
            </div>
            <div class="stage dark-stage" style="background:{dark_hex}; color:{light_hex};">
              <div class="stage-svg">{svg_mark}</div>
              <span class="stage-label" style="color:{light_hex}; opacity:0.65;">Inverted on Dark Ink</span>
            </div>
            <div class="stage sig-stage" style="background:{sig_hex}; color:{light_hex if contrast_ratio(sig_hex, light_hex) >= contrast_ratio(sig_hex, dark_hex) else dark_hex};">
              <div class="stage-svg">{svg_mark}</div>
              <span class="stage-label" style="opacity:0.75;">Signature App Tile</span>
            </div>
          </div>

          <div class="pixel-ladder">
            <div class="ladder-title">Small-Size Survival Ladder (True Pixel Scale)</div>
            <div class="ladder-items">
              <div class="px-item">
                <div class="px-box" style="width:64px; height:64px; background:{light_hex}; color:{dark_hex};">{svg_mark}</div>
                <span>64px</span>
              </div>
              <div class="px-item">
                <div class="px-box" style="width:32px; height:32px; background:{light_hex}; color:{dark_hex};">{svg_mark}</div>
                <span>32px</span>
              </div>
              <div class="px-item">
                <div class="px-box" style="width:16px; height:16px; background:{light_hex}; color:{dark_hex};">{svg_mark}</div>
                <span>16px Favicon</span>
              </div>
              <div class="px-item">
                <div class="px-box" style="width:16px; height:16px; background:{dark_hex}; color:{light_hex};">{svg_mark}</div>
                <span>16px Dark</span>
              </div>
            </div>
          </div>

          <div class="concept-meta">
            <p><strong>Metaphor & Construction:</strong> {c_metaphor}</p>
            <p class="risk-note"><strong>Honest Misread / Risk Check:</strong> {c_risk}</p>
          </div>
        </div>
        """)

    cliches_pills = "".join(f'<span class="cliche-pill">✕ No {c}</span>' for c in cliches_avoided)

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{brand_name} — Logo Concept Checkpoint</title>
  {f'<link rel="stylesheet" href="{gf_link}">' if gf_link else ''}
  <style>
    :root {{
      --canvas: {light_hex};
      --ink: {dark_hex};
      --sig: {sig_hex};
      --font-display: '{h_font}', system-ui, sans-serif;
      --font-body: '{b_font}', system-ui, sans-serif;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #F3F2EE;
      color: #161615;
      font-family: var(--font-body);
      line-height: 1.55;
      padding: 40px 24px 64px;
    }}
    .container {{ max-width: 1240px; margin: 0 auto; }}
    .header {{
      background: #FFFFFF;
      border: 1px solid rgba(20,20,19,0.1);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 28px;
    }}
    .eyebrow {{
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--sig);
      margin-bottom: 8px;
    }}
    h1 {{
      font-family: var(--font-display);
      font-size: 32px;
      letter-spacing: -0.025em;
      margin-bottom: 10px;
    }}
    .positioning {{
      font-size: 17px;
      color: #3D3D3A;
      max-width: 820px;
      margin-bottom: 16px;
    }}
    .cliche-bar {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }}
    .cliche-pill {{
      font-size: 12px;
      background: #FCE8E6;
      color: #A5281B;
      padding: 4px 10px;
      border-radius: 99px;
      font-weight: 600;
    }}
    .concepts-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 24px;
    }}
    .concept-card {{
      background: #FFFFFF;
      border: 1px solid rgba(20,20,19,0.12);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }}
    .concept-card.recommended {{
      border: 2px solid var(--sig);
      box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    }}
    .rec-badge {{
      display: inline-block;
      background: var(--sig);
      color: #FFF;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 99px;
      margin-bottom: 6px;
    }}
    .alt-badge {{
      display: inline-block;
      background: #E8E6DF;
      color: #454540;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 99px;
      margin-bottom: 6px;
    }}
    .concept-card h2 {{
      font-family: var(--font-display);
      font-size: 22px;
      letter-spacing: -0.02em;
    }}
    .archetype-tag {{ font-size: 12px; color: #6E6D68; margin-top: 2px; }}
    .stage-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }}
    .stage {{
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      border: 1px solid rgba(0,0,0,0.08);
    }}
    .stage-svg {{ width: 68%; height: 68%; display: flex; align-items: center; justify-content: center; }}
    .stage-svg svg {{ width: 100%; height: 100%; display: block; }}
    .stage-label {{
      position: absolute;
      bottom: 8px;
      font-size: 10px;
      font-weight: 600;
      opacity: 0.65;
    }}
    .pixel-ladder {{
      background: #F8F7F4;
      border-radius: 10px;
      padding: 14px 16px;
      border: 1px solid rgba(0,0,0,0.06);
    }}
    .ladder-title {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6E6D68; margin-bottom: 10px; }}
    .ladder-items {{ display: flex; align-items: flex-end; gap: 20px; }}
    .px-item {{ display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; color: #555; }}
    .px-box {{ border-radius: 4px; display: flex; align-items: center; justify-content: center; padding: 2px; border: 1px solid rgba(0,0,0,0.1); }}
    .px-box svg {{ width: 100%; height: 100%; display: block; }}
    .concept-meta {{ font-size: 13.5px; color: #2C2C2A; display: flex; flex-direction: column; gap: 8px; }}
    .risk-note {{ color: #6E6D68; font-size: 12.5px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="eyebrow">Concept Checkpoint · {category}</div>
      <h1>{brand_name} — Logo Concept Exploration</h1>
      <p class="positioning">{positioning}</p>
      <div class="cliche-bar">{cliches_pills}</div>
    </div>
    <div class="concepts-grid">
      {''.join(cards_html)}
    </div>
  </div>
</body>
</html>"""

    out_path = out_dir / "concept-checkpoint.html"
    out_path.write_text(html_doc, encoding="utf-8")
    return out_path


def generate_kit_assets(spec: dict, out_dir: Path) -> dict:
    """Generate the 8-Module Brand System Board HTML + SVG variants + Web Manifest + Design Tokens JSON."""
    out_dir.mkdir(parents=True, exist_ok=True)
    audit = audit_brand_spec(spec)

    brand_name = spec.get("brand_name", "Brand")
    tagline = spec.get("tagline", "")
    category = spec.get("category", "Brand Identity System")
    positioning = spec.get("positioning", "")
    metaphor_summary = spec.get("metaphor_summary", "")
    construction_notes = spec.get("construction_notes", [])
    cliches_avoided = spec.get("cliches_avoided", [])
    donts = spec.get("donts", [
        "Never pair chromatic accent colors of similar luminance directly on top of each other without an Ink or Canvas separator.",
        "Never apply unapproved drop shadows, 3D bevels, or multi-stop neon gradients to the primary mark.",
        "Never crowd the mark inside containers with less than 25% symbol-height clear space around all edges."
    ])

    palette = spec.get("palette", [])
    by_role = {c.get("role", "").lower(): c for c in palette}
    canvas_hex = (by_role.get("surface_light") or palette[0])["hex"]
    ink_hex = (by_role.get("surface_dark") or (palette[1] if len(palette) > 1 else palette[0]))["hex"]
    sig_hex = (by_role.get("signature") or (palette[2] if len(palette) > 2 else palette[0]))["hex"]
    sec_hex = (by_role.get("secondary") or (palette[3] if len(palette) > 3 else palette[1]))["hex"]
    acc_hex = (by_role.get("accent") or (palette[4] if len(palette) > 4 else sig_hex))["hex"]
    muted_hex = (by_role.get("muted_neutral") or (palette[5] if len(palette) > 5 else sec_hex))["hex"]

    # Pick optimal foreground on signature color
    on_sig_hex = canvas_hex if contrast_ratio(sig_hex, canvas_hex) >= contrast_ratio(sig_hex, ink_hex) else ink_hex

    svg_mark = spec.get("svg_mark", "")
    svg_lockup = spec.get("svg_lockup", svg_mark)
    svg_seal = spec.get("svg_seal", svg_mark)

    # Export production SVG files
    files_written = {}
    mark_primary_path = out_dir / "logo-mark.svg"
    mark_primary_path.write_text(replace_current_color(svg_mark, sig_hex), encoding="utf-8")
    files_written["logo_mark"] = str(mark_primary_path)

    lockup_primary_path = out_dir / "logo-primary.svg"
    lockup_primary_path.write_text(replace_current_color(svg_lockup, ink_hex), encoding="utf-8")
    files_written["logo_primary"] = str(lockup_primary_path)

    mono_ink_path = out_dir / "logo-monochrome-ink.svg"
    mono_ink_path.write_text(replace_current_color(svg_mark, ink_hex), encoding="utf-8")
    files_written["logo_monochrome_ink"] = str(mono_ink_path)

    inverted_path = out_dir / "logo-inverted-light.svg"
    inverted_path.write_text(replace_current_color(svg_mark, canvas_hex), encoding="utf-8")
    files_written["logo_inverted_light"] = str(inverted_path)

    favicon_path = out_dir / "favicon.svg"
    favicon_path.write_text(replace_current_color(svg_mark, on_sig_hex, bg_hex=sig_hex), encoding="utf-8")
    files_written["favicon"] = str(favicon_path)

    # Export site.webmanifest
    manifest = {
        "name": brand_name,
        "short_name": brand_name,
        "description": positioning,
        "theme_color": sig_hex,
        "background_color": canvas_hex,
        "display": "standalone",
        "icons": [
            {"src": "favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable"}
        ],
    }
    manifest_path = out_dir / "site.webmanifest"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    files_written["webmanifest"] = str(manifest_path)

    # Export W3C / CSS Design Tokens JSON
    typo = spec.get("typography", {})
    h_font = typo.get("headline", {}).get("family", "Plus Jakarta Sans")
    b_font = typo.get("body", {}).get("family", "Inter")
    m_font = typo.get("mono", {}).get("family", "JetBrains Mono")
    scale_ratio = typo.get("scale_ratio", "1.250 (Major Third)")

    tokens = {
        "brand": {
            "name": brand_name,
            "category": category,
            "positioning": positioning,
            "tagline": tagline,
        },
        "color": {
            c.get("role", f"color_{i}"): {
                "$value": c["hex"],
                "$type": "color",
                "name": c.get("name", ""),
                "share": c.get("share", ""),
                "job": c.get("job", ""),
                "contrast_on_canvas": contrast_ratio(c["hex"], canvas_hex),
                "contrast_on_ink": contrast_ratio(c["hex"], ink_hex),
            }
            for i, c in enumerate(palette)
        },
        "typography": {
            "headline": {"family": h_font, "weights": typo.get("headline", {}).get("weights", [600, 700]), "tracking": "-0.025em"},
            "body": {"family": b_font, "weights": typo.get("body", {}).get("weights", [400, 500]), "line_height": 1.6},
            "mono": {"family": m_font, "weights": [400, 600], "tracking": "0.06em"},
            "scale_ratio": scale_ratio,
        },
    }
    tokens_path = out_dir / "brand-tokens.json"
    tokens_path.write_text(json.dumps(tokens, indent=2), encoding="utf-8")
    files_written["brand_tokens"] = str(tokens_path)

    # Build Swatch Cards HTML for Module 05
    swatch_cards = []
    for c in palette:
        c_hex = c["hex"]
        c_name = html.escape(c.get("name", c.get("role", "")))
        c_role = html.escape(c.get("role", "").replace("_", " ").title())
        c_share = html.escape(str(c.get("share", "")))
        c_job = html.escape(c.get("job", ""))
        r, g, b = parse_hex(c_hex)
        h_deg, s_val, l_val = rgb_to_hsl(c_hex)
        cr_c = contrast_ratio(c_hex, canvas_hex)
        cr_i = contrast_ratio(c_hex, ink_hex)
        fg_on_swatch = canvas_hex if cr_c >= cr_i else ink_hex

        badge_c = "AAA" if cr_c >= 7.0 else ("AA Text" if cr_c >= 4.5 else ("AA Large" if cr_c >= 3.0 else "Decorative/Dark Only"))
        badge_i = "AAA" if cr_i >= 7.0 else ("AA Text" if cr_i >= 4.5 else ("AA Large" if cr_i >= 3.0 else "Light Surface Only"))

        swatch_cards.append(f"""
        <div class="swatch-card">
          <div class="swatch-Chip" style="background:{c_hex}; color:{fg_on_swatch};">
            <span class="swatch-role-pill">{c_role}</span>
            <div class="swatch-hex-big">{c_hex.upper()}</div>
            <div class="swatch-share">{c_share}</div>
          </div>
          <div class="swatch-body">
            <h4>{c_name}</h4>
            <div class="swatch-specs">RGB({r}, {g}, {b}) · HSL({int(h_deg)}°, {int(s_val*100)}%, {int(l_val*100)}%)</div>
            <p class="swatch-job">{c_job}</p>
            <div class="wcag-row">
              <span class="wcag-pill">vs Canvas: <strong>{cr_c}:1</strong> ({badge_c})</span>
              <span class="wcag-pill">vs Ink: <strong>{cr_i}:1</strong> ({badge_i})</span>
            </div>
          </div>
        </div>
        """)

    gf_link = google_fonts_url([h_font, b_font, m_font])
    construction_list = "".join(f"<li>{html.escape(n)}</li>" for n in construction_notes)
    donts_list = "".join(f"<li><strong>✕ Don't:</strong> {html.escape(d)}</li>" for d in donts)
    cliche_badges = "".join(f'<span class="anti-slop-tag">Avoided: {html.escape(cl)}</span>' for cl in cliches_avoided)

    board_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(brand_name)} — 8-Module Brand System Board & Asset Kit</title>
  {f'<link rel="stylesheet" href="{gf_link}">' if gf_link else ''}
  <style>
    :root {{
      --canvas: {canvas_hex};
      --ink: {ink_hex};
      --sig: {sig_hex};
      --sec: {sec_hex};
      --acc: {acc_hex};
      --muted: {muted_hex};
      --on-sig: {on_sig_hex};
      --font-display: '{h_font}', system-ui, sans-serif;
      --font-body: '{b_font}', system-ui, sans-serif;
      --font-mono: '{m_font}', monospace;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #ECEAE4;
      color: var(--ink);
      font-family: var(--font-body);
      line-height: 1.55;
      padding: 32px 20px 72px;
    }}
    .board-wrapper {{ max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }}
    .masthead {{
      background: var(--ink);
      color: var(--canvas);
      border-radius: 20px;
      padding: 36px 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 24px;
    }}
    .masthead-eyebrow {{
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--acc);
      margin-bottom: 10px;
    }}
    .masthead h1 {{
      font-family: var(--font-display);
      font-size: 40px;
      letter-spacing: -0.03em;
      line-height: 1.08;
      margin-bottom: 10px;
    }}
    .masthead p {{ max-width: 720px; font-size: 16px; opacity: 0.86; }}
    .audit-score-pill {{
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 12px;
      padding: 14px 20px;
      text-align: right;
      font-family: var(--font-mono);
      font-size: 12px;
    }}
    .audit-score-pill strong {{ display: block; font-size: 22px; color: var(--acc); }}

    .bento-grid {{
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 20px;
    }}
    .module {{
      background: #FFFFFF;
      border-radius: 18px;
      padding: 28px;
      border: 1px solid rgba(20,20,19,0.09);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }}
    .col-7 {{ grid-column: span 7; }}
    .col-5 {{ grid-column: span 5; }}
    .col-6 {{ grid-column: span 6; }}
    .col-12 {{ grid-column: span 12; }}
    @media (max-width: 980px) {{
      .col-7, .col-5, .col-6 {{ grid-column: span 12; }}
    }}
    .mod-head {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(20,20,19,0.08);
      padding-bottom: 10px;
    }}
    .mod-num {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--sig);
    }}
    .mod-title {{
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.015em;
    }}

    /* Module 01: Primary Lockup */
    .hero-lockup-stage {{
      background: var(--canvas);
      color: var(--ink);
      border-radius: 14px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 36px;
      border: 1px solid rgba(20,20,19,0.07);
      position: relative;
    }}
    .hero-lockup-stage svg {{ max-width: 420px; width: 100%; height: auto; max-height: 150px; }}
    .anti-slop-row {{ display: flex; flex-wrap: wrap; gap: 8px; }}
    .anti-slop-tag {{
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 99px;
      background: #F4F3EF;
      color: #55544F;
    }}

    /* Module 02: Construction Grid */
    .blueprint-stage {{
      background: #11161B;
      color: #E2E8F0;
      background-image:
        linear-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.12) 1px, transparent 1px);
      background-size: 20px 20px;
      border-radius: 14px;
      min-height: 210px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px;
      position: relative;
    }}
    .blueprint-stage svg {{ width: 148px; height: 148px; stroke: #38BDF8; }}
    .notes-list {{ padding-left: 18px; font-size: 13.5px; color: #3A3A37; display: flex; flex-direction: column; gap: 6px; }}

    /* Module 03: Pixel Ladder & Seal */
    .ladder-row {{
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      background: var(--canvas);
      padding: 22px;
      border-radius: 14px;
      border: 1px solid rgba(0,0,0,0.06);
      flex-wrap: wrap;
      gap: 16px;
    }}
    .scale-cell {{ display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; }}
    .scale-box {{ display: flex; align-items: center; justify-content: center; border-radius: 6px; padding: 3px; border: 1px dashed rgba(0,0,0,0.18); }}
    .scale-box svg {{ width: 100%; height: 100%; display: block; }}

    /* Module 04: 4-Way Surface Polarity */
    .polarity-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }}
    .polarity-cell {{
      border-radius: 12px;
      height: 126px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 18px;
      position: relative;
      border: 1px solid rgba(0,0,0,0.08);
    }}
    .polarity-cell svg {{ width: 64px; height: 64px; }}
    .polarity-caption {{ position: absolute; bottom: 8px; font-family: var(--font-mono); font-size: 10px; opacity: 0.72; }}

    /* Module 05: Color Swatches */
    .swatches-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
    }}
    .swatch-card {{
      border: 1px solid rgba(20,20,19,0.1);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }}
    .swatch-Chip {{
      height: 112px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .swatch-role-pill {{
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.85;
    }}
    .swatch-hex-big {{ font-family: var(--font-mono); font-size: 18px; font-weight: 700; }}
    .swatch-share {{ font-family: var(--font-mono); font-size: 11px; opacity: 0.8; }}
    .swatch-body {{ padding: 14px; display: flex; flex-direction: column; gap: 6px; background: #FFF; flex: 1; }}
    .swatch-body h4 {{ font-family: var(--font-display); font-size: 15px; }}
    .swatch-specs {{ font-family: var(--font-mono); font-size: 10.5px; color: #666; }}
    .swatch-job {{ font-size: 12.5px; color: #333; flex: 1; }}
    .wcag-row {{ display: flex; flex-direction: column; gap: 4px; margin-top: 6px; padding-top: 8px; border-top: 1px solid #EEE; }}
    .wcag-pill {{ font-family: var(--font-mono); font-size: 10.5px; color: #444; }}

    /* Module 06: Typography */
    .type-specimen-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }}
    @media (max-width: 780px) {{ .type-specimen-grid {{ grid-template-columns: 1fr; }} }}
    .type-card {{
      background: var(--canvas);
      color: var(--ink);
      padding: 22px;
      border-radius: 14px;
      border: 1px solid rgba(0,0,0,0.07);
    }}
    .type-aa {{ font-size: 54px; line-height: 1; margin-bottom: 10px; font-weight: 700; }}
    .type-scale-table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
    .type-scale-table td {{ padding: 10px 6px; border-bottom: 1px solid rgba(0,0,0,0.07); vertical-align: baseline; }}
    .token-label {{ font-family: var(--font-mono); font-size: 11px; color: #666; width: 160px; }}

    /* Module 07: Mockups */
    .mockups-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }}
    @media (max-width: 900px) {{ .mockups-grid {{ grid-template-columns: 1fr; }} }}
    .mockup-card {{
      background: #F7F6F2;
      border-radius: 14px;
      padding: 22px;
      border: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}
    .app-icon-preview {{
      width: 92px;
      height: 92px;
      border-radius: 22px;
      background: var(--sig);
      color: var(--on-sig);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      box-shadow: 0 14px 28px rgba(0,0,0,0.14);
      margin: 12px auto 4px;
    }}
    .app-icon-preview svg {{ width: 100%; height: 100%; }}
    .bcard-preview {{
      background: var(--ink);
      color: var(--canvas);
      border-radius: 10px;
      padding: 20px;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    }}
    .bcard-top {{ display: flex; justify-content: space-between; align-items: center; }}
    .bcard-top svg {{ width: 36px; height: 36px; color: var(--sig); }}
    .ui-hero-preview {{
      background: var(--canvas);
      color: var(--ink);
      border-radius: 10px;
      padding: 16px;
      border: 1px solid rgba(0,0,0,0.1);
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}
    .ui-nav {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.07); padding-bottom: 8px; }}
    .ui-nav-logo {{ height: 22px; display: flex; align-items: center; gap: 6px; font-family: var(--font-display); font-weight: 700; font-size: 13px; }}
    .ui-nav-logo svg {{ width: 20px; height: 20px; color: var(--sig); }}
    .ui-cta {{
      background: var(--sig);
      color: var(--on-sig);
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
      display: inline-block;
      align-self: flex-start;
    }}
  </style>
</head>
<body>
  <div class="board-wrapper">
    <!-- MASTHEAD -->
    <header class="masthead">
      <div>
        <div class="masthead-eyebrow">Brand Identity System Board · {html.escape(category)}</div>
        <h1>{html.escape(brand_name)}</h1>
        <p>{html.escape(positioning)}</p>
      </div>
      <div class="audit-score-pill">
        VERIFIED CONTRAST & CRAFT AUDIT
        <strong>{audit['score']}/100</strong>
        <span>Ink vs Canvas: {audit['contrast_matrix'].get('ink_on_canvas', 'N/A')}:1</span>
      </div>
    </header>

    <div class="bento-grid">
      <!-- MODULE 01: PRIMARY LOCKUP -->
      <section class="module col-7">
        <div class="mod-head">
          <span class="mod-num">Module 01</span>
          <span class="mod-title">Primary Lockup & Positioning</span>
        </div>
        <div class="hero-lockup-stage" style="color: var(--ink);">
          {svg_lockup}
        </div>
        <p style="font-size:14px; color:#3A3A37;"><strong>Metaphor & Strategic Direction:</strong> {html.escape(metaphor_summary)}</p>
        <div class="anti-slop-row">{cliche_badges}</div>
      </section>

      <!-- MODULE 02: SYMBOL CONSTRUCTION -->
      <section class="module col-5">
        <div class="mod-head">
          <span class="mod-num">Module 02</span>
          <span class="mod-title">Symbol Construction & Optical Craft</span>
        </div>
        <div class="blueprint-stage" style="color:#38BDF8;">
          {svg_mark}
        </div>
        <ul class="notes-list">
          {construction_list}
        </ul>
      </section>

      <!-- MODULE 03: SMALL-SIZE PIXEL LADDER & SEAL -->
      <section class="module col-6">
        <div class="mod-head">
          <span class="mod-num">Module 03</span>
          <span class="mod-title">Small-Size Pixel Ladder & Badge Seal</span>
        </div>
        <div class="ladder-row">
          <div class="scale-cell">
            <div class="scale-box" style="width:72px; height:72px; color:var(--ink);">{svg_seal}</div>
            <span>72px Seal</span>
          </div>
          <div class="scale-cell">
            <div class="scale-box" style="width:64px; height:64px; color:var(--ink);">{svg_mark}</div>
            <span>64px App</span>
          </div>
          <div class="scale-cell">
            <div class="scale-box" style="width:32px; height:32px; color:var(--ink);">{svg_mark}</div>
            <span>32px UI</span>
          </div>
          <div class="scale-cell">
            <div class="scale-box" style="width:16px; height:16px; color:var(--ink);">{svg_mark}</div>
            <span>16px Tab</span>
          </div>
          <div class="scale-cell">
            <div class="scale-box" style="width:16px; height:16px; background:var(--sig); color:var(--on-sig); border:none;">{svg_mark}</div>
            <span>16px Tile</span>
          </div>
        </div>
        <p style="font-size:12.5px; color:#5A5A55;">Engineered with a minimum 1/48th canvas gap floor so inner counters never plug up at 16×16 browser favicon resolution.</p>
      </section>

      <!-- MODULE 04: SURFACE POLARITY MATRIX -->
      <section class="module col-6">
        <div class="mod-head">
          <span class="mod-num">Module 04</span>
          <span class="mod-title">4-Way Surface Polarity & Monochrome Matrix</span>
        </div>
        <div class="polarity-grid">
          <div class="polarity-cell" style="background:var(--canvas); color:var(--sig);">
            {svg_mark}
            <span class="polarity-caption" style="color:var(--ink);">01 · Signature on Light Canvas</span>
          </div>
          <div class="polarity-cell" style="background:var(--ink); color:var(--canvas);">
            {svg_mark}
            <span class="polarity-caption" style="color:var(--canvas);">02 · Inverted on Dark Ink</span>
          </div>
          <div class="polarity-cell" style="background:var(--sig); color:var(--on-sig);">
            {svg_mark}
            <span class="polarity-caption" style="color:var(--on-sig);">03 · High-Impact Brand Stage</span>
          </div>
          <div class="polarity-cell" style="background:#FFFFFF; color:#111111;">
            {svg_mark}
            <span class="polarity-caption" style="color:#111111;">04 · 1-Color Stamp / Emboss Fallback</span>
          </div>
        </div>
      </section>

      <!-- MODULE 05: COLOR SYSTEM -->
      <section class="module col-12">
        <div class="mod-head">
          <span class="mod-num">Module 05</span>
          <span class="mod-title">Perceptual Color System & WCAG 2.1 Contrast Verification (60-30-10 Architecture)</span>
        </div>
        <div class="swatches-grid">
          {''.join(swatch_cards)}
        </div>
      </section>

      <!-- MODULE 06: TYPOGRAPHY -->
      <section class="module col-12">
        <div class="mod-head">
          <span class="mod-num">Module 06</span>
          <span class="mod-title">Typographic System & Modular Scale ({html.escape(scale_ratio)})</span>
        </div>
        <div class="type-specimen-grid">
          <div class="type-card">
            <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--sig); margin-bottom:6px;">Primary Display / Headlines</div>
            <div class="type-aa" style="font-family:var(--font-display);">Aa Bb Cc 123</div>
            <h3 style="font-family:var(--font-display); font-size:22px; margin-bottom:6px;">{html.escape(h_font)}</h3>
            <p style="font-size:13px; color:#555;">{html.escape(typo.get('headline', {}).get('rationale', ' tight tracking (-0.025em) at display sizes for authoritative graphic presence.'))}</p>
          </div>
          <div class="type-card">
            <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--sig); margin-bottom:6px;">Secondary Body / UI & Monospace Labels</div>
            <div class="type-aa" style="font-family:var(--font-body); font-weight:400;">Aa Bb Cc 0123</div>
            <h3 style="font-family:var(--font-body); font-size:22px; margin-bottom:6px;">{html.escape(b_font)} <span style="font-family:var(--font-mono); font-size:13px; color:#666;">+ {html.escape(m_font)}</span></h3>
            <p style="font-size:13px; color:#555;">{html.escape(typo.get('body', {}).get('rationale', 'Generous x-height and open apertures for effortless reading at 16px body scale.'))}</p>
          </div>
        </div>
        <table class="type-scale-table">
          <tr>
            <td class="token-label">Display H1 · 40px / -0.03em</td>
            <td style="font-family:var(--font-display); font-size:32px; font-weight:700; letter-spacing:-0.03em;">{html.escape(brand_name)} — {html.escape(tagline or 'Built for clarity at every scale.')}</td>
          </tr>
          <tr>
            <td class="token-label">Section H2 · 24px / -0.015em</td>
            <td style="font-family:var(--font-display); font-size:22px; font-weight:600; letter-spacing:-0.015em;"> Intentional geometry that survives from 16px favicons to physical signage.</td>
          </tr>
          <tr>
            <td class="token-label">Body Regular · 16px / 1.6</td>
            <td style="font-family:var(--font-body); font-size:15.5px;">{html.escape(positioning)}</td>
          </tr>
          <tr>
            <td class="token-label">Eyebrow / Mono · 12px / +0.1em</td>
            <td style="font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:var(--sig);">SYSTEM SPECIFICATION · TOKEN VERIFIED · WCAG 2.1 AA/AAA</td>
          </tr>
        </table>
      </section>

      <!-- MODULE 07: REAL-WORLD MOCKUPS -->
      <section class="module col-7">
        <div class="mod-head">
          <span class="mod-num">Module 07</span>
          <span class="mod-title">Contextual Touchpoint Mockups</span>
        </div>
        <div class="mockups-grid">
          <div class="mockup-card">
            <span style="font-family:var(--font-mono); font-size:10.5px; text-transform:uppercase; color:#666;">01 · iOS / Web App Tile</span>
            <div class="app-icon-preview">
              {svg_mark}
            </div>
            <div style="text-align:center; font-weight:600; font-size:13px;">{html.escape(brand_name)}</div>
          </div>

          <div class="mockup-card">
            <span style="font-family:var(--font-mono); font-size:10.5px; text-transform:uppercase; color:#666;">02 · Stationery / Card</span>
            <div class="bcard-preview">
              <div class="bcard-top">
                {svg_mark}
                <span style="font-family:var(--font-mono); font-size:9px; opacity:0.65;">{html.escape(brand_name.upper())}</span>
              </div>
              <div>
                <div style="font-family:var(--font-display); font-size:14px; font-weight:700;">{html.escape(brand_name)}</div>
                <div style="font-size:10.5px; opacity:0.75;">{html.escape(tagline or category)}</div>
              </div>
            </div>
          </div>

          <div class="mockup-card">
            <span style="font-family:var(--font-mono); font-size:10.5px; text-transform:uppercase; color:#666;">03 · Product Header</span>
            <div class="ui-hero-preview">
              <div class="ui-nav">
                <div class="ui-nav-logo">{svg_mark} <span>{html.escape(brand_name)}</span></div>
                <span style="font-size:10px; opacity:0.6;">Docs · Pricing</span>
              </div>
              <div style="margin: 8px 0;">
                <div style="font-family:var(--font-display); font-size:14px; font-weight:700; line-height:1.2;">{html.escape(tagline or brand_name)}</div>
              </div>
              <span class="ui-cta">Get Started →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- MODULE 08: GUARDRAILS & ASSET MANIFEST -->
      <section class="module col-5">
        <div class="mod-head">
          <span class="mod-num">Module 08</span>
          <span class="mod-title">Usage Guardrails & Exported Kit</span>
        </div>
        <ul class="notes-list" style="list-style:none; padding-left:0;">
          {donts_list}
        </ul>
        <div style="background:#F6F5F0; padding:14px; border-radius:10px; font-family:var(--font-mono); font-size:11.5px; display:flex; flex-direction:column; gap:4px;">
          <strong style="color:var(--ink);">Exported Production Bundle:</strong>
          <span>• logo-primary.svg (Horizontal Lockup)</span>
          <span>• logo-mark.svg (Standalone Symbol)</span>
          <span>• logo-monochrome-ink.svg (1-Color Stamp)</span>
          <span>• logo-inverted-light.svg (Dark Mode Mark)</span>
          <span>• favicon.svg + site.webmanifest</span>
          <span>• brand-tokens.json (W3C Design Tokens)</span>
        </div>
      </section>
    </div>
  </div>
</body>
</html>"""

    board_path = out_dir / "brand-board.html"
    board_path.write_text(board_html, encoding="utf-8")
    files_written["brand_board_html"] = str(board_path)
    return files_written


def main():
    parser = argparse.ArgumentParser(description="Generate Brand Concept Checkpoints or 8-Module Brand System Boards.")
    parser.add_argument("--mode", choices=["checkpoint", "kit"], required=True, help="Generation mode: 'checkpoint' or 'kit'")
    parser.add_argument("--spec", required=True, help="Path to JSON specification file")
    parser.add_argument("--out-dir", required=True, help="Output directory for generated files")
    args = parser.parse_args()

    spec_path = Path(args.spec)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    if args.mode == "checkpoint":
        out_file = generate_checkpoint_html(spec, out_dir)
        print(json.dumps({"status": "ok", "mode": "checkpoint", "file": str(out_file)}, indent=2))
    else:
        written = generate_kit_assets(spec, out_dir)
        print(json.dumps({"status": "ok", "mode": "kit", "files": written}, indent=2))


if __name__ == "__main__":
    main()
