# Sci-fi Hologram HUD - Style Prompt

An object is scanned into a glowing wireframe. Target boxes lock onto its parts; each opens in a local exploded view, a leader pulls out, and its number rolls from garbage glyphs into the real value. It may light up, once, into a solid hologram. References (grammar only): the Iron Man / Avengers HUDs (target boxes, callouts, rolling numbers, layered depth); the Oblivion interfaces (one colour, hairlines, space); CAD exploded views. Copy none of their layouts, icons, fonts or colours.

## 1. Essence, and what it is not

- The subject is always a **line wireframe made of light** above a round projector pad on a near-black stage, never a rendered object. Everything reads as scanned data: a scan plane grows the model, parts pull apart along their assembly axes, numbers are computed on screen.
- **Three depth layers** are always present: a background dot grid (slow parallax), the subject with its pad and floor, and the foreground HUD (corner brackets, rulers that parallax faster, status text).

## 2. Materials & rendering

- **Stage:** near-black tinted by the hue, a radial lift behind the subject, a fading dot grid, a strong vignette.
- **Projector pad** in true perspective: concentric rings (one bright, one dashed), ticks, faint rays; it rotates slowly and spins with any turntable move.
- **Wireframe:** additive ~1.3 px strokes in a few alpha levels set by depth fog (near bright, far ~25 %), plus two low-res glow passes.
- **HUD furniture:** corner brackets, parallaxing rulers, `subject // mode` top left, a live status line top right, telemetry at the bottom. Every text block has its own dark plate (translucent near-black, 1 px border, corner ticks).

## 3. Colour logic

- **One cold hue plus one warm accent**, both parameters (e.g. mint/orange, violet/lime, ice-blue/red).
- The hue carries lines, HUD and fills. **The accent is spent on locked values only:** a number turns accent-coloured at the frame it becomes true.
- **White is heat:** near-white edges and one-frame flashes mark what is active.

## 4. Type & subtitles

- **Rajdhani**, all caps: Light for big numbers and the product name (wide tracking), Medium/SemiBold for labels. **Share Tech Mono** for micro data (coordinates, counters, zoom).
- **Subtitles are HUD:** a dark plate with corner brackets and "voiceprint" bars moving with the speech, near-white Rajdhani Medium, bottom centre; hold >= `max(1.8 s, speech + 0.6 s)`.

## 5. Motion quality

- Everything on ones at 24 fps. Only glyph scrambling steps, every frame.
- **Target lock:** oversized, rotated 45 deg, faint; snaps to fit in ~0.2 s (cubic ease-out), flashes white 3 frames on the downbeat.
- **Explode** along each piece's assembly axis: the shell slides along its own axis, the contents stay in place and glow.
- **Leader:** anchor ring -> diagonal -> horizontal to the card in ~0.5 s. **Rolling value:** characters lock right-to-left and turn accent on the downbeat with a one-frame flash.
- **Chip dock:** a finished value slides into a side rail and stays until the end.

## 6. Native moves

- **Scan growth** = "this is real data."
- **Target lock** = "look here now." The box is the camera.
- **Local explode** = "why the number is true."
- **Rolling digits** = the payoff beat.
- **Chip accumulation** = reading time.
- **Loupe** = two scales at once.
- **Solid hologram + beam** = "the whole is ready." Once, if at all.
