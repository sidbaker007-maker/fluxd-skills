#!/usr/bin/env python3
"""
On-Demand FilmCraft Multi-Track Project Exporter (`filmcraft_export.py`) for FLUXD Motion Designer.

Generates a multi-track FilmCraft project bundle containing:
- `<slug>_filmcraft_timeline.xml` (Final Cut Pro 7 XML / xmeml v5 for FilmCraft File > Import)
- `<slug>_filmcraft_timeline.otio` (OpenTimelineIO JSON for FilmCraft File > Import)
- `prepare_filmcraft_local.sh` (Auto-patches absolute file://localhost/ paths on Linux & slices V1 beats if needed)
- `scenes/beat_01_*.mp4` (V1 per-beat video clips)
- `assets/*` (V2 cutouts, plots, and visual cards)
- `stems/A1_voiceover_master.wav` & `stems/vo_beats/beat_01_*_vo.wav` (A1 isolated voiceover)
- `stems/A2_music_score.wav` (A2 isolated background music score without VO or SFX)
- `stems/A3_sfx_master.wav` & `stems/sfx_cues/sfx_01_*.wav` (A3/A4 individual frame-synced SFX cues)
"""

import argparse
import json
import re
import shutil
import stat
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

SKILL_DIR = Path(__file__).resolve().parent.parent

FORMATS = {
    "16:9": (1920, 1080),
    "9:16": (1080, 1920),
    "1:1": (1080, 1080),
    "4:5": (1080, 1350),
}


def sec_to_frames(sec: float, fps: int) -> int:
    return max(0, int(round(float(sec) * fps)))


def build_fcp7_xmeml(
    project_name: str,
    width: int,
    height: int,
    fps: int,
    total_dur: float,
    video_track_1: list,
    video_track_2: list,
    audio_tracks: list,
    markers: list,
) -> str:
    total_frames = sec_to_frames(total_dur, fps)
    ntsc = "FALSE"

    def rate_xml() -> str:
        return f"<rate><timebase>{fps}</timebase><ntsc>{ntsc}</ntsc></rate>"

    def video_clip_xml(item: dict, idx: int, track_idx: int) -> str:
        cid = f"vclip_{track_idx}_{idx}"
        fid = f"vfile_{track_idx}_{idx}"
        name = xml_escape(item["name"])
        rel_url = xml_escape(item["rel_path"])
        start_f = sec_to_frames(item["start"], fps)
        end_f = sec_to_frames(item["end"], fps)
        in_f = sec_to_frames(item.get("in_sec", 0.0), fps)
        out_f = in_f + max(1, end_f - start_f)
        dur_f = max(1, sec_to_frames(item.get("file_dur", item["end"] - item["start"]), fps))
        return f"""
          <clipitem id="{cid}">
            <name>{name}</name>
            <duration>{dur_f}</duration>
            {rate_xml()}
            <start>{start_f}</start>
            <end>{end_f}</end>
            <in>{in_f}</in>
            <out>{out_f}</out>
            <file id="{fid}">
              <name>{name}</name>
              <pathurl>__FILMCRAFT_ROOT__/{rel_url}</pathurl>
              {rate_xml()}
              <duration>{dur_f}</duration>
              <media>
                <video>
                  <samplecharacteristics>
                    {rate_xml()}
                    <width>{width}</width>
                    <height>{height}</height>
                  </samplecharacteristics>
                </video>
              </media>
            </file>
          </clipitem>"""

    def audio_clip_xml(item: dict, idx: int, track_idx: int) -> str:
        cid = f"aclip_{track_idx}_{idx}"
        fid = f"afile_{track_idx}_{idx}"
        name = xml_escape(item["name"])
        rel_url = xml_escape(item["rel_path"])
        start_f = sec_to_frames(item["start"], fps)
        end_f = sec_to_frames(item["end"], fps)
        in_f = sec_to_frames(item.get("in_sec", 0.0), fps)
        out_f = in_f + max(1, end_f - start_f)
        dur_f = max(1, sec_to_frames(item.get("file_dur", item["end"] - item["start"]), fps))
        gain = float(item.get("gain", 1.0))
        return f"""
          <clipitem id="{cid}">
            <name>{name}</name>
            <duration>{dur_f}</duration>
            {rate_xml()}
            <start>{start_f}</start>
            <end>{end_f}</end>
            <in>{in_f}</in>
            <out>{out_f}</out>
            <file id="{fid}">
              <name>{name}</name>
              <pathurl>__FILMCRAFT_ROOT__/{rel_url}</pathurl>
              {rate_xml()}
              <duration>{dur_f}</duration>
              <media>
                <audio>
                  <samplecharacteristics>
                    <depth>16</depth>
                    <samplerate>48000</samplerate>
                  </samplecharacteristics>
                  <channelcount>2</channelcount>
                </audio>
              </media>
            </file>
            <filter>
              <effect>
                <name>Audio Levels</name>
                <effectid>audiolevels</effectid>
                <effecttype>audiolevels</effecttype>
                <mediatype>audio</mediatype>
                <parameter>
                  <parameterid>level</parameterid>
                  <name>Level</name>
                  <value>{gain:.3f}</value>
                </parameter>
              </effect>
            </filter>
          </clipitem>"""

    v1_xml = "".join(video_clip_xml(it, i + 1, 1) for i, it in enumerate(video_track_1))
    v2_xml = "".join(video_clip_xml(it, i + 1, 2) for i, it in enumerate(video_track_2))

    a_tracks_xml = []
    for t_idx, a_tr in enumerate(audio_tracks, start=1):
        clips_xml = "".join(audio_clip_xml(it, i + 1, t_idx) for i, it in enumerate(a_tr["clips"]))
        a_tracks_xml.append(
            f"""
        <track>
          <!-- {xml_escape(a_tr['label'])} -->{clips_xml}
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>"""
        )

    markers_xml = "".join(
        f"""
      <marker>
        <name>{xml_escape(m['name'])}</name>
        <comment>{xml_escape(m.get('comment', ''))}</comment>
        <in>{sec_to_frames(m['time'], fps)}</in>
        <out>-1</out>
      </marker>"""
        for m in markers
    )

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence id="seq_fluxd_1">
    <name>{xml_escape(project_name)}</name>
    <duration>{total_frames}</duration>
    {rate_xml()}
    <timecode>
      {rate_xml()}
      <string>00:00:00:00</string>
      <frame>0</frame>
      <displayformat>NDF</displayformat>
    </timecode>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            {rate_xml()}
            <width>{width}</width>
            <height>{height}</height>
            <anamorphic>FALSE</anamorphic>
            <pixelaspectratio>square</pixelaspectratio>
            <fielddominance>none</fielddominance>
          </samplecharacteristics>
        </format>
        <track>
          <!-- V1: Per-Beat Rendered Scene Clips -->{v1_xml}
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>
        <track>
          <!-- V2: Raw Cutouts, Empirical Plots & In-Grid Media Assets -->{v2_xml}
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>
      </video>
      <audio>
        <numOutputChannels>2</numOutputChannels>
        <format>
          <samplecharacteristics>
            <depth>16</depth>
            <samplerate>48000</samplerate>
          </samplecharacteristics>
        </format>{"".join(a_tracks_xml)}
      </audio>
    </media>{markers_xml}
  </sequence>
</xmeml>
"""


def build_otio_json(
    project_name: str,
    width: int,
    height: int,
    fps: int,
    video_track_1: list,
    video_track_2: list,
    audio_tracks: list,
    scenes_meta: list,
) -> dict:
    def rt(val_sec: float) -> dict:
        return {
            "OTIO_SCHEMA": "RationalTime.1",
            "rate": float(fps),
            "value": round(float(val_sec) * fps, 3),
        }

    def tr(start_sec: float, dur_sec: float) -> dict:
        return {
            "OTIO_SCHEMA": "TimeRange.1",
            "start_time": rt(start_sec),
            "duration": rt(max(0.001, dur_sec)),
        }

    def make_track(name: str, kind: str, items: list) -> dict:
        children = []
        cursor = 0.0
        for it in sorted(items, key=lambda x: x["start"]):
            gap = round(it["start"] - cursor, 4)
            if gap > 0.01:
                children.append({
                    "OTIO_SCHEMA": "Gap.1",
                    "name": "Gap",
                    "source_range": tr(0.0, gap),
                    "effects": [],
                    "markers": [],
                    "metadata": {},
                })
            dur = max(0.02, round(it["end"] - it["start"], 4))
            in_sec = float(it.get("in_sec", 0.0))
            children.append({
                "OTIO_SCHEMA": "Clip.1",
                "name": it["name"],
                "source_range": tr(in_sec, dur),
                "media_reference": {
                    "OTIO_SCHEMA": "ExternalReference.1",
                    "name": it["name"],
                    "target_url": it["rel_path"],
                    "available_range": tr(0.0, float(it.get("file_dur", dur + in_sec))),
                    "metadata": {},
                },
                "effects": [],
                "markers": [],
                "metadata": {
                    "filmcraft": {
                        "gain": float(it.get("gain", 1.0)),
                        "beatId": it.get("beat_id", ""),
                    }
                },
            })
            cursor = it["start"] + dur
        return {
            "OTIO_SCHEMA": "Track.1",
            "name": name,
            "kind": kind,
            "children": children,
            "effects": [],
            "markers": [],
            "metadata": {},
        }

    tracks = [
        make_track("V1 - Scene Beats", "Video", video_track_1),
        make_track("V2 - Cutouts & Visual Cards", "Video", video_track_2),
    ]
    for a_tr in audio_tracks:
        tracks.append(make_track(a_tr["label"], "Audio", a_tr["clips"]))

    return {
        "OTIO_SCHEMA": "Timeline.1",
        "name": project_name,
        "global_start_time": rt(0.0),
        "tracks": {
            "OTIO_SCHEMA": "Stack.1",
            "name": "tracks",
            "children": tracks,
            "effects": [],
            "markers": [],
            "metadata": {},
        },
        "metadata": {
            "filmcraft": {
                "width": width,
                "height": height,
                "fps": fps,
                "scenes": scenes_meta,
            }
        },
    }


def export_filmcraft_project(work_dir: Path, out_target: Path = None) -> dict:
    work_dir = work_dir.resolve()
    vfile = work_dir / "video.json"
    if not vfile.exists():
        raise FileNotFoundError(f"No video.json found in {work_dir}")

    motion_js = SKILL_DIR / "scripts" / "motion.js"
    if motion_js.exists():
        subprocess.run(["node", str(motion_js), "compose", str(work_dir)], check=False)

    vdata = json.loads(vfile.read_text(encoding="utf-8"))
    plan_file = work_dir / "build" / "plan.json"
    plan = json.loads(plan_file.read_text(encoding="utf-8")) if plan_file.exists() else {}

    fmt = vdata.get("format", "9:16")
    W, H = FORMATS.get(fmt, (1080, 1920))
    fps = int(vdata.get("fps") or 30)
    slug = (vdata.get("title") or work_dir.name).lower()
    slug = re.sub(r"[^a-z0-9]+", "_", slug).strip("_") or "fluxd_project"
    project_name = vdata.get("title") or slug

    want_zip = False
    if out_target is None:
        bundle_dir = work_dir / f"{slug}_filmcraft_project"
    else:
        out_target = out_target.resolve()
        if out_target.suffix.lower() == ".zip":
            want_zip = True
            bundle_dir = work_dir / f".stage_{slug}_filmcraft"
            if bundle_dir.exists():
                shutil.rmtree(bundle_dir, ignore_errors=True)
        else:
            bundle_dir = out_target

    stems_dir = bundle_dir / "stems"
    vo_beats_dir = stems_dir / "vo_beats"
    sfx_cues_dir = stems_dir / "sfx_cues"
    scenes_dir = bundle_dir / "scenes"
    assets_dir = bundle_dir / "assets"
    for d in [stems_dir, vo_beats_dir, sfx_cues_dir, scenes_dir, assets_dir]:
        d.mkdir(parents=True, exist_ok=True)

    src_assets = work_dir / "assets"
    if src_assets.exists():
        for f in sorted(src_assets.rglob("*")):
            if f.is_file() and f.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp4", ".webm", ".wav", ".mp3"}:
                rel = f.relative_to(src_assets)
                dst = assets_dir / rel
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, dst)

    raw_scenes = [s for s in (vdata.get("scenes") or []) if not s.get("off")]
    plan_scenes = plan.get("scenes") or []
    total_dur = float(plan.get("duration") or sum(float(s.get("dur") or s.get("duration") or 3.5) for s in raw_scenes) or 10.0)

    vo_candidates = [
        work_dir / "build" / "assets" / "stem_voiceover.wav",
        work_dir / "renders" / "master_vo_mix.wav",
        work_dir / "voiceover.wav",
        work_dir / "voiceover.mp3",
    ]
    vo_src = next((p for p in vo_candidates if p.exists()), None)
    a1_vo_wav = stems_dir / "A1_voiceover_master.wav"
    if vo_src and shutil.which("ffmpeg"):
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", str(vo_src),
            "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(a1_vo_wav),
        ], check=False)

    music_src = work_dir / "build" / "assets" / "stem_music.wav"
    bed_src = work_dir / "build" / "assets" / "bgm_sfx_bed.wav"
    mix_src = work_dir / "build" / "assets" / "mix.wav"
    a2_music_wav = stems_dir / "A2_music_score.wav"
    if music_src.exists():
        shutil.copy2(music_src, a2_music_wav)
    elif bed_src.exists():
        shutil.copy2(bed_src, a2_music_wav)
    elif mix_src.exists():
        shutil.copy2(mix_src, a2_music_wav)

    sfx_src = work_dir / "build" / "assets" / "stem_sfx.wav"
    a3_sfx_wav = stems_dir / "A3_sfx_master.wav"
    if sfx_src.exists():
        shutil.copy2(sfx_src, a3_sfx_wav)

    build_cues_dir = work_dir / "build" / "assets" / "sfx_cues"
    sfx_cue_items = []
    if build_cues_dir.exists():
        cues_manifest = build_cues_dir / "cues.json"
        if cues_manifest.exists():
            cues_data = json.loads(cues_manifest.read_text(encoding="utf-8"))
            for c_it in cues_data:
                src_c = build_cues_dir / c_it["file"]
                if src_c.exists():
                    dst_c = sfx_cues_dir / c_it["file"]
                    shutil.copy2(src_c, dst_c)
                    sfx_cue_items.append({
                        "name": f"SFX: {c_it['name']} (@ {c_it['start']:.2f}s)",
                        "rel_path": f"stems/sfx_cues/{c_it['file']}",
                        "start": float(c_it["start"]),
                        "end": float(c_it["start"]) + float(c_it["dur"]),
                        "in_sec": 0.0,
                        "file_dur": float(c_it["dur"]),
                        "gain": float(c_it.get("gain", 1.0)),
                    })

    rendered_candidates = [
        work_dir / f"{slug.replace('_', '-')}.mp4",
        work_dir / "renders" / "v1.mp4",
        work_dir / "renders" / "draft.mp4",
    ]
    if (work_dir / "renders").exists():
        v_mp4s = sorted((work_dir / "renders").glob("v*.mp4"))
        if v_mp4s:
            rendered_candidates.insert(0, v_mp4s[-1])
    master_mp4 = next((p for p in rendered_candidates if p.exists()), None)

    video_track_1 = []
    video_track_2 = []
    vo_beat_clips = []
    markers = []
    scenes_meta = []

    cursor = 0.0
    for idx, s in enumerate(raw_scenes):
        p_sc = plan_scenes[idx] if idx < len(plan_scenes) else {}
        t0 = float(p_sc.get("t0", cursor))
        dur = float(p_sc.get("dur") or s.get("dur") or s.get("duration") or 3.5)
        t1 = round(t0 + dur, 3)
        cursor = t1
        sid = s.get("id") or f"s{idx + 1}"
        beat_slug = f"beat_{idx + 1:02d}_{sid}"

        title_clean = str(s.get("title") or s.get("text") or s.get("kicker") or f"Beat {idx + 1}").replace("\n", " ").strip()
        vo_clean = str(s.get("vo") or "").replace("\n", " ").strip()

        markers.append({
            "name": f"Beat {idx + 1:02d}: {title_clean[:32]}",
            "comment": vo_clean,
            "time": t0,
        })
        scenes_meta.append({
            "beat": idx + 1,
            "id": sid,
            "start": t0,
            "end": t1,
            "duration": dur,
            "kind": s.get("kind", "collage"),
            "headline": title_clean,
            "voiceover": vo_clean,
            "words": s.get("words") or [],
        })

        beat_mp4_rel = f"scenes/{beat_slug}.mp4"
        beat_mp4_abs = scenes_dir / f"{beat_slug}.mp4"
        if master_mp4 and shutil.which("ffmpeg"):
            subprocess.run([
                "ffmpeg", "-y", "-v", "error",
                "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}",
                "-i", str(master_mp4),
                "-an", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "16",
                "-pix_fmt", "yuv420p", str(beat_mp4_abs),
            ], check=False)

        video_track_1.append({
            "name": f"Beat {idx + 1:02d} ({sid}) - {title_clean[:28]}",
            "rel_path": beat_mp4_rel,
            "start": t0,
            "end": t1,
            "in_sec": 0.0,
            "file_dur": dur,
            "beat_id": sid,
        })

        if a1_vo_wav.exists() and shutil.which("ffmpeg"):
            vo_slice_rel = f"stems/vo_beats/{beat_slug}_vo.wav"
            vo_slice_abs = vo_beats_dir / f"{beat_slug}_vo.wav"
            subprocess.run([
                "ffmpeg", "-y", "-v", "error",
                "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}",
                "-i", str(a1_vo_wav),
                "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le",
                str(vo_slice_abs),
            ], check=False)
            vo_beat_clips.append({
                "name": f"VO Beat {idx + 1:02d}: {vo_clean[:28] or sid}",
                "rel_path": vo_slice_rel,
                "start": t0,
                "end": t1,
                "in_sec": 0.0,
                "file_dur": dur,
                "gain": 1.0,
                "beat_id": sid,
            })

        media_list = []
        if isinstance(s.get("media"), list):
            media_list.extend(s["media"])
        elif isinstance(s.get("media"), str):
            media_list.append(s["media"])
        for k_alt in ("cutout", "plotFile", "image", "video"):
            if isinstance(s.get(k_alt), str) and s[k_alt] not in media_list:
                media_list.append(s[k_alt])

        m_times = s.get("mediaTimes") if isinstance(s.get("mediaTimes"), list) else []
        for m_idx, m_src in enumerate(media_list):
            m_rel = m_src if m_src.startswith("assets/") else f"assets/{Path(m_src).name}"
            m_offset = float(m_times[m_idx]) if m_idx < len(m_times) else 0.0
            m_start = round(min(t1 - 0.1, t0 + max(0.0, m_offset)), 3)
            video_track_2.append({
                "name": f"Beat {idx + 1:02d} Asset #{m_idx + 1} ({Path(m_rel).name})",
                "rel_path": m_rel,
                "start": m_start,
                "end": t1,
                "in_sec": 0.0,
                "file_dur": round(t1 - m_start, 3),
                "beat_id": sid,
            })

    audio_tracks = []
    if vo_beat_clips:
        audio_tracks.append({
            "label": "A1 - Voiceover (Per-Beat Editable Clips, Untouched 1.00x)",
            "clips": vo_beat_clips,
        })
    elif a1_vo_wav.exists():
        audio_tracks.append({
            "label": "A1 - Voiceover Master (Untouched 1.00x)",
            "clips": [{
                "name": "A1 Voiceover Master (1.00x)",
                "rel_path": "stems/A1_voiceover_master.wav",
                "start": 0.0,
                "end": total_dur,
                "in_sec": 0.0,
                "file_dur": total_dur,
                "gain": 1.0,
            }],
        })

    if a2_music_wav.exists():
        audio_tracks.append({
            "label": "A2 - Background Music Score Stem (Isolated, No VO / No SFX)",
            "clips": [{
                "name": "A2 Background Music Score (92 BPM Editorial Stem)",
                "rel_path": "stems/A2_music_score.wav",
                "start": 0.0,
                "end": total_dur,
                "in_sec": 0.0,
                "file_dur": total_dur,
                "gain": 0.22 if a1_vo_wav.exists() else 0.90,
            }],
        })

    if sfx_cue_items:
        audio_tracks.append({
            "label": "A3 - Individual Sound Effects Cues (Frame-Synced Hits)",
            "clips": sfx_cue_items,
        })
    if a3_sfx_wav.exists():
        audio_tracks.append({
            "label": "A4 - Consolidated SFX Master Stem",
            "clips": [{
                "name": "A4 SFX Master Stem",
                "rel_path": "stems/A3_sfx_master.wav",
                "start": 0.0,
                "end": total_dur,
                "in_sec": 0.0,
                "file_dur": total_dur,
                "gain": 0.85,
            }],
        })

    xml_template_path = bundle_dir / f".{slug}_template.xml"
    xml_path = bundle_dir / f"{slug}_filmcraft_timeline.xml"
    xml_raw = build_fcp7_xmeml(
        project_name=project_name,
        width=W,
        height=H,
        fps=fps,
        total_dur=total_dur,
        video_track_1=video_track_1,
        video_track_2=video_track_2,
        audio_tracks=audio_tracks,
        markers=markers,
    )
    xml_template_path.write_text(xml_raw, encoding="utf-8")
    # Default relative URL fallback if opened directly without running prepare_filmcraft_local.sh
    xml_path.write_text(xml_raw.replace("__FILMCRAFT_ROOT__/", ""), encoding="utf-8")

    otio_path = bundle_dir / f"{slug}_filmcraft_timeline.otio"
    otio_data = build_otio_json(
        project_name=project_name,
        width=W,
        height=H,
        fps=fps,
        video_track_1=video_track_1,
        video_track_2=video_track_2,
        audio_tracks=audio_tracks,
        scenes_meta=scenes_meta,
    )
    otio_path.write_text(json.dumps(otio_data, indent=2) + "\n", encoding="utf-8")

    slice_sh = bundle_dir / "prepare_filmcraft_local.sh"
    slice_lines = [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        'cd "$(dirname "$0")"',
        'HERE="$(pwd)"',
        "",
        'echo "================================================================"',
        f'echo "  FLUXD -> FilmCraft Multi-Track Timeline Preparer ({project_name})"',
        'echo "================================================================"',
        "",
        f'# 1. Patch FCP7 XML <pathurl> to exact local Linux folder (${{HERE}}) so zero media shows offline',
        f'if [ -f ".{slug}_template.xml" ]; then',
        f'  sed "s|__FILMCRAFT_ROOT__|file://localhost${{HERE}}|g" ".{slug}_template.xml" > "{xml_path.name}"',
        f'  echo "[1/3] Linked FCP7 XML media paths to: ${{HERE}}"',
        "fi",
        "",
        "# 2. If scenes/beat_01_*.mp4 do not exist yet, slice them from the rendered master MP4",
        'MASTER_MP4="${1:-}"',
        'if [ -z "${MASTER_MP4}" ]; then',
        '  for cand in ../renders/v1.mp4 ../*.mp4 renders/v1.mp4 *.mp4; do',
        '    if [ -f "${cand}" ]; then MASTER_MP4="${cand}"; break; fi',
        "  done",
        "fi",
        "",
        'if [ -n "${MASTER_MP4}" ] && [ -f "${MASTER_MP4}" ]; then',
        '  echo "[2/3] Slicing per-beat V1 video clips from ${MASTER_MP4}..."',
    ]
    for it in video_track_1:
        dur_s = round(it["end"] - it["start"], 3)
        slice_lines.append(
            f'  if [ ! -f "{it["rel_path"]}" ]; then ffmpeg -y -v error -ss {it["start"]:.3f} -t {dur_s:.3f} -i "${{MASTER_MP4}}" -an -c:v libx264 -preset ultrafast -crf 16 -pix_fmt yuv420p "{it["rel_path"]}"; fi'
        )
    slice_lines.extend([
        "fi",
        "",
        'echo "[3/3] FilmCraft Multi-Track Project Ready!"',
        f'echo "  -> Open FilmCraft -> File -> Import -> {otio_path.name} (or {xml_path.name})"',
        'echo "  -> Video Track V1 : scenes/beat_*.mp4 (Per-beat scene video clips)"',
        'echo "  -> Video Track V2 : assets/* (Cutouts, plots, and visual cards)"',
        'echo "  -> Audio Track A1 : stems/vo_beats/ & stems/A1_voiceover_master.wav (Isolated Voiceover)"',
        'echo "  -> Audio Track A2 : stems/A2_music_score.wav (Isolated Music Score)"',
        'echo "  -> Audio Track A3 : stems/sfx_cues/ & stems/A3_sfx_master.wav (Isolated SFX Cues)"',
        'echo "================================================================"',
    ])
    slice_sh.write_text("\n".join(slice_lines) + "\n", encoding="utf-8")
    slice_sh.chmod(slice_sh.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    readme_txt = bundle_dir / "README_FILMCRAFT.txt"
    readme_txt.write_text(
        f"""FLUXD -> FilmCraft Multi-Track Project Bundle ({project_name})
================================================================

1. Unpack this ZIP anywhere on your Linux PC and run:
     bash prepare_filmcraft_local.sh
   (This locks the FCP7 XML <pathurl> tags to your exact local Linux folder path so all clips link automatically.)

2. Open FilmCraft on Linux and go to:
     File -> Import
   Select either:
     - {otio_path.name}  (OpenTimelineIO — preserves relative paths & FilmCraft metadata)
     - {xml_path.name}   (Final Cut Pro 7 XML / xmeml v5 — industry-standard multi-track interchange)

3. Multi-Track Layout Inside FilmCraft:
   - V1 : scenes/beat_01_*.mp4 ... (Per-beat rendered video clips)
   - V2 : assets/cutout-*.png, plot-*.png ... (Overlay visual cutouts & data cards)
   - A1 : stems/vo_beats/beat_*_vo.wav & stems/A1_voiceover_master.wav (Isolated 1.00x Voiceover)
   - A2 : stems/A2_music_score.wav (Isolated 92 BPM Dorian Music Score — zero VO or SFX bleed)
   - A3 : stems/sfx_cues/sfx_*.wav (Individual frame-synced whoosh/thump/riser SFX clips)
   - A4 : stems/A3_sfx_master.wav (Consolidated full-length SFX stem)
""",
        encoding="utf-8",
    )

    result_path = bundle_dir
    if want_zip:
        out_base = out_target.with_suffix("")
        out_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.make_archive(str(out_base), "zip", str(bundle_dir))
        shutil.rmtree(bundle_dir, ignore_errors=True)
        result_path = out_target

    return {
        "status": "exported",
        "project": project_name,
        "output": str(result_path),
        "fcp7Xml": f"{slug}_filmcraft_timeline.xml",
        "otioFile": f"{slug}_filmcraft_timeline.otio",
        "tracks": {
            "V1": f"{len(video_track_1)} per-beat scene clips",
            "V2": f"{len(video_track_2)} visual cutout/plot/media cards",
            "A1": f"{len(vo_beat_clips)} per-beat voiceover slices + master VO stem",
            "A2": "Isolated background music score stem (no VO, no SFX)",
            "A3": f"{len(sfx_cue_items)} individual timestamped SFX cue WAVs + master SFX stem",
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Export FLUXD Motion Designer project as a multi-track FilmCraft project bundle (.xml + .otio + isolated audio/video stems).")
    parser.add_argument("work_dir", type=Path, help="Path to motion-designer project directory")
    parser.add_argument("--out", type=Path, default=None, help="Optional output folder or .zip path")
    args = parser.parse_args()

    res = export_filmcraft_project(args.work_dir, args.out)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
