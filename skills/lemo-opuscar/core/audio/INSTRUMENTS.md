# Instrument Libraries (`core/audio/`)

Install sample libraries on demand with:

```bash
sh tools/fetch.sh instruments <lib>
```

| Library Key | Instruments Included | License | Attribution Required? |
|---|---|---|---|
| `piano` | Salamander Grand Piano V3 (`piano`) | CC BY 3.0 | Yes (`Alexander Holm / Salamander Grand Piano`) |
| `orchestra` | VSCO 2 Community Edition (`violin`, `cello`, `contrabass`, `flute`, `clarinet`, `oboe`, `bassoon`, `horn`, `trumpet`, `trombone`, `tuba`, `harp`, `timpani`, `marimba`, `vibraphone`, `glockenspiel`) | CC0 1.0 | No (Public Domain) |
| `drums` | RedMeansRecording / SampleSwap Acoustic Drum Kit (`drums`: `kick`, `snare`, `hat`, `ride`, `crash`, `tom`) | CC0 1.0 | No |
| `organ` | Pipe Organ & Reed Organ (`organ`) | CC0 1.0 | No |
| `guitar` | Acoustic & Clean Electric Guitar (`guitar_acoustic`, `guitar_clean`) | CC BY 3.0 | Yes (call `S.credits([...])` for `CREDITS.md`) |

Physical string modeling in `core/audio/pluck.py` (`guitar`, `nylon`, `harp`, `koto`, `guzheng`, `pipa`, `pizz`, `bass`, `harpsichord`, `dull`) is 100% procedural (Karplus-Strong) and requires no external sample download.
