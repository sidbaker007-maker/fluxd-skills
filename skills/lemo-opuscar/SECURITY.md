# Security Policy

- Code and style prompts in `lemo-opuscar` execute locally using Node.js (`playwright-core`, `three`), Python (`numpy`, `scipy`, `soundfile`, `Pillow`, `kokoro-onnx`, `faster-whisper`), and `ffmpeg`.
- Online Chinese TTS (`core/tts/tts_zh.py` via `edge-tts`) and external archive fetches (`tools/footage.py`, `tools/fetch.sh`) connect to external endpoints only after explicit user consent.
- Report security vulnerabilities via https://github.com/lemomo-ai/lemo-opuscar/security/advisories/new
