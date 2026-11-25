---
name: bmad-method
description: "BMad Method v7 Agile AI-Driven Development and Creative Ideation Suite (bmad-code-org/bmad-method). Bundles 32 skills across Core Tools (bmad router, bmad-brainstorming, bmad-forge-idea multi-persona idea stress-testing, bmad-deep-recon decision-grade research, bmad-advanced-elicitation draft critique, bmad-review adversarial/structure/prose review lenses, bmad-party-mode multi-agent roundtable, bmad-ingest transcript/doc ingestion, bmad-shard-pro), Method (bmad-build, bmad-build-auto, bmad-architecture, bmad-ux, bmad-code-review, bmad-project-context, bmad-qa-generate-e2e-tests, bmad-retrospective, bmad-walkthrough, plus specialist personas Mary, Winston, Amelia, John, Sofia, Sally), Founder (Nadia), and Toolsmith (Smithy, bmad-eval). Use when invoking BMad commands or running structured ideation, deep recon, multi-persona critique, or agile software delivery."
---

# BMad Method (v7 Full Multi-Module Suite — `bmad-code-org/bmad-method`)

You are operating the complete **BMad Method** ecosystem (`core-tools`, `method`, `founder`, and `toolsmith`). Every one of the 32 sub-skills' `SKILL.md` files is directly available in this skill package under `skills/<module>/<sub-skill>/SKILL.md`, and the complete 542-file resource tree (`references/`, `scripts/`, `assets/`, `module-help.toml`, `tools/`, and `docs/`) can be materialized on disk in one command:

```bash
python3 unpack_bmad.py
```

## Module & Sub-Skill Routing Table

When triggered, identify which BMad sub-skill matches the task (or use `skills/core-tools/bmad/SKILL.md` when the user asks BMad what to do next), read that sub-skill's `SKILL.md` via `get_skill_resources`, and run `python3 unpack_bmad.py` if the sub-skill references additional scripts, templates, or `.toml` files.

### 1. Core Tools (`skills/core-tools/`) — Ideation, Research, Critique & Document Processing

- **`bmad`** (`skills/core-tools/bmad/SKILL.md`): Master BMad advisor and router. Recommends the next step, checks status, and manages active initiatives.
- **`bmad-brainstorming`** (`skills/core-tools/bmad-brainstorming/SKILL.md`): Facilitates structured creative brainstorming across diverse techniques (`references/brain-techniques.csv`).
- **`bmad-forge-idea`** (`skills/core-tools/bmad-forge-idea/SKILL.md`): Tests a half-formed idea or video/product pitch in a questioning conversation with multiple skeptical personas probing weak points until the core thesis holds under pressure.
- **`bmad-deep-recon`** (`skills/core-tools/bmad-deep-recon/SKILL.md`): Executes decision-grade investigative research on a topic or codebase with verifiable citations and evidence grading.
- **`bmad-advanced-elicitation`** (`skills/core-tools/bmad-advanced-elicitation/SKILL.md`): Pushes a first draft (script, spec, architecture, or copy) off its default answer using targeted critique methods and proposes a sharper revision.
- **`bmad-review`** (`skills/core-tools/bmad-review/SKILL.md`): Runs multi-lens reviews (adversarial critique, edge cases, verification gaps, structure, and prose).
- **`bmad-party-mode`** (`skills/core-tools/bmad-party-mode/SKILL.md`): Orchestrates multi-agent / multi-persona roundtable discussions to debate trade-offs.
- **`bmad-ingest`** (`skills/core-tools/bmad-ingest/SKILL.md`): Converts raw transcripts, threads, voice memos, or long papers into cited, structured notes agents can act on.
- **`bmad-shard-pro`** (`skills/core-tools/bmad-shard-pro/SKILL.md`): Shards large documents into navigable, indexed sections.
- **`bmad-facilitate`** (`skills/core-tools/bmad-facilitate/SKILL.md`): Coaches the user through authoring, updating, or validating a structured document.
- **`bmad-customize`** (`skills/core-tools/bmad-customize/SKILL.md`): Creates and updates customization overrides for BMad skills and templates.

### 2. Method (`skills/method/`) — Agile Engineering, Architecture, UX & Delivery

- **`bmad-build`** (`skills/method/bmad-build/SKILL.md`): Implements a story, feature, or bug fix end-to-end: plan, code, review, and verify.
- **`bmad-build-auto`** (`skills/method/bmad-build-auto/SKILL.md`): Unattended end-to-end story implementation with automated verification and status report.
- **`bmad-architecture`** (`skills/method/bmad-architecture/SKILL.md`): Records architecture decisions that keep system components consistent.
- **`bmad-ux`** (`skills/method/bmad-ux/SKILL.md`): Captures UX vision in `DESIGN.md` (visual system) and `EXPERIENCE.md` (interaction behavior).
- **`bmad-code-review`** (`skills/method/bmad-code-review/SKILL.md`): Runs parallel independent code reviewers, then triages and presents findings.
- **`bmad-project-context`** (`skills/method/bmad-project-context/SKILL.md`): Audits and refreshes repository `AGENTS.md` context blocks.
- **`bmad-qa-generate-e2e-tests`** (`skills/method/bmad-qa-generate-e2e-tests/SKILL.md`): Generates E2E and API tests matching the project's test harness.
- **`bmad-retrospective`** (`skills/method/bmad-retrospective/SKILL.md`): Reviews a finished epic against ticket evidence and lessons learned.
- **`bmad-walkthrough`** (`skills/method/bmad-walkthrough/SKILL.md`): Guides a human walkthrough of a commit, PR, file, or directory.
- **Specialist Agent Personas**:
  - `bmad-agent-analyst` (`skills/method/bmad-agent-analyst/SKILL.md`) — **Mary**, Business Analyst (market/competitive research & briefs)
  - `bmad-agent-architect` (`skills/method/bmad-agent-architect/SKILL.md`) — **Winston**, System Architect
  - `bmad-agent-dev` (`skills/method/bmad-agent-dev/SKILL.md`) — **Amelia**, Senior Software Engineer
  - `bmad-agent-pm` (`skills/method/bmad-agent-pm/SKILL.md`) — **John**, Product Manager (PRDs & planning)
  - `bmad-agent-po` (`skills/method/bmad-agent-po/SKILL.md`) — **Sofia**, Product Owner (tickets, slices, backlog grooming)
  - `bmad-agent-ux-designer` (`skills/method/bmad-agent-ux-designer/SKILL.md`) — **Sally**, UX Designer & UI Specialist

### 3. Founder (`skills/founder/`) — Strategy & Business Advisory

- **`bmad-founder-agent-advisor`** (`skills/founder/bmad-founder-agent-advisor/SKILL.md`): **Nadia**, Founder Advisor for positioning, pricing, go-to-market, and strategy.

### 4. Toolsmith (`skills/toolsmith/`) — Skill Engineering & Evaluation

- **`bmad-toolsmith`** (`skills/toolsmith/bmad-toolsmith/SKILL.md`): **Smithy**, builds, converts, reviews, and packages skills and agent modules.
- **`bmad-eval`** (`skills/toolsmith/bmad-eval/SKILL.md`): Runs baseline vs. with-skill evaluation benchmarks.

## Integration with the Unified FLUXD Workflow

In the FLUXD ecosystem, `bmad-method` serves as the **Ideation Stress-Test, Deep Recon, Document Ingestion & Agile Build Engine**:
1. **Before or During Phase 1 (`@content-director`)**:
   - Use `bmad-ingest` (`skills/core-tools/bmad-ingest/SKILL.md`) or `bmad-shard-pro` when digesting long academic PDFs, historical archives, or transcripts into cited research notes.
   - Use `bmad-deep-recon` (`skills/core-tools/bmad-deep-recon/SKILL.md`) for multi-angle primary-source investigation.
   - Use `bmad-forge-idea` or `bmad-party-mode` to stress-test a video thesis across skeptical personas (e.g., Mathematician vs. Investigative Reporter vs. Poet) and `bmad-advanced-elicitation` / `bmad-review` to push a draft script to a tight 4th-draft standard before passing it to `humanizer`.
2. **For Software, Tooling, Web Apps & Pipeline Engineering**:
   - Use `bmad-build`, `bmad-architecture`, `bmad-ux`, and `bmad-code-review` (alongside `taste-skill` for frontend UI and `diagram-design` for technical diagrams).
