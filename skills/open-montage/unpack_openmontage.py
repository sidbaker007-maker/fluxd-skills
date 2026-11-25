#!/usr/bin/env python3
"""Materializes the full OpenMontage 3-layer studio tree (pipeline_defs/, skills/, .agents/skills/, tools/, lib/, styles/, schemas/, remotion-composer/, ink-theater/) from openmontage-catalog.json."""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "openmontage-catalog.json"), "r", encoding="utf-8") as fp:
    cat = json.load(fp)

for rel_p, content in cat.items():
    out_p = os.path.join(here, rel_p)
    os.makedirs(os.path.dirname(out_p), exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as out:
        out.write(content)
print(f"Materialized {len(cat)} OpenMontage files in {here}")
