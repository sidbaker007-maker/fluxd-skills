# One-sentence revisions → the smallest change

Render after each, show the new video. No second storyboard. If they say "always" / "from now on",
note it in your memory for their next video too.

| they say | change |
|---|---|
| "shorter" / "make it 15 seconds" | `length=15` (or drop a scene if it then warns "too fast to read") |
| "longer" / "slower" | `length=<+30%>`, or `null` if a length was set |
| "faster", "more energy" | shorter `length`; or style `kinetic`; or `words` beats instead of a statement |
| "calmer", "more premium" | style `aura` or `keynote`; `sound.sfx="subtle"` |
| "more fun", "more colour" | style `paper`; or a brighter palette index |
| "darker" / "lighter" | the style's dark/light palette (`MD styles` lists them) |
| "use my colours" | `brand.color="#hex"` |
| "different font" | `font=<n>` (`MD styles` lists the pairings) |
| "vertical", "for TikTok" | `format="9:16"` |
| "square" | `format="1:1"` |
| "less sound" / "no sound" | `sound.sfx="subtle"` / `"off"` |
| "add music" + a file | copy to `assets/`, `sound.music="assets/…"` |
| "bigger text" | fewer words in that scene (the type grows to fill), or split the scene |
| "change the line in scene N" | `scenes.<N-1>.text="…"` (or `title`, `items`, …) |
| "swap scenes 2 and 3" | reorder `scenes` |
| "remove the stats" | delete that scene (or `"off": true`) |
| "show the app more" | another `screen` scene, or `screens` with 3 shots |
| "go back to the first version" | `MD restore "$WORK" v1` (its plan comes back; render to make it the latest) |
| "different transition" | per scene `"transition": "cut" | "fade" | "blur" | "push" | "zoom" | "wipe" | "iris"` (+ the style's own) |
