#!/usr/bin/env python3
"""Materializes the full 542-file BMad Method v7 tree (skills/, tools/, docs/) from bmad-catalog.json."""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "bmad-catalog.json"), "r", encoding="utf-8") as fp:
    cat = json.load(fp)

for rel_p, content in cat.items():
    out_p = os.path.join(here, rel_p)
    os.makedirs(os.path.dirname(out_p), exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as out:
        out.write(content)
print(f"Materialized {len(cat)} BMad Method files in {here}")
