#!/usr/bin/env python3
"""
Unified Movie Footage & Public-Domain Archival Motion-Picture Grabber
(`fetch_archive_footage.py` / `footage_harvester.py`) for FLUXD Content Director & Motion Designer.

Supports 5 Footage & Asset Sources:
1. Moving Image Archive (`--source mia` or `archiveQuery` in script.json / video.json):
   - Queries POST https://www.movingimagearchive.com/api/search across 24 curated collections
   - Downloads direct .mp4 shots from https://www.movingimagearchive.com/api/clips/<id>/download
2. Movie & TV Dialogue / Scene Clip Grabber (`--source movie` / `--dialogue` or `movieClipQuery` / `dialogueQuery`):
   - Searches GetYarn.io (`https://getyarn.io/yarn-find?text=<phrase>`) and downloads direct movie clips
     from `https://y.yarn.co/<uuid>.mp4`
   - Generates instant lookup manifests for PlayPhrase.me, Clip.Cafe, and QuoDB
3. Internet Archive / Prelinger / NASA Motion Pictures (`--source ia` or `iaQuery`, plus automatic fallback for `archiveQuery`):
   - Queries `https://archive.org/advancedsearch.php` (`mediatype:movies`), resolves `.mp4` streams in
     `https://archive.org/metadata/<id>`, and uses `ffmpeg -ss <start> -i <remote_mp4_url> -t <dur>` to
     stream-slice only the exact 4-8s window over HTTP without downloading gigabytes
4. YouTube / Movie Scene & Trailer Timestamp Slicer (`--source ytslice` or `movieClipUrl` + `movieClipSection`):
   - Wraps `yt-dlp --download-sections "*MM:SS-MM:SS" --force-keyframes-at-cuts` to grab exact 1080p movie
     scenes, trailers, or documentary clips
5. Wikimedia Commons Historical Video & Official Brand/Publisher Logos (`--source wikimedia` / `--logo`):
   - Queries `https://commons.wikimedia.org/w/api.php` for public-domain historical video clips or
     transparent SVG/PNG publisher & institution logos
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.parse

BLACKLIST_TERMS = {
    "sex", "madness", "exploitation", "burlesque", "nudie", "strip", "reefer",
    "cocaine", "marihuana", "sinners", "harlot", "bloopers", "outtakes",
    "artists corporation", "test pattern", "color bars", "leader", "countdown"
}

def is_safe_relevant_item(title: str, description: str, query: str) -> bool:
    blob = f"{title} {description}".lower()
    for bad in BLACKLIST_TERMS:
        if bad in blob:
            return False
    q_tokens = [t.lower() for t in query.split() if len(t) >= 4 and t.lower() not in {"archive", "vintage", "footage", "india", "film", "clip", "video"}]
    if not q_tokens:
        return True
    return any(tok in blob for tok in q_tokens)

import urllib.request
from pathlib import Path

API_BASE = "https://www.movingimagearchive.com"
UA = "Mozilla/5.0 (X11; Linux x86_64) FLUXD-MotionDesigner/2.5"

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


def http_get_text(url: str, timeout: int = 15) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def http_get_json(url: str, headers: dict = None, timeout: int = 15) -> dict:
    hdrs = {"User-Agent": UA, "Accept": "application/json"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def download_shot(download_url: str, dest_path: Path, timeout: int = 35) -> bool:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(download_url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp, open(dest_path, "wb") as f:
        shutil.copyfileobj(resp, f)
    return dest_path.exists() and dest_path.stat().st_size > 1024


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
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    shots = data.get("clips") or data.get("shots") or data.get("results") or (data if isinstance(data, list) else [])
    out = []
    for s in shots:
        cid = s.get("id") or s.get("clipId") or s.get("_id")
        if not cid:
            continue
        out.append({
            "source": "Moving Image Archive",
            "id": cid,
            "title": s.get("title") or s.get("sourceTitle") or s.get("description") or f"Shot {cid}",
            "year": s.get("year"),
            "durationSec": s.get("duration") or s.get("durationSec"),
            "downloadUrl": s.get("clipDownloadUrl") or f"{API_BASE}/api/clips/{cid}/download",
            "sourceSlug": s.get("sourceSlug") or s.get("slug"),
        })
    return out


def build_movie_dialogue_links(phrase: str) -> dict:
    q_plus = urllib.parse.quote_plus(phrase)
    q_raw = urllib.parse.quote(phrase)
    return {
        "phrase": phrase,
        "getyarn_search": f"https://getyarn.io/yarn-find?text={q_plus}",
        "playphrase_search": f"https://www.playphrase.me/#/search?q={q_plus}",
        "clipcafe_search": f"https://clip.cafe/?s=%22{q_plus}%22",
        "quodb_search": f"https://www.quodb.com/search/{q_raw}",
    }


def search_and_grab_movie_clip(phrase: str, out_path: Path = None, max_results: int = 5) -> dict:
    links = build_movie_dialogue_links(phrase)
    clips = []
    try:
        html = http_get_text(links["getyarn_search"])
        uuids = []
        for m in re.finditer(r'/yarn-clip/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', html):
            u = m.group(1)
            if u not in uuids:
                uuids.append(u)
            if len(uuids) >= max_results:
                break
        for u in uuids:
            clips.append({
                "source": "GetYarn Movie Clip",
                "uuid": u,
                "pageUrl": f"https://getyarn.io/yarn-clip/{u}",
                "downloadUrl": f"https://y.yarn.co/{u}.mp4",
            })
    except Exception as exc:
        links["warning"] = f"Live movie clip scrape skipped or offline ({exc}); use search URLs directly."

    downloaded = None
    if out_path and clips:
        for clip in clips:
            try:
                if download_shot(clip["downloadUrl"], out_path):
                    downloaded = str(out_path)
                    break
            except Exception:
                continue

    return {
        "mode": "movie-dialogue",
        "phrase": phrase,
        "portals": links,
        "matches": clips,
        "downloaded": downloaded,
    }


def search_and_slice_internet_archive(
    query: str,
    collection: str = None,
    start: str = "00:00:05",
    dur: float = 6.0,
    out_path: Path = None,
    rows: int = 5,
) -> dict:
    q_parts = [f"({query})", "mediatype:(movies)"]
    if collection:
        q_parts.append(f"collection:({collection})")
    params = urllib.parse.urlencode({
        "q": " AND ".join(q_parts),
        "fl[]": ["identifier", "title", "year", "creator"],
        "sort[]": "downloads desc",
        "rows": str(rows),
        "page": "1",
        "output": "json",
    }, doseq=True)
    api_url = f"https://archive.org/advancedsearch.php?{params}"

    results = []
    try:
        data = http_get_json(api_url)
        for d in data.get("response", {}).get("docs", []):
            ident = d.get("identifier")
            if not ident:
                continue
            mp4_url = None
            try:
                meta = http_get_json(f"https://archive.org/metadata/{ident}")
                for f in meta.get("files", []):
                    name = f.get("name", "")
                    if name.lower().endswith(".mp4") and "ia_thumb" not in name.lower():
                        mp4_url = f"https://archive.org/download/{ident}/{urllib.parse.quote(name)}"
                        break
            except Exception:
                pass
            results.append({
                "source": "Internet Archive",
                "identifier": ident,
                "title": d.get("title") or ident,
                "year": d.get("year"),
                "detailsUrl": f"https://archive.org/details/{ident}",
                "downloadUrl": mp4_url,
            })
    except Exception as exc:
        return {"mode": "internet-archive", "query": query, "error": str(exc), "results": []}

    sliced = None
    if out_path and results:
        best = next((r for r in results if r.get("downloadUrl")), None)
        if best:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            cmd = [
                "ffmpeg", "-y", "-v", "error",
                "-ss", str(start),
                "-i", best["downloadUrl"],
                "-t", str(dur),
                "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                "-c:a", "aac", "-movflags", "+faststart",
                str(out_path),
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
            if proc.returncode == 0 and out_path.exists() and out_path.stat().st_size > 1024:
                sliced = str(out_path)

    return {
        "mode": "internet-archive",
        "query": query,
        "collection": collection or "all_movies",
        "results": results,
        "downloaded": sliced,
    }


def slice_youtube_movie_scene(url: str, section: str, out_path: Path) -> dict:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sec_arg = section if section.startswith("*") else f"*{section}"
    cmd = [
        "yt-dlp",
        "--download-sections", sec_arg,
        "--force-keyframes-at-cuts",
        "-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b",
        "--merge-output-format", "mp4",
        "-o", str(out_path),
        url,
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        ok = proc.returncode == 0 and out_path.exists()
        return {
            "mode": "ytslice",
            "url": url,
            "section": sec_arg,
            "command": " ".join(cmd),
            "success": ok,
            "downloaded": str(out_path) if ok else None,
        }
    except Exception as exc:
        return {
            "mode": "ytslice",
            "url": url,
            "section": sec_arg,
            "command": " ".join(cmd),
            "success": False,
            "note": f"yt-dlp slice skipped ({exc})",
        }


def search_wikimedia(query: str, media_type: str = "video", out_path: Path = None) -> dict:
    search_q = f"{query} logo filetype:svg|png" if media_type == "logo" else f"{query} filetype:video"
    params = urllib.parse.urlencode({
        "action": "query",
        "generator": "search",
        "gsrsearch": search_q,
        "gsrnamespace": "6",
        "gsrlimit": "5",
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
        "iiurlwidth": "1024",
        "format": "json",
    })
    api_url = f"https://commons.wikimedia.org/w/api.php?{params}"
    items = []
    try:
        data = http_get_json(api_url)
        for _, p in data.get("query", {}).get("pages", {}).items():
            ii = (p.get("imageinfo") or [{}])[0]
            u = ii.get("thumburl") or ii.get("url")
            if u:
                items.append({
                    "title": p.get("title"),
                    "downloadUrl": u if media_type == "logo" else ii.get("url"),
                    "mime": ii.get("mime"),
                    "descriptionUrl": ii.get("descriptionurl"),
                })
    except Exception as exc:
        return {"mode": f"wikimedia-{media_type}", "query": query, "error": str(exc), "items": []}

    saved = None
    if out_path and items:
        try:
            if download_shot(items[0]["downloadUrl"], out_path):
                saved = str(out_path)
        except Exception:
            pass
    return {"mode": f"wikimedia-{media_type}", "query": query, "items": items, "downloaded": saved}


def auto_populate_project(work_dir: Path, force_bg_with_cutout: bool = False) -> dict:
    vfile = work_dir / "video.json"
    sfile = work_dir / "script.json"
    if not vfile.exists() and not sfile.exists():
        return {"downloadedCount": 0, "skippedWithCutout": 0, "details": []}

    v = json.loads(vfile.read_text(encoding="utf-8")) if vfile.exists() else {}
    sdata = json.loads(sfile.read_text(encoding="utf-8")) if sfile.exists() else {}

    scenes = v.get("scenes") or []
    beats = sdata.get("beats") or []

    # Synchronize footage queries from script.json beats into video.json scenes if missing
    if scenes and beats:
        for idx, sc in enumerate(scenes):
            if idx < len(beats):
                bt = beats[idx]
                for k in ["archiveQuery", "movieClipQuery", "dialogueQuery", "iaQuery", "wikimediaQuery", "movieClipUrl", "movieClipSection", "allowBgWithCutout", "bgOpacity"]:
                    if bt.get(k) is not None and sc.get(k) is None:
                        sc[k] = bt[k]

    target_list = scenes if scenes else beats
    downloaded_count = 0
    fallback_count = 0
    skipped_cutout = 0
    details = []

    for i, sc in enumerate(target_list):
        idx_num = i + 1
        has_primary_visual = bool(sc.get("media") or sc.get("userAsset") or sc.get("cutout") or sc.get("cutoutPrompt"))
        allow_bg = force_bg_with_cutout or bool(sc.get("allowBgWithCutout"))

        # 1. Explicit YouTube / Trailer Timestamp Slice (`movieClipUrl` + `movieClipSection`)
        m_url = sc.get("movieClipUrl")
        m_sec = sc.get("movieClipSection")
        if m_url and m_sec:
            rel_out = sc.get("movieClipFile") or f"assets/movie-s{idx_num:02d}.mp4"
            abs_out = work_dir / rel_out
            res = slice_youtube_movie_scene(m_url, m_sec, abs_out)
            if res.get("downloaded"):
                if not sc.get("media"):
                    sc["media"] = rel_out
                else:
                    sc["bgVideo"] = rel_out
                downloaded_count += 1
                details.append({"scene": idx_num, "type": "ytslice", "file": rel_out})
                continue

        # 2. Explicit Movie Dialogue / Scene Grabber (`movieClipQuery` or `dialogueQuery`)
        m_query = sc.get("movieClipQuery") or sc.get("dialogueQuery")
        if m_query:
            rel_out = sc.get("movieClipFile") or f"assets/movie-s{idx_num:02d}.mp4"
            abs_out = work_dir / rel_out
            res = search_and_grab_movie_clip(m_query, abs_out)
            if not res.get("downloaded"):
                res = search_and_slice_internet_archive(m_query, dur=float(sc.get("dur") or sc.get("durationSec") or 6.0), out_path=abs_out)
            if res.get("downloaded"):
                if not sc.get("media"):
                    sc["media"] = rel_out
                else:
                    sc["bgVideo"] = rel_out
                downloaded_count += 1
                details.append({"scene": idx_num, "type": "movie", "query": m_query, "file": rel_out})
                continue

        # 3. Public-Domain Archival Footage (`archiveQuery` or `iaQuery`)
        a_query = sc.get("archiveQuery") or sc.get("iaQuery")
        if a_query:
            if has_primary_visual and not allow_bg:
                skipped_cutout += 1
                details.append({
                    "scene": idx_num,
                    "skipped": True,
                    "reason": "Beat has primary cutout (set allowBgWithCutout: true to layer bgVideo)",
                })
                continue

            target_rel = sc.get("bgVideo") or f"assets/archive-s{idx_num:02d}.mp4"
            target_abs = work_dir / target_rel
            ok = False

            # Always attempt live internet fetch first if not yet downloaded from web
            try:
                hits = search_shots(a_query)
                if hits and download_shot(hits[0]["downloadUrl"], target_abs):
                    sc["bgVideo"] = target_rel
                    sc.setdefault("source", f"Moving Image Archive ({hits[0]['title']})")
                    ok = True
                    downloaded_count += 1
                    details.append({"scene": idx_num, "type": "mia", "query": a_query, "file": target_rel})
            except Exception:
                pass

            if not ok:
                try:
                    ia_res = search_and_slice_internet_archive(
                        a_query,
                        collection=sc.get("archiveCollection"),
                        start=sc.get("archiveStart", "00:00:05"),
                        dur=float(sc.get("dur") or sc.get("durationSec") or 6.0),
                        out_path=target_abs,
                    )
                    if ia_res.get("downloaded"):
                        sc["bgVideo"] = target_rel
                        top_title = (ia_res.get("results") or [{}])[0].get("title", a_query)
                        sc.setdefault("source", f"Internet Archive ({top_title})")
                        ok = True
                        downloaded_count += 1
                        details.append({"scene": idx_num, "type": "ia", "query": a_query, "file": target_rel})
                except Exception:
                    pass

            # Offline / pre-bundled fallback loop check
            if not ok and target_abs.exists() and target_abs.stat().st_size > 1024:
                sc["bgVideo"] = target_rel
                fallback_count += 1
                details.append({"scene": idx_num, "type": "bundled-archive-loop", "query": a_query, "file": target_rel})

    if vfile.exists():
        vfile.write_text(json.dumps(v, indent=2), encoding="utf-8")
    if sfile.exists() and beats:
        sfile.write_text(json.dumps(sdata, indent=2), encoding="utf-8")

    return {
        "downloadedFromWebCount": downloaded_count,
        "bundledArchivalLoopsActive": fallback_count,
        "skippedWithCutout": skipped_cutout,
        "details": details,
    }


def main():
    if len(sys.argv) > 1 and sys.argv[1] in {"dialogue", "movie", "archive", "logo", "wikimedia", "ytslice"}:
        sub_cmd = sys.argv[1]
        parser = argparse.ArgumentParser(description="FLUXD Unified Movie & Archival Footage Harvester")
        parser.add_argument("cmd")
        parser.add_argument("query_or_url", help="Search phrase, query, or video URL")
        parser.add_argument("--collection", default=None, help="Internet Archive collection (e.g. prelinger, nasa)")
        parser.add_argument("--start", default="00:00:05", help="Start timestamp (HH:MM:SS)")
        parser.add_argument("--dur", type=float, default=6.0, help="Clip duration in seconds")
        parser.add_argument("--section", default="00:10-00:16", help="YouTube timestamp section (MM:SS-MM:SS)")
        parser.add_argument("--out", "-o", type=Path, default=None, help="Output file path")
        args = parser.parse_args()

        if sub_cmd in {"dialogue", "movie"}:
            res = search_and_grab_movie_clip(args.query_or_url, args.out)
        elif sub_cmd == "archive":
            res = search_and_slice_internet_archive(args.query_or_url, args.collection, args.start, args.dur, args.out)
        elif sub_cmd == "logo":
            res = search_wikimedia(args.query_or_url, "logo", args.out)
        elif sub_cmd == "wikimedia":
            res = search_wikimedia(args.query_or_url, "video", args.out)
        elif sub_cmd == "ytslice":
            if not args.out:
                print("Error: --out is required for ytslice", file=sys.stderr)
                sys.exit(1)
            res = slice_youtube_movie_scene(args.query_or_url, args.section, args.out)
        print(json.dumps(res, indent=2))
        return

    parser = argparse.ArgumentParser(description="Search and download movie clips & public-domain archival footage")
    parser.add_argument("work_dir", nargs="?", default=".", help="Project working directory")
    parser.add_argument("--source", choices=["mia", "movie", "ia", "wikimedia", "ytslice", "logo"], default="mia", help="Footage source engine")
    parser.add_argument("--query", "-q", type=str, default=None, help="Visual shot description or movie dialogue quote")
    parser.add_argument("--dialogue", type=str, default=None, help="Shortcut for --source movie --query <phrase>")
    parser.add_argument("--yt-url", type=str, default=None, help="YouTube / trailer URL to slice with yt-dlp")
    parser.add_argument("--section", type=str, default="00:10-00:16", help="Timestamp section for --yt-url (e.g. 01:12-01:18)")
    parser.add_argument("--collection", type=str, default=None, help="Internet Archive collection (e.g. prelinger, nasa)")
    parser.add_argument("--start", type=str, default="00:00:05", help="Start time for Internet Archive stream slice")
    parser.add_argument("--dur", type=float, default=6.0, help="Duration in seconds for Internet Archive stream slice")
    parser.add_argument("--color", type=str, default="", help="Color filter for Moving Image Archive (bw, color)")
    parser.add_argument("--out", "-o", type=Path, default=None, help="Output MP4/PNG file path")
    parser.add_argument("--auto", action="store_true", help="Auto-fetch movie & archival clips for video.json / script.json")
    parser.add_argument("--force-bg-with-cutout", action="store_true", help="Allow archiveQuery bgVideo even when a beat already has a primary cutout")
    parser.add_argument("--list-collections", action="store_true", help="List the 24 curated Moving Image Archive collections")
    args = parser.parse_args()

    if args.list_collections:
        print(json.dumps(CURATED_COLLECTIONS, indent=2))
        return

    if args.auto:
        report = auto_populate_project(Path(args.work_dir), force_bg_with_cutout=args.force_bg_with_cutout)
        print(json.dumps(report, indent=2))
        return

    if args.yt_url or args.source == "ytslice":
        url = args.yt_url or args.query
        if not url or not args.out:
            print("Error: --yt-url and --out are required for YouTube/trailer section slicing", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(slice_youtube_movie_scene(url, args.section, args.out), indent=2))
        return

    if args.dialogue or args.source == "movie":
        phrase = args.dialogue or args.query
        if not phrase:
            print("Error: provide --dialogue or --query for movie clip search", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(search_and_grab_movie_clip(phrase, args.out), indent=2))
        return

    if args.source == "ia":
        if not args.query:
            print("Error: --query is required for Internet Archive search", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(search_and_slice_internet_archive(args.query, args.collection, args.start, args.dur, args.out), indent=2))
        return

    if args.source in {"wikimedia", "logo"}:
        if not args.query:
            print("Error: --query is required for Wikimedia search", file=sys.stderr)
            sys.exit(1)
        mtype = "logo" if args.source == "logo" else "video"
        print(json.dumps(search_wikimedia(args.query, mtype, args.out), indent=2))
        return

    if args.query:
        shots = search_shots(args.query, color=args.color)
        if not shots:
            ia_res = search_and_slice_internet_archive(args.query, args.collection, args.start, args.dur, args.out)
            print(json.dumps(ia_res, indent=2))
            return
        if args.out:
            ok = download_shot(shots[0]["downloadUrl"], args.out)
            print(json.dumps({"selected": shots[0], "downloaded": str(args.out) if ok else None}, indent=2))
        else:
            print(json.dumps(shots[:10], indent=2))


if __name__ == "__main__":
    main()
