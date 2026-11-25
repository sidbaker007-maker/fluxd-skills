---
name: open-montage
description: "OpenMontage (OpenMontageInc/OpenMontage) instruction-driven AI video production platform with a 3-layer knowledge architecture: Layer 1 Python BaseTool registry (tools/tool_registry.py across video, audio, graphics, Three.js 3D worlds, Blender, rigged SVG character animation, subtitles, enhancement, and analysis), Layer 2 studio skills (13 pipeline manifests & 90+ stage director skills for explainer, documentary-montage, cinematic, animation, character-animation, hybrid, talking-head, clip-factory, screen-demo, podcast-repurpose, plus core HyperFrames, Remotion, FFmpeg, WhisperX, color-grading, and video-reference-analyst skills), and Layer 3 technology skills (92 bundled skills including manimgl-best-practices, manimce-best-practices, manim-composer, hyperframes-*, gsap-*, threejs-*, d3-viz, and lottie-bodymovin). Use for multi-stage video pipeline orchestration, reference video breakdown, HyperFrames/Remotion composition, 3D world generation, character animation, or Manim/Three.js scene engineering."
---

# OpenMontage (`OpenMontageInc/OpenMontage` — 3-Layer Agentic Video Production Platform)

You have full access to **OpenMontage**, an instruction-driven video production system comprising:

- **Layer 1 (`tools/` & `lib/`)**: Python `BaseTool` registry (`tools/tool_registry.py`), capability selectors (`video_selector`, `tts_selector`, `image_selector`), multi-clip assembly (`tools/video/video_stitch.py`), runtime-aware composition orchestrator (`tools/video/video_compose.py`, `tools/video/hyperframes_compose.py`), silence cutting (`tools/video/silence_cutter.py`), semantic 3D world authoring (`tools/graphics/threejs_world.py`, `tools/graphics/blender_world.py`), rigged SVG character animation (`tools/character/character_animation.py`), and style playbook loader (`styles/playbook_loader.py`).
- **Layer 2 (`skills/` & `pipeline_defs/`)**:
  - `AGENT_GUIDE.md`, `PROJECT_CONTEXT.md`, and `skills/INDEX.md` (directly readable in this skill folder).
  - `skills/core/*.md`: `hyperframes.md`, `remotion.md`, `ffmpeg.md`, `whisperx.md`, `subtitle-sync.md`, `color-grading.md`.
  - `skills/meta/*.md`: `video-reference-analyst.md`, `animation-runtime-selector.md`, `bespoke-composition.md`, `reviewer.md`, `checkpoint-protocol.md`, `taste-direction.md`, `voice-performance-director.md`, `creative-intake.md`, `onboarding.md`.
  - `skills/creative/*.md`: 36 creative direction playbooks (`manim-usage.md`, `3d-world-generation.md`, `data-visualization.md`, `diagram-gen-usage.md`, `broll-planning.md`, `cinematic.md`, `short-form.md`, `long-form.md`, `sound-design.md`, `storytelling.md`, `typography.md`, `video-editing.md`, `video-stitching.md`, `ink-theater.md`, etc.).
  - `pipeline_defs/*.yaml` & `skills/pipelines/<pipeline>/<stage>-director.md` for all 13 pipelines (`animated-explainer`, `documentary-montage`, `cinematic`, `animation`, `character-animation`, `hybrid`, `talking-head`, `screen-demo`, `clip-factory`, `podcast-repurpose`, `avatar-spokesperson`, `localization-dub`, `framework-smoke`).
- **Layer 3 (`.agents/skills/`)**: 92 vendored technology skills (`manimgl-best-practices`, `manimce-best-practices`, `manim-composer`, `hyperframes`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-media`, `gsap-core`, `gsap-timeline`, `threejs-fundamentals`, `threejs-shaders`, `threejs-postprocessing`, `threejs-world-generation`, `svg-character-animation`, `character-rigging`, `d3-viz`, `beautiful-mermaid`, `ffmpeg`, `video-toolkit`, etc.).

## Unpacking the Full 3-Layer Repository Tree

All Layer-2 `skills/core/*.md`, `skills/meta/*.md`, `skills/creative/*.md`, `AGENT_GUIDE.md`, `PROJECT_CONTEXT.md`, `skills/INDEX.md`, and core Python tools are directly available as individual files in this skill directory. To materialize all 800+ files (including `pipeline_defs/*.yaml`, `skills/pipelines/*/*.md`, `styles/*.yaml`, `schemas/**`, `remotion-composer/**`, and all 92 `.agents/skills/*`) into your working directory, run:

```bash
python3 unpack_openmontage.py
```

## How OpenMontage Integrates with the Unified FLUXD Workflow

1. **Reference Video Deconstruction (`skills/meta/video-reference-analyst.md`)**:
   - Complements `user:learn-style` by extracting narrative structure, pacing beats, visual runtime choice (HyperFrames vs. Manim vs. Lemo-Opuscar vs. Three.js), and 2-3 differentiated creative concepts from any reference video.
2. **Manim & 3D World Choreography (`.agents/skills/manimgl-best-practices`, `manimce-best-practices`, `manim-composer`, `threejs-world-generation`)**:
   - Directly powers FLUXD's 3Blue1Brown Manim proofs and 3D spatial scenes during Phase 2 video builds alongside `user:lemo-opuscar`.
3. **Stage-Gated Production QA & Post-Processing (`skills/meta/reviewer.md`, `skills/core/color-grading.md`, `tools/video/silence_cutter.py`, `tools/video/video_stitch.py`)**:
   - Provides automated silence trimming on raw voiceovers (`voiceover.wav` -> `voiceover_tight.wav`), multi-clip assembly, LUT/color grading formulas, and self-review checklists before packaging the portable local RTX 3050 Ti render bundle.
