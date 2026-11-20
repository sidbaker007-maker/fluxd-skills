# Live Countdown Split-screen - Style Prompt

An edit style, not a look. Real footage of one event with a known zero (a launch, a verdict, a final whistle, polls closing), shown in real time: screen time equals event time, a clock ticks every second, and the screen splits into more and more cells as the moment nears, every cell showing the same second. At zero the cells merge into one picture and the clock flips. References (grammar only): the real-time clock and splitting screens of the TV series 24; the multi-camera archive panels and mission-time codes of the documentary Apollo 11 (2019). Never copy their type, colours, sounds, graphics or shots, and never name them in the film.

## 1. Essence, and what it is not

- **Real time.** One continuous stretch of the event, never cut, never re-ordered, never sped up. Slow-motion sources are played back at real speed. The clock and the picture can be checked against each other at any frame.
- **The clock is the lead.** It ticks every whole second (sound and a falling digit), it says who is in control, and it changes state at zero.
- **Cells show the same second.** Every video cell is synced to the clock, or says plainly that it is not (§8, "sync badge").
- **The layout is the edit.** Cuts are layout changes, and every layout change lands on a real spoken call or event in the native sound, not on the music.
- **More cells, closer to zero; one picture at zero.** The number of cells is the tension curve.

Not a montage (time jumps), not a security wall (the layout never moves), not a flashback structure (real time cannot go back), not a slide deck.

## 2. Materials & rendering

- **Three kinds of material at once:** video cameras of the same moment (2-8), documents (a fact sheet, a filing, a schedule: shown as paper, never retyped as a slide), and photographs (the people of the day).
- **Data drawn by us:** checklists, bars, a flight or process profile, a second countdown to the next milestone. Every number comes from an official source (§10).
- **Cells:** hard rectangles on near-black `#06080A`, 24 px outer margin, 8-9 px gutters, 1 px border `rgba(222,232,238,.16)`, a light radial vignette (to 36 % black) on video cells. No rounded corners, no drop shadows, no 3D.
- **Camera chip** top-left of every cell: dark plate 84 %, a square dot (orange = synced video, grey = unsynced or still), code (`CAM 4`, `DOC`, `LIST`), name.
- **Burned-in text in the sources** (broadcast bugs, camera IDs, timers, tracker readouts) is cropped by a per-shot usable region, or blurred out (`ffmpeg delogo`) after it has been used for syncing.
- **One grade for every source (ffmpeg):** `eq=contrast=1.07:saturation=0.9:gamma=0.97:brightness=-0.01,colorbalance=rs=-0.02:bs=0.03:rh=0.03:bh=-0.02`, then film grain 1 at the master (`mux.sh ... 1`).

## 3. Colour logic

| Role | Value |
| --- | --- |
| Ground | `#06080A`; panels `#0B0E11` |
| Main text | `#F2F5F7`; secondary `#7C878D` |
| Accent: the T- sign, synced dots, ticks done, event flags, active control segment | `#FF5B1F` |
| Speaking light, "heard" tags | `#FF3B30` |
| Plates over full-screen footage | `rgba(6,8,10,.80)` |
| After zero, the clock block | ground `#FF5B1F`, text `#0A0B0C` (inverted) |

Orange means "now / synced / done". Grey means "pending / not synced". Nothing else is coloured; colour belongs to the footage.

## 4. Type & subtitles

- **Clock digits:** a condensed sans with fixed-width digit slots (Barlow Condensed SemiBold, drawn digit by digit in equal slots so the clock never jitters); size up to 132 px, the `T-/T+` sign at 0.85x, tenths at 0.41x in grey, a ten-segment sub-second bar under it.
- **Text:** Noto Sans SC 500/700, Barlow, and IBM Plex Mono for labels, codes and small print.
- **The live transcript is the subtitle.** A fixed box (bottom right, or a cell in the grid): a speaking light and the speaker type (commentary / loop / narrator - the narrator is marked in orange so it is never mistaken for the event's audio), the line appearing word by word at the spoken times (0.08 s fade per word, a block cursor).

## 5. Motion quality

- 30 fps.
- **Clock:** on each whole second the new digits drop 14 px in 0.12 s (ease-out); the sub-second bar empties one segment per 0.1 s (fills after zero).
- **Re-layout:** 0.34 s `easeInOutCubic`. Cells that stay interpolate their rectangles; new cells open from their left edge; leaving cells close to the left; a new cell flashes a 3 px orange border for ~0.2 s when it lands.
- **Photographs** push in <= 6 % over their whole stay; names pop one by one 0.16 s apart. **Documents** move their window down a row in 0.45 s; the highlight sweeps left to right in 0.35 s.

## 6. Edit grammar

- **Screen time = event time.** One mapping, `M = t - T0`, for the whole film. Each camera has its own source offset (`s = M + c`) measured once and baked into the frame extraction.
- **Cut points are calls.** Each layout change starts on the first word of a real call in the native audio ("ten", "go for...", "ignition", a name) or on an event visible in the footage.
- **Cell count rises toward zero:** 1 -> 2 -> 3-4 -> many (6-9, the clock itself becomes the centre cell, the transcript a cell) -> one at zero -> a few again after zero -> one under the title.
- **Silence before zero:** the music drops out a quarter-second before zero; only the native sound and the clock remain.

## 7. Sound palette

1. **Native sound** - the event's own audio (commentary, radio loops, crowd), high-pass 90 Hz, compressed, always on top; never ducked.
2. **Narrator** (sparingly, only in gaps of the native sound, never over it): clean and close.
3. **The clock:** a tick every whole second (two alternating pitches around 1.5-1.9 kHz, panned +-15 %), louder in the last ten seconds, a soft single pitch after zero.
4. **Interface foley** from `window.EV`: re-layout whoosh + metallic snap; cell pop snap; checklist tock; event-flag whoosh; full-screen cut thump.
5. **Score, 60 BPM** so one beat = one second = one tick: a low synth drone whose low-pass opens toward zero, a bass drum per beat, off-beat hats, a tom per spoken count, timpani roll into zero, silence, then a low brass major chord with bass drum, crash and tubular bell at zero.

## 8. Native moves (and how to build them)

- **Many into one.** At zero, every cell moves to its tile of the full frame while each tile cross-fades to the same full-screen shot, chips and borders vanish, a warm white flash peaks, and the clock and transcript slide back to the bottom. 0.42 s.
- **Clock inversion.** At zero the clock block flips from dark with an orange `T-` to orange with dark `T+`, and its header changes (countdown -> elapsed).
- **Control strip.** Segments in the clock header (who has control: ground -> vehicle -> mission control); the active one fills orange on the call that hands it over.
- **The grid fills on the count.** Empty grid slots show as dashed "standby" frames; each spoken number opens one camera.
- **Sync badge.** Top-right of each video cell: `LIVE SYNC` (synced), `SAME WINDOW` (hatched, grey: footage from the same minutes without a usable clock), `1x REAL-TIME` (slow-motion re-timed).
- **Planned vs heard checklist.** Official milestones with their planned times tick as the clock passes them; when the native audio actually says one, a red `heard -32.1` tag with a small waveform appears beside it.
- **Second countdown.** After zero, a smaller clock counts to the next official milestone along a schematic profile drawn by time.
- **Event flag.** An orange bar with black type slides in at the bottom of the relevant cell on its call.
- **Punch-in on a call.** A hard digital punch-in on the relevant detail when the commentary names it.
- **Document by rows.** A paper close-up shows two or three rows; a highlight bar and an annotation band below the paper translate the row.

## 9. Pitfalls of the medium

- Unsyncable footage: never fake it; label the cell "same window · not frame-synced".
- Measuring zero: never trust metadata; combine two independent marks (a visible event and the spoken word timing).
- Audio and picture of one file can disagree: sync each camera on its picture.
- Slow-motion sources: measure the factor from two events with a known gap and re-time with `setpts=PTS/k`.
- The clock jitters if digits are proportional: draw them in fixed slots.

## 10. Materials, sources, facts, engine

- Ask the user first for their own material; fallback to NASA, NOAA, NARA, DVIDS, Internet Archive (PD/CC0/CC BY), Wikimedia Commons (CC0/PD/CC BY).
- Keep `FACTS.md` covering every number, time, name and call on screen and in the narration.
- Engine: `demo/index.html` (Canvas 2D: `LAY` layout keyframes with `grid` / `merge` / `cut` / `swap`, `camRegion()`, `crop()`, `drawClock()`, `drawTx()`, `drawCheck()`, `drawDoc()`, `drawProfile()`, `drawThrust()`).

## 11. Variation space

The agent decides per film: the event, where real time starts and ends, the number of cameras, which documents and data, the control segments, the narrator's lines (or none), the closing layout.

- **Clocks:** `T-/T+`; a match clock; a wall clock (`HH:MM:SS`) for a news day; a countdown to a deadline that then counts up as "overtime".
- **Three structures:** rising cells to a merge; one cell that splits outward after zero; two parallel countdowns side by side that meet at zero.
- **Three openings:** a single wide shot and the first call; the clock alone on black, then the first camera opens; a document (the schedule) with the first item ticking.
- **Three endings:** the inverted clock over one full-screen shot; the grid refilling with consequences, then one title; the second countdown reaching its own zero.
