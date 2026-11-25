#!/usr/bin/env python3
"""Materializes all 1,443 SVG/JS/HTML/CSS/JSON/MJS files in assets/ from assets-code-catalog.json,
and optionally downloads binary demo photos/textures from Leonxlnx/taste-skill with --with-media."""
import json, os, sys, urllib.request

here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "assets-code-catalog.json"), "r", encoding="utf-8") as fp:
    cat = json.load(fp)

for rel_p, content in cat.items():
    out_p = os.path.join(here, rel_p)
    os.makedirs(os.path.dirname(out_p), exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as out:
        out.write(content)
print(f"Materialized {len(cat)} code/SVG/template asset files in {here}")

if "--with-media" in sys.argv:
    ua = "Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)"
    with open(os.path.join(here, "assets-media-manifest.json"), "r", encoding="utf-8") as fp:
        media = json.load(fp)
    base_url = "https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/assets/"
    fetched = 0
    for rel_p in media:
        out_p = os.path.join(here, rel_p)
        if os.path.exists(out_p):
            continue
        os.makedirs(os.path.dirname(out_p), exist_ok=True)
        req = urllib.request.Request(base_url + rel_p, headers={"User-Agent": ua})
        with urllib.request.urlopen(req, timeout=30) as resp, open(out_p, "wb") as out:
            out.write(resp.read())
        fetched += 1
    print(f"Downloaded {fetched} binary media files into {here}")
