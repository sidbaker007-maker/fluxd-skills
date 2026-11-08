#!/usr/bin/env python3
"""
Moving Image Archive (https://www.movingimagearchive.com/) Public-Domain Footage Fetcher
for FLUXD Content Director & Motion Designer.

Uses Moving Image Archive's JSON endpoints (see JoaquimCassano/mcp-movingimagearchive):
  - POST https://www.movingimagearchive.com/api/search
    Body: { "query": "<visual description>", "color": "", "aspectRatio": "", "offset": 0 }
  - GET  https://www.movingimagearchive.com/api/clips?color=&aspectRatio=&offset=0
  - GET  https://www.movingimagearchive.com/api/clips/<id>/download  (redirects to shot .mp4)

Modes:
  1. Search & download a shot by visual description:
     python3 scripts/fetch_archive_footage.py --query "vintage film projector beam" --out assets/broll-01.mp4
  2. Auto-populate all beats in a project directory (reads `archiveQuery` from script.json / video.json):
     python3 scripts/fetch_archive_footage.py <work_dir> --auto
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

API_BASE = "https://www.movingimagearchive.com"
UA = "Mozilla/5.0 (X11; Linux x86_64) FLUXD-MotionDesigner/2.0"

CURATED_COLLECTIONS = [
    "animated-maps",
    "film-countdowns",
    "film-grain",
    "frames",
    "glowing-lines",
    "objects-on-black",
    "pale-blue-dot",
    "small-against-everything",
    "technology",
    "technology-cameras-and-photography",
    "technology-computers-and-interfaces",
    "technology-electricity-and-electronics",
    "technology-machines-and-manufacturing",
    "technology-science-and-instruments",
    "technology-sound-and-recording",
    "technology-space-and-flight",
    "technology-television-and-broadcasting",
    "technology-transport-and-navigation",
    "typography-over-the-ages",
]


def search_shots(query: str, color: str = "", aspect_ratio: str = "", year_min=None, year_max=None, offset: int = 0) -> list:
    url = f"{API_BASE}/api/search"
    payload = {
        "query": query,
        "color": color,
        "aspectRatio": aspect_ratio,
        "offset": offset,
    }
    if year_min is not None:
        payload["yearMin"] = int(year_min)
    if year_max is not None:
        payload["yearMax"] = int(year_max)

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": UA, "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    shots = data.get("clips") or data.get("shots") or data.get("results") or (data if isinstance(data, list) else [])
    out = []
    for s in shots:
        cid = s.get("id") or s.get("clipId") or s.get("_id")
        if not cid:
            continue
        out.append({
            "id": cid,
            "title": s.get("title") or s.get("sourceTitle") or s.get("description") or f"Shot {cid}",
            "year": s.get("year"),
            "durationSec": s.get("duration") or s.get("durationSec"),
            "downloadUrl": s.get("clipDownloadUrl") or f"{API_BASE}/api/clips/{cid}/download",
            "sourceSlug": s.get("sourceSlug") or s.get("slug"),
        })
    return out


def download_shot(download_url: str, dest_path: Path) -> bool:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(download_url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as resp:
        dest_path.write_bytes(resp.read())
    return dest_path.exists() and dest_path.stat().st_size > 1024


def auto_populate_project(work_dir: Path) -> int:
    vfile = work_dir / "video.json"
    count = 0
    if vfile.exists():
        v = json.loads(vfile.read_text(encoding="utf-8"))
        for i, sc in enumerate(v.get("scenes", [])):
            q = sc.get("archiveQuery")
            if not q:
                continue
            target_rel = sc.get("bgVideo") or f"assets/archive-s{i+1:02d}.mp4"
            target_abs = work_dir / target_rel
            if not target_abs.exists():
                try:
                    hits = search_shots(q)
                    if hits and download_shot(hits[0]["downloadUrl"], target_abs):
                        sc["bgVideo"] = target_rel
                        sc.setdefault("source", f"Moving Image Archive ({hits[0]['title']})")
                        count += 1
                        print(f"Downloaded [{q}] -> {target_rel}")
                except Exception as exc:
                    print(f"Warning: could not fetch archive shot for {q!r}: {exc}", file=sys.stderr)
        vfile.write_text(json.dumps(v, indent=2), encoding="utf-8")
    return count


def main():
    parser = argparse.ArgumentParser(description="Search and download public-domain archival shots from movingimagearchive.com")
    parser.add_argument("work_dir", nargs="?", default=".", help="Project working directory")
    parser.add_argument("--query", "-q", type=str, default=None, help="Visual shot description to search")
    parser.add_argument("--color", type=str, default="", help="Color filter (e.g. bw, color)")
    parser.add_argument("--out", "-o", type=Path, default=None, help="Output MP4 file path")
    parser.add_argument("--auto", action="store_true", help="Auto-fetch shots for all scenes with archiveQuery in video.json")
    parser.add_argument("--list-collections", action="store_true", help="List the 24 curated Moving Image Archive collections")
    args = parser.parse_args()

    if args.list_collections:
        print(json.dumps(CURATED_COLLECTIONS, indent=2))
        return

    if args.auto:
        n = auto_populate_project(Path(args.work_dir))
        print(f"Auto-populated {n} archival footage clips.")
        return

    if args.query:
        shots = search_shots(args.query, color=args.color)
        if not shots:
            print(f"No shots found for query: {args.query}")
            sys.exit(1)
        if args.out:
            ok = download_shot(shots[0]["downloadUrl"], args.out)
            print(f"Downloaded {shots[0]['title']} ({shots[0]['year']}) -> {args.out} (ok={ok})")
        else:
            print(json.dumps(shots[:10], indent=2))


if __name__ == "__main__":
    main()
