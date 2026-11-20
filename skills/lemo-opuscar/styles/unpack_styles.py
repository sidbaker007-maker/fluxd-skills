#!/usr/bin/env python3
"""Materializes all 99 styles/<slug>/STYLE.md and style.json directories from styles-catalog.json."""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "styles-catalog.json"), "r", encoding="utf-8") as fp:
    cat = json.load(fp)

for slug, data in cat.items():
    sdir = os.path.join(here, slug)
    os.makedirs(sdir, exist_ok=True)
    if "style_md" in data:
        with open(os.path.join(sdir, "STYLE.md"), "w", encoding="utf-8") as out:
            out.write(data["style_md"])
    if "demo_md" in data:
        with open(os.path.join(sdir, "DEMO.md"), "w", encoding="utf-8") as out:
            out.write(data["demo_md"])
    if "meta" in data:
        with open(os.path.join(sdir, "style.json"), "w", encoding="utf-8") as out:
            json.dump(data["meta"], out, indent=2)
print(f"Materialized {len(cat)} style folders in {here}")
