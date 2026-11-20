#!/usr/bin/env python3
"""Search, verify licences, fetch, and log public-domain / CC0 / CC BY archival material
from Wikimedia Commons, Internet Archive, and NASA Images API.
Writes provenance records to SOURCES.jsonl and generates SOURCES.md.
"""
import sys
import os
import json
import urllib.parse
import urllib.request
from datetime import datetime

SOURCES_JSONL = "SOURCES.jsonl"
SOURCES_MD = "SOURCES.md"

def search_commons(query, limit=10):
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&list=search"
        f"&srsearch={urllib.parse.quote(query)}&srnamespace=6&srlimit={limit}&format=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "LemoOpuscar/2.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    for item in data.get("query", {}).get("search", []):
        print(f"commons\t{item['title']}\thttps://commons.wikimedia.org/wiki/{urllib.parse.quote(item['title'])}")

def search_nasa(query, limit=10):
    url = f"https://images-api.nasa.gov/search?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={"User-Agent": "LemoOpuscar/2.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    items = data.get("collection", {}).get("items", [])[:limit]
    for it in items:
        d = (it.get("data") or [{}])[0]
        nasa_id = d.get("nasa_id", "")
        title = d.get("title", "")
        print(f"nasa\t{nasa_id}\t{title}\thttps://images.nasa.gov/details/{nasa_id}")

def search_archive(query, limit=10):
    url = (
        "https://archive.org/advancedsearch.php?"
        f"q={urllib.parse.quote(query)}&fl[]=identifier,title,licenseurl,year&rows={limit}&output=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "LemoOpuscar/2.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    for doc in data.get("response", {}).get("docs", []):
        ident = doc.get("identifier", "")
        title = doc.get("title", "")
        lic = doc.get("licenseurl", "check-page")
        print(f"archive\t{ident}\t{lic}\t{title}\thttps://archive.org/details/{ident}")

def mark_used(name, usage_window):
    entries = []
    if os.path.exists(SOURCES_JSONL):
        with open(SOURCES_JSONL, "r", encoding="utf-8") as f:
            entries = [json.loads(line) for line in f if line.strip()]
    updated = False
    for e in entries:
        if e.get("name") == name or e.get("file") == name:
            e["used"] = usage_window
            updated = True
    if not updated:
        entries.append({"name": name, "used": usage_window, "updated_at": datetime.utcnow().isoformat()})
    with open(SOURCES_JSONL, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"Recorded usage for {name}: {usage_window}")

def write_md():
    entries = []
    if os.path.exists(SOURCES_JSONL):
        with open(SOURCES_JSONL, "r", encoding="utf-8") as f:
            entries = [json.loads(line) for line in f if line.strip()]
    lines = ["# Archival & Media Sources (SOURCES.md)", "", "| Name / File | Title | Author / Holder | Licence | Source URL | Used Window |", "| --- | --- | --- | --- | --- | --- |"]
    for e in entries:
        lines.append(
            f"| `{e.get('name', e.get('file', ''))}` | {e.get('title', '')} | {e.get('author', '')} | {e.get('license', '')} | {e.get('url', '')} | {e.get('used', '')} |"
        )
    with open(SOURCES_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Wrote {SOURCES_MD} ({len(entries)} items)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: footage.py [search <commons|archive|nasa> <query> | used <name> <window> | md]")
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "search" and len(sys.argv) >= 4:
        src, q = sys.argv[2], " ".join(sys.argv[3:])
        if src == "commons": search_commons(q)
        elif src == "nasa": search_nasa(q)
        elif src == "archive": search_archive(q)
    elif cmd == "used" and len(sys.argv) >= 4:
        mark_used(sys.argv[2], sys.argv[3])
    elif cmd == "md":
        write_md()
