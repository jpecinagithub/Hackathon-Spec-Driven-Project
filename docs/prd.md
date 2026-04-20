# VoiceForge — Product Requirements

## Problem Statement
Anyone who needs to convert text to speech or speech to text today faces a choice between paid APIs, privacy-invasive cloud services, or clunky desktop software. VoiceForge gives anyone with a browser access to a clean, reliable, self-hosted TTS/STT tool — no account, no cost, no data leaving the server.

---

## User Stories

### Epic: App Navigation

- As a first-time visitor, I want to immediately understand the two modes available so that I can get to the tool I need without reading any instructions.
  - [ ] The top navigation shows exactly two options: "Text to Speech" and "Speech to Text"
  - [ ] One mode is active by default on page load (TTS)
  - [ ] Clicking a nav item switches to that mode and visually indicates it's active
  - [ ] The layout is fully responsive on mobile and desktop

---

### Epic: Text to Speech

- As a user, I want to type or paste text into a box so that I can convert it to audio.
  - [ ] A clearly labeled text input area is visible in TTS mode
  - [ ] The user can type, paste, and edit text freely
  - [ ] No character limit is enforced

- As a user, I want to import a PDF so that its text is automatically loaded into the text box.
  - [ ] A "Import PDF" button is visible near the text input
  - [ ] Clicking it opens a file picker filtered to PDF files
  - [ ] After selecting a valid PDF, the extracted text appears in the text box
  - [ ] If the PDF cannot be read or is empty, an error message is shown
  - [ ] Any existing text in the box is replaced by the PDF content

- As a user, I want to choose a voice for the audio so that I can pick one that fits my use case.
  - [ ] A voice selector is visible in TTS mode
  - [ ] The selector shows 4 voices: 2 male, 2 female, each clearly labeled with name and gender
  - [ ] One voice is selected by default on load
  - [ ] Changing the selection takes effect on the next generation

- As a user, I want to choose the output audio format so that I get a file compatible with my needs.
  - [ ] A format selector (MP3, WAV, WebM) is visible in the bottom-right area of the TTS panel
  - [ ] MP3 is selected by default
  - [ ] The selected format applies to the downloaded file

- As a user, I want to generate audio from my text so that I can listen to and download it.
  - [ ] A "Generate" button is clearly visible
  - [ ] If the text box is empty, clicking Generate does nothing (button is unresponsive)
  - [ ] While generating, a spinner is shown and the Generate button is disabled
  - [ ] On success, an audio player appears below the controls with the generated audio loaded
  - [ ] A download button appears alongside the player, downloading the file in the selected format
  - [ ] If generation fails, a visible error message is shown and the spinner disappears

---

### Epic: Speech to Text

- As a user, I want to upload an audio file so that it gets transcribed to text.
  - [ ] An audio upload field is clearly visible in STT mode
  - [ ] Accepted formats: MP3, WAV, WebM
  - [ ] If a file of unsupported format is selected, an error message is shown
  - [ ] No file size or duration limit is enforced

- As a user, I want to record audio directly from my microphone so that I don't need a pre-existing file.
  - [ ] A record button is visible alongside the audio upload field
  - [ ] Clicking it requests microphone permission from the browser
  - [ ] If permission is denied, an error message explains what happened
  - [ ] While recording, the button changes to a "Stop" state with a visual indicator (e.g. red dot)
  - [ ] Clicking Stop ends the recording and treats it as the audio input, ready to transcribe
  - [ ] The recorded audio replaces any previously uploaded file

- As a user, I want to transcribe my audio so that I get the text content.
  - [ ] A "Transcribe" button is clearly visible
  - [ ] If no audio has been uploaded or recorded, clicking Transcribe does nothing
  - [ ] While transcribing, a spinner is shown and the Transcribe button is disabled
  - [ ] On success, the transcribed text appears in the output text box
  - [ ] If transcription fails, a visible error message is shown and the spinner disappears

- As a user, I want to download the transcription as a PDF so that I can save or share it.
  - [ ] A "Download PDF" button is visible in the STT panel
  - [ ] The button is inactive (or hidden) until a transcription has been generated
  - [ ] Clicking it downloads a PDF containing the transcription text
  - [ ] The PDF contains plain, readable text — no special formatting required

---

## What We're Building

| Feature | Acceptance Criteria |
|---|---|
| Top nav with TTS / STT modes | Two tabs, one active at a time, responsive |
| TTS text input | Free text entry, no character limit |
| TTS PDF import | Extracts text into input box; error on failure |
| TTS voice selector | 4 voices (2M / 2F), default selected |
| TTS format selector | MP3 / WAV / WebM, bottom-right, default MP3 |
| TTS generate + player | Spinner during processing; player + download on success; error on failure |
| STT audio upload | MP3 / WAV / WebM; unsupported format shows error |
| STT microphone record | Permission request; recording indicator; stop to finalize |
| STT transcribe | Spinner during processing; text output on success; error on failure |
| STT PDF download | Available after transcription; plain text PDF |
| Global error handling | User-visible messages for all failure states |

---

## What We'd Add With More Time

- **Voice cloning** — upload a reference audio clip to generate speech in that voice
- **More output formats** — FLAC, OGG, M4A
- **Transcription history** — session-based list of recent transcriptions
- **TTS SSML support** — control pauses, emphasis, speed via markup
- **Progress indication for long audio** — estimated time remaining for lengthy files

---

## Non-Goals

- **No authentication** — the app is fully anonymous; no login, no sessions, no user identity
- **No database** — nothing is stored on the server; every request is stateless
- **No voice cloning** — explicitly deferred; not in scope for this build
- **No multi-language support** — English only; no language selector
- **No real-time / streaming transcription** — batch processing only; the full file is processed before output appears
- **No subtitle/SRT export** — text output only, downloadable as PDF

---

## Open Questions

| Question | Needs answering before... |
|---|---|
| Which 4 Kokoro voices specifically? (names/IDs from the model) | /spec |
| PDF text extraction: handled on the frontend (PDF.js) or backend (pypdf)? | /spec |
| Should the audio player in TTS show waveform visualization, or a basic browser player? | /spec |
| Oracle server specs — how much RAM/CPU? Determines which Whisper model size to use (tiny/base/small/medium) | /spec |
