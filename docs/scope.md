# VoiceForge — TTS & STT Web App

## Idea
A clean, no-frills web app that converts text to speech (via Kokoro) and speech to text (via Whisper) — no accounts, no database, just the tools working.

## Who It's For
Anyone who needs quick, reliable TTS or STT in English — developers, content creators, or general users who want a self-hosted, open-source alternative to paid services. Deployed publicly on Oracle server so anyone can use it.

## Inspiration & References
- [kokoro-web (eduardolat)](https://github.com/eduardolat/kokoro-web) — self-hosted Kokoro with OpenAI-compatible API; reference for backend architecture
- [docker-whisper (hwdsl2)](https://github.com/hwdsl2/docker-whisper) — dockerized faster-whisper with OpenAI-compatible API; reference for STT backend
- [Kokoro TTS Studio](https://unrealspeech.com/studio) — design reference for "simple but elegant" TTS UI

Design energy: minimal, clean, professional. Tailwind CSS. Responsive. No clutter.

## Goals
- Ship a working, publicly accessible TTS + STT tool
- Learn spec-driven development and agentic workflows on a real project
- Use open-source models (Kokoro, Whisper) self-hosted — no vendor APIs
- App must be reliable and easy to use; functionality over features

## What "Done" Looks Like
A responsive web app with two clearly separated modes:

**TTS mode:**
- User pastes text or imports a PDF
- Selects output format (MP3, WAV, WebM)
- Clicks generate → downloads audio file

**STT mode:**
- User uploads an audio file (MP3, WAV, WebM) or records via microphone
- Clicks transcribe → gets text output
- Can copy or download transcription

Both modes work reliably on mobile and desktop. App is deployed and publicly accessible on Oracle server.

## What's Explicitly Cut
- **Voice cloning** — out of scope for now, planned for later
- **Authentication / user accounts** — no login, no sessions
- **Database** — no persistence of any kind
- **Multi-language support** — English only
- **Real-time / streaming transcription** — batch only
- **Speaker diarization** — out
- **Subtitle/SRT export** — out
- **Multiple Kokoro voice selection** — keep it simple; one default voice
- **Translation** — out

Rationale: a sharp, reliable two-feature tool beats a bloated one that ships broken.

## Loose Implementation Notes
- **Backend:** Python + FastAPI, serving Kokoro (TTS) and faster-whisper (STT)
- **Frontend:** Next.js + Tailwind CSS, two-mode UI (TTS / STT tabs or split layout)
- **Audio formats:** MP3, WAV, WebM — both input (STT) and output (TTS)
- **PDF import:** Extract text from PDF on the frontend or backend, feed into TTS
- **Deployment:** Oracle Cloud server — likely Dockerized for clean deployment
- **No external API calls** — fully self-contained, models run locally on server
