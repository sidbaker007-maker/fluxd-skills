#!/usr/bin/env python3
"""Materializes all 238 example-*.html files in assets/ from examples-catalog.json."""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "examples-catalog.json"), "r", encoding="utf-8") as fp:
    cat = json.load(fp)
for fname, content in cat.items():
    with open(os.path.join(here, fname), "w", encoding="utf-8") as out:
        out.write(content)
print(f"Materialized {len(cat)} example-*.html files in {here}")
