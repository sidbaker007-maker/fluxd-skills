#!/usr/bin/env python3
"""Restores .mjs copies alongside .js scripts in scripts/ for tools expecting .mjs extensions."""
import os, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
for p in glob.glob(os.path.join(here, "*.js")):
    mjs_p = p[:-3] + ".mjs"
    if not os.path.exists(mjs_p):
        shutil.copy2(p, mjs_p)
print("Restored .mjs script aliases in", here)
