# Demo Storyboard — Whiteboard Sketch (`styles/whiteboard`)

- **Topic**: Why queuing latency explodes at 90% server utilization (Kingman's formula).
- **Duration**: 24.0s @ 24fps (`1920x1080`).
- **Scenes**:
  1. `0.0s–6.0s`: Hand-drawn marker server box + incoming request arrows at 50% load (smooth queue).
  2. `6.0s–14.0s`: Load dial turns red at 90%; non-linear curve `W_q \propto \rho / (1 - \rho)` spikes up the whiteboard.
  3. `14.0s–24.0s`: Two-lane headroom diagram with red marker circle around the 75% safety threshold.
