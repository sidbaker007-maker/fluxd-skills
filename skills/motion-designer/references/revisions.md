# One-Sentence Revisions -> Minimal Targeted Update

Apply changes with `node <SKILL_DIR>/scripts/motion.js set "$WORK" key=value`, run `frames` or `render --skip-review`, and present the updated output.

| User Request | Command / Change |
| :--- | :--- |
| "make it 20 seconds" / "make it 30 seconds" | `length=20` or `length=30` (scales scenes proportionally to the target length) |
| "time it to my voiceover at 140 WPM" | `length=null wpm=140` (sizes each scene to its `vo` script + `[AUDIO PAUSE: Xs]`) |
| "show voiceover subtitles on screen" | `subtitles=true` |
| "use the polymath dark documentary look" | `style='"polymath"'` |
| "switch to the 35mm tungsten halide palette" | `style='"polymath"' palette=1` (`0=Obsidian`, `1=Halide`, `2=Sovereign`, `3=Chalkboard`) |
| "use the McPhee literary serif font" | `style='"polymath"' font=1` (`0=Space Grotesk`, `1=McPhee Serif`, `2=Formalist`, `3=Telemetry Tight`) |
| "more 35mm film grain" | `grain=0.14` |
| "vertical for a 9:16 companion Reel / Short" | `format='"9:16"'` |
| "horizontal 16:9 for YouTube" | `format='"16:9"'` |
| "add a 2-second breathing pause on scene 3" | `scenes.2.pause=2` |
| "change the diagram on scene 4 to optics" | `scenes.3.diagram='"optics"'` (`optics`, `phase`, `spectrum`, `network`) |
| "less sound" / "music only" | `sound.sfx='"subtle"'` / `'sound.sfx="off"'` |
| "restore the first render" | `node <SKILL_DIR>/scripts/motion.js restore "$WORK" v1` |
