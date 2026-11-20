# City Symphony - Style Prompt

A city film cut like a piece of minimalist music: time-lapse turns traffic, crowds and clouds into rivers of light, the cuts get denser with the score's subdivisions, one thing is slowed almost to a stop, and the film ends on a hard cut to black on a downbeat. No narrator. The music carries it. Grammar learned from the city-symphony tradition and the "Qatsi" films (Reggio / Fricke, scores in the Philip Glass manner). Nothing is taken from those films: no footage, no melody, no title lettering, no names in the film.

## 1. Essence, and what it is not

- **An edit style.** The picture is real footage of a place (time-lapse, hyperlapse, aerials, slow motion, archive film, photographs). The style lives in how time is bent and where the cuts fall, not in a drawn look.
- **The score is the script.** It is written first, with a clear arc: minimal repetition -> acceleration -> climax -> a sudden stop -> acceleration again -> hard stop -> a quiet coda. Every cut sits on a beat or a subdivision of it.
- **Machines fast, people slow.** Cars, trains, clouds and light are sped up until they become lines; the one slowed moment is something fragile (a soap bubble, steam, a flag, a flock), and people appear as crowds, tracks or long-exposure ghosts.
- **Few words, each one earned.** On-screen text is a title, a handful of numbers that state the size of the place (each from an official source), an archive date, and one line from a real public-domain text at the end.
- It is not a travel reel, a vlog, a news package, an explainer with a narrator, or a slideshow of postcards.

## 2. Materials & rendering

- **Footage only (2D).** Sources mixed freely: tripod time-lapse, long single-camera time-lapse (>= 12 h, sunrise and sunset in the same frame), hyperlapse, drone aerials (top-down is gold), high-frame-rate slow motion, archive film (pre-1931), photographs, a scanned page of a historic text.
- Everything is unified into one 35 mm release-print look: 1.85:1 matte (21 px bars on 1920x1080), warm highlights, lifted blacks, highlight bloom, clumped mid-tone grain, +-0.5 px gate weave, soft vignette.
- Never generated images; never restored, colourised or speed-corrected archive copies. Upscale limits: archive <= 2.5x; modern <= 1.5x.

## 3. Colour logic

| Use | Value |
| --- | --- |
| Type (warm white) | `#EDE8DF` |
| Secondary line (English, labels) | `#B0AAA0` |
| Sodium orange - the only accent (rules under numbers, source lines, crowd tracks, the day ring's hand) | `#D9772F` |
| Matte and black | `#000000` |

## 4. Type & subtitles

- **Latin:** Michroma (OFL), capitals, tracking 0.06-0.32 em. **Chinese:** Noto Sans SC variable, weight 300-350, tracking 0.08-0.14 em. Left-aligned, left margin 168-196 px, never centred, never on a box.
- **Number card:** the number in Michroma 84 px (44 px when three numbers stack); a 2 px sodium rule grows under it; one line says what it counts and the source year. A census-type number locks digit by digit on sixteenths (one glockenspiel note per digit); a flow number counts up from 0 in 0.6 s.

## 5. Motion quality

- **Speed is the main instrument.** Shot speeds run from 0.3x to 75x; every speed above 1x uses frame blending (a 360 deg shutter): each output frame averages the source frames it covers, capped at N frames. Headlights become continuous lines, crowds become fog, clouds become water.
- **Speed ramps** are smooth (`smoothstep` between key speeds) and always mean something: a corridor accelerates out of real time (1x -> 6x), a time-lapse ramps into a frenzy (1x -> 7x), a fast shot brakes into slow motion (2.2x -> 0.3x in 0.55 s) on the bar where the music stops.

## 6. Camera grammar - editing

| Score texture | Cut length | Frames | Use |
| --- | --- | --- | --- |
| Opening hit + eighth-note arpeggio | 2 bars -> 1 bar | 120 -> 60 | the opening still, the first single-camera time-lapse |
| Eighths | 2 beats -> 1 beat | 30 -> 15 | dawn, match cuts |
| Triplets against eighths (3:2) | 1 beat -> 1/2 beat | 15 -> 7/8 alternating | morning, the montage of streets |
| Sixteenths, full ensemble | grid cells light every 1-2 frames; cells re-cut every sixteenth | 1-4 | the grid |
| Arpeggios stop, one long chord | 3-4 s, one or two shots | 90-120 | the brake: the slowed thing, the archive split |
| Sixteenths + triplets + horns | 1/2 beat -> 4 frames -> 2 frames | 7 -> 4 -> 2 | dusk to night, the reverse flashback |
| Dry cut of the whole ensemble, reverb left ringing | hard cut to black on the bar line | - | the hard stop |

## 7. Sound palette

- **Music only.** No narrator, no source sound, no sound effects.
- **Orchestration** (sampled, CC0 - `core/audio/sampler.py`): pipe organ, winds staccato (flute, clarinet), strings (spiccato and sustained), horn pair, concert bass drum, suspended-cymbal crescendos, glockenspiel only for numbers locking.
- Master to -14 LUFS / true peak <= -1 dBTP with `core/render/mux.sh`.

## 8. Native moves

- **Light river:** integrate the speed curve to source time; each output frame averages the source frames in its window.
- **Speed ramp:** smoothstep between key speeds.
- **Brake into slow motion:** ramp 2.2x -> 0.3x with motion interpolation or crossfade.
- **Crowd -> tracks (people as data):** per-pixel median background on fixed camera; centroids of moving people joined with 2 px sodium lines that fade x 0.9 per frame.
- **Grid:** `1x2 -> 2x2 -> 3x3 -> 4x4`, one stage per half bar or bar, cells re-cutting on every sixteenth in the last beat.
- **Counterpoint split:** two halves, archive left, today right, the same kind of place or shape.
- **Day/night flicker:** two 15-frame clips from the same camera (noon, night), alternating every 2 frames.
- **Number lock:** one digit locks per sixteenth with a glockenspiel note.
- **Hard stop:** picture cuts to black on the bar line; music's dry signal cut in 15 ms; only reverb remains.
