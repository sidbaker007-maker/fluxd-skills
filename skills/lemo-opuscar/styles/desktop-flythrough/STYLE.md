# 3D Desktop Flythrough

Three.js perspective camera gliding over a dark studio desk where browser windows, terminal panes, code cards, and metric popups float at staggered Z-depths with parallax shadows, depth-of-field cues, and smooth spring camera Dolly/Pan moves (`core/lib.js` `inOut3` + `spring`).

## Visual Grammar
- **Camera**: `THREE.PerspectiveCamera(38, 16/9, 0.1, 100)` or CSS 3D `perspective: 1200px` stage with keyframed `(x, y, z, rotX, rotY)` targets per scene beat.
- **Window Cards**: Dark frosted glass `#12151c` with `1px solid rgba(255,255,255,0.12)` bezel, macOS traffic-light dots, syntax-highlighted code lines, and active cursor highlight bar.
- **Lighting & Post**: Soft spotlight cone + subtle CRT/bloom pass (`core/three/post.js`).
