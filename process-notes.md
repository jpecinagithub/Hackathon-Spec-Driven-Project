# Process Notes

## /onboard

- **Name:** Jon Pecina
- **Background:** Experienced full stack developer (JS/Node/MySQL/React/Next.js), second hackathon
- **AI agent experience:** Used Codex and OpenCode — familiar with AI-assisted coding but new to agentic workflows
- **Learning goals:** Broad ("everything") — primary focus is understanding AI agents and how to work with them effectively
- **Creative sensibility:** Strong interest in STT/TTS apps and open source tooling — voice interfaces, audio UX, prefers open source stack choices
- **Prior SDD experience:** None formal — gravitates toward exploring tools rather than planning first; SDD is new territory
- **Energy/engagement:** Concise, direct. Prefers getting to the point. Move fast and don't over-explain.

## /scope

- **Idea evolution:** Started with a clear vision — TTS + STT, open source models, Oracle deploy. Very little pivoting; Jon came in knowing what he wanted.
- **Architecture gap:** Biggest clarification needed was bridging Python ML models (Kokoro/Whisper) with his JS stack. Resolved quickly: FastAPI backend + Next.js frontend.
- **Language scope:** Narrowed to English only during mandatory questions.
- **Audio formats:** MP3, WAV, WebM confirmed.
- **Pushback received:** Asked about voice selection, streaming, diarization, SRT export — all cut with "hazlo simple." Jon has strong instinct to stay lean.
- **References:** Shown kokoro-web, docker-whisper, Kokoro TTS Studio. No resonance ("no tengo ninguna preferencia") — Jon already had a clear mental model and didn't need external inspiration.
- **Deepening rounds:** 0 — chose to proceed immediately after mandatory questions.
- **Active shaping:** Jon drove the direction throughout. Responses were brief and decisive. No passive acceptance — every answer was a clear choice. The "hazlo simple" response to scope-cutting was the clearest signal: he knows what he wants and values simplicity over completeness.

## /prd

- **Changes vs scope:** Voice selector expanded from "one default voice" to 4 voices (2M/2F) — Jon introduced this unprompted when describing the TTS UI.
- **Surprises:** None major. Jon had a clear mental model coming in; the PRD conversation was mostly transcription of what he already knew, not discovery.
- **What-if moments:** Pushed on loading states (spinner confirmed), empty input (button does nothing), backend failure (error message), text length limits (no limit), audio file size limits (no limit). All resolved quickly.
- **Scope guard:** No creep attempted. Jon stayed within the original scope throughout.
- **Deepening rounds:** 0 — proceeded immediately after mandatory questions.
- **Active shaping:** Jon was descriptive and decisive. Described the UI layout spatially ("abajo a la derecha" for the format selector, "junto al campo" for the mic button). All decisions were his own; no suggestions were needed.

## /spec

- **Stack decisions:** FastAPI + kokoro + faster-whisper (Python backend), Next.js + Tailwind + @wavesurfer/react (frontend). All confirmed by Jon — no pushback, no alternatives considered.
- **Whisper model size:** `small` — chosen for hackathon balance of speed/accuracy. Jon confirmed "no cojas un modelo muy grande."
- **Kokoro voices:** af_heart (A), af_bella (A-), am_fenrir (C+), am_michael (C+) — agent selected based on official model grades. Jon accepted without changes.
- **PDF extraction:** PDF.js on the client — Jon chose it over backend pypdf for simplicity.
- **Waveform player:** WaveSurfer.js — Jon asked for waveform visualization, agent proposed @wavesurfer/react.
- **ffmpeg:** Confirmed no problem installing on Oracle server.
- **Architecture self-review findings surfaced:** SSR issue with WaveSurfer (needs dynamic import), model singleton loading, ffmpeg for pydub. All resolved cleanly.
- **Deepening rounds:** 0 — proceeded immediately.
- **Active shaping:** Jon made clear technical choices (PDF.js, waveform, ffmpeg OK) but deferred voice selection and model size to the agent. Move-fast energy throughout.

## /checklist

- **Build mode:** Autonomous, no verification checkpoints, single commit at the end.
- **Sequencing rationale:** Backend first (riskiest — model loading + audio conversion) to catch problems before the frontend is built. Frontend sequenced from shell → TTS panel → PDF import → STT panel → mic recorder → PDF export.
- **Items:** 10 (Devpost submission removed — Jon handles manually).
- **Estimated time:** ~3-3.5 hours.
- **Submission planning:** Wow moment = accurate transcriptions. GitHub repo initialized locally, push to GitHub included in manual submission steps.
- **Deepening rounds:** 0 — Jon accepted the proposed sequence without changes.
- **Active shaping:** Minimal — accepted the full sequencing proposal. Only input was removing the Devpost item and noting he'd handle submission manually.

## /build

- **Total items completed:** 10/10
- **Build mode:** Autonomous, no checkpoints, single commit at end (by user)
- **Items 1-4 (backend):** Dispatched via subagents. Scaffold, FastAPI+CORS+model loading, TTS endpoint, STT endpoint — all completed cleanly.
- **Item 5 (frontend shell):** Subagent hit rate limit mid-execution before writing files. Files written directly by orchestrator.
- **Items 6-10 (frontend components):** Written directly. All lib utilities (api.ts, pdfUtils.ts, pdfExport.ts) and components (VoiceSelector, FormatSelector, WaveformPlayer, AudioUploader, MicRecorder, TTSPanel, STTPanel) implemented.
- **Notable decisions during build:** WaveSurfer imported with `dynamic(..., ssr: false)` in TTSPanel. PDF.js worker configured via CDN URL (avoids Next.js worker bundling issues). jsPDF used for transcription export with A4 layout and word-wrapping.
- **Checklist revision:** None required — spec was clean enough to build straight through.
- **Pending:** User needs to run `pip install -r backend/requirements.txt`, then test both endpoints. First backend startup will download Kokoro and Whisper models (~1-2 min). Verify WebM/libopus ffmpeg support on Oracle before deploying.
