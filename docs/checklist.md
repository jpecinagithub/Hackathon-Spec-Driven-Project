# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A (autonomous mode)
- **Git:** Single commit at the end
- **Verification:** No — agent builds straight through the full checklist. Summary at the end.
- **Check-in cadence:** N/A (autonomous mode)

---

## Checklist

- [x] **1. Project scaffold — folder structure and dependencies**
  Spec ref: `spec.md > File Structure`
  What to build: Create the full folder structure for the monorepo: `backend/` with `routes/`, `services/`, and `requirements.txt`; `frontend/` initialized as a Next.js 15 app with Tailwind CSS. Install all backend dependencies (`fastapi`, `uvicorn[standard]`, `python-multipart`, `kokoro`, `faster-whisper`, `pydub`, `soundfile`). Install all frontend dependencies (`@wavesurfer/react`, `pdfjs-dist`, `jspdf`). Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`. Create all empty placeholder files matching the file tree in the spec so the structure is complete from the start.
  Acceptance: Running `ls backend/` shows `main.py`, `routes/`, `services/`, `requirements.txt`. Running `ls frontend/` shows a valid Next.js project with `app/`, `components/`, `lib/`. `node_modules` is present in `frontend/`.
  Verify: Open a terminal in `backend/` and run `pip install -r requirements.txt` — no errors. Open a terminal in `frontend/` and run `npm run dev` — Next.js starts on port 3000 with no errors.

- [x] **2. FastAPI app + CORS + model loading at startup**
  Spec ref: `spec.md > Backend > main.py`, `spec.md > Backend > services/kokoro_service.py`, `spec.md > Backend > services/whisper_service.py`
  What to build: Write `backend/main.py` with a FastAPI app, `CORSMiddleware` configured with `allow_origins=["*"]`, and a `lifespan` handler that loads both the Kokoro pipeline (`KPipeline(lang_code='a')`) and the Whisper model (`WhisperModel("small", device="cpu", compute_type="int8")`) at startup as module-level singletons. Write `services/kokoro_service.py` with the `KPipeline` singleton and stub `generate()` and `convert()` functions. Write `services/whisper_service.py` with the `WhisperModel` singleton and stub `transcribe()` function. Mount both routers from `routes/tts.py` and `routes/stt.py` (create empty router files for now).
  Acceptance: Server starts without errors. Both models load successfully during startup (visible in the uvicorn logs). No import errors.
  Verify: Run `uvicorn main:app --reload` from `backend/`. Check the terminal output — both models should finish loading within ~10-20 seconds. Open `http://localhost:8000/docs` — FastAPI docs page loads.

- [x] **3. TTS endpoint — Kokoro generation + pydub format conversion**
  Spec ref: `spec.md > Backend > routes/tts.py`, `spec.md > Backend > services/kokoro_service.py`
  What to build: Implement `services/kokoro_service.py` fully: `generate(text, voice_id)` calls the Kokoro pipeline with the given voice, collects audio chunks, and returns WAV bytes. `convert(wav_bytes, format)` uses pydub to convert WAV → MP3, WAV, or WebM (`codec="libopus"` for WebM). Implement `routes/tts.py`: `POST /api/tts` accepts JSON body `{ text, voice_id, format }`, validates that `text` is non-empty (returns 400 otherwise), calls `kokoro_service.generate()` then `kokoro_service.convert()`, and returns a `StreamingResponse` with the correct `media_type` (`audio/mpeg` for mp3, `audio/wav` for wav, `audio/webm` for webm).
  Acceptance: See `prd.md > Text to Speech`. Sending a valid request returns an audio file in the requested format. Sending an empty `text` returns a 400 error.
  Verify: Use curl or the FastAPI `/docs` UI to send `POST /api/tts` with `{"text": "Hello, this is a test.", "voice_id": "af_heart", "format": "mp3"}`. A valid MP3 audio file is returned. Test with `"format": "wav"` and `"format": "webm"` as well. Test with empty `text` — confirm 400 is returned.

- [x] **4. STT endpoint — faster-whisper transcription**
  Spec ref: `spec.md > Backend > routes/stt.py`, `spec.md > Backend > services/whisper_service.py`
  What to build: Implement `services/whisper_service.py` fully: `transcribe(filepath)` calls `model.transcribe(filepath, language="en")`, joins all segments into a single string, and returns it. Implement `routes/stt.py`: `POST /api/stt` accepts `multipart/form-data` with an `audio` file field, saves it to a temp file (use Python's `tempfile` module), calls `whisper_service.transcribe(temp_path)`, deletes the temp file, and returns `{ "text": "..." }`. Returns 400 if no file is provided, 500 if transcription fails.
  Acceptance: See `prd.md > Speech to Text`. Uploading an audio file returns a JSON object with the transcription text. English speech is correctly transcribed.
  Verify: Use curl to send `POST /api/stt` with a short WAV or MP3 file containing English speech. The response JSON contains accurate transcription text. Test with a short recorded sentence — confirm the text matches what was said.

- [ ] **5. Frontend app shell + tab navigation**
  Spec ref: `spec.md > Frontend > app/page.tsx`, `spec.md > Frontend > app/layout.tsx`
  What to build: Write `app/layout.tsx` with root layout, metadata (`title: "VoiceForge"`), and Tailwind globals. Write `app/page.tsx` with `activeTab: "tts" | "stt"` state (default `"tts"`), a top navigation bar with two buttons ("Text to Speech" and "Speech to Text"), and conditional rendering of `<TTSPanel />` or `<STTPanel />` based on the active tab. Active tab is visually indicated (e.g., bottom border or background highlight using Tailwind). Layout is responsive — works on mobile and desktop. Create empty `TTSPanel.tsx` and `STTPanel.tsx` components that just render a placeholder div so the page loads without errors.
  Acceptance: See `prd.md > App Navigation`. The top nav shows two tabs. Clicking each tab switches the active view and updates the visual indicator. Renders correctly on mobile viewport.
  Verify: Run `npm run dev`. Open `http://localhost:3000`. Two tabs visible. Click each — active state updates. Resize browser to mobile width — layout remains clean.

- [ ] **6. TTS Panel — full UI with WaveSurfer player and audio download**
  Spec ref: `spec.md > Frontend > components/TTSPanel.tsx`, `spec.md > Frontend > components/WaveformPlayer.tsx`, `spec.md > Frontend > components/VoiceSelector.tsx`, `spec.md > Frontend > components/FormatSelector.tsx`, `spec.md > Frontend > lib/api.ts`
  What to build: Implement `lib/api.ts` with `callTTS(text, voiceId, format)` — sends `POST` to `${NEXT_PUBLIC_API_URL}/api/tts` with JSON body, returns audio Blob on success, throws Error on non-2xx. Implement `VoiceSelector.tsx` with 4 hardcoded options (af_heart/Heart Female, af_bella/Bella Female, am_fenrir/Fenrir Male, am_michael/Michael Male). Implement `FormatSelector.tsx` with MP3/WAV/WebM options, positioned bottom-right. Implement `WaveformPlayer.tsx` wrapping `@wavesurfer/react` — loads `audioUrl` prop, shows waveform + play/pause. Implement full `TTSPanel.tsx`: textarea, VoiceSelector, FormatSelector, Generate button (no-op when text empty), spinner while generating, WaveformPlayer + download button on success, error message on failure. Import WaveformPlayer with `dynamic(..., { ssr: false })`.
  Acceptance: See `prd.md > Text to Speech`. Type text, select voice and format, click Generate — spinner appears, then waveform player loads with generated audio. Clicking download saves the file in the selected format. Empty textarea → Generate does nothing. Backend error → error message shown.
  Verify: With backend running, type "Hello world" in the TTS panel, select "Heart (Female)" and "MP3", click Generate. Spinner appears, then waveform renders. Click play — audio plays. Click download — MP3 file downloads. Clear the textarea and click Generate — nothing happens.

- [ ] **7. TTS PDF import — PDF.js text extraction**
  Spec ref: `spec.md > Frontend > lib/pdfUtils.ts`
  What to build: Write `lib/pdfUtils.ts` with `extractTextFromPDF(file: File): Promise<string>` using `pdfjs-dist`. Configure the PDF.js worker (set `GlobalWorkerOptions.workerSrc` to the CDN or local path). The function loads the PDF, iterates all pages, extracts text content, and returns the concatenated text. Add an "Import PDF" button to `TTSPanel.tsx` next to the textarea that opens a file picker (accept `.pdf`), calls `extractTextFromPDF()`, and sets the textarea value. Show an inline error message if extraction fails or the PDF is empty.
  Acceptance: See `prd.md > Text to Speech` (PDF import story). Clicking "Import PDF" opens a file picker. Selecting a valid PDF populates the textarea with the extracted text. Selecting a corrupt or empty PDF shows an error message.
  Verify: Import a PDF with known text — confirm the extracted text appears correctly in the textarea. Try generating TTS from that imported text — confirm audio is generated successfully.

- [ ] **8. STT Panel — audio upload + transcribe + text display**
  Spec ref: `spec.md > Frontend > components/STTPanel.tsx`, `spec.md > Frontend > components/AudioUploader.tsx`, `spec.md > Frontend > lib/api.ts`
  What to build: Implement `callSTT(audioFile)` in `lib/api.ts` — sends `POST` to `${NEXT_PUBLIC_API_URL}/api/stt` as FormData with the audio file, returns `{ text: string }` on success, throws Error on non-2xx. Implement `AudioUploader.tsx` — file input accepting MP3/WAV/WebM, shows inline error on unsupported format, calls callback with the selected file. Implement `STTPanel.tsx`: `AudioUploader` at the top (MicRecorder placeholder next to it for now), Transcribe button (no-op when no file), spinner while transcribing, transcription output in a read-only textarea, error message on failure. "Download PDF" button visible only when transcription is non-empty (placeholder for now — wired up in step 10).
  Acceptance: See `prd.md > Speech to Text`. Upload an MP3/WAV/WebM file, click Transcribe — spinner appears, then transcription text is shown. Empty state (no file) → Transcribe does nothing. Unsupported format → inline error.
  Verify: With backend running, upload a short audio file with English speech. Click Transcribe. Confirm transcription appears in the text area and is accurate. Try uploading a .txt file — confirm unsupported format error appears.

- [ ] **9. Microphone recorder — MediaRecorder integration**
  Spec ref: `spec.md > Frontend > components/MicRecorder.tsx`
  What to build: Implement `MicRecorder.tsx` using the browser `MediaRecorder` API. On record button click: call `navigator.mediaDevices.getUserMedia({ audio: true })`. If permission denied: show error message "Microphone access denied." If granted: start recording, change button to "Stop" state with a red indicator. On stop: collect recorded chunks into a Blob (type `audio/webm`), create a `File` from the Blob, pass it to `STTPanel` via callback to set as the active audio input (replaces any uploaded file). Wire `MicRecorder` into `STTPanel` next to `AudioUploader`.
  Acceptance: See `prd.md > Speech to Text` (microphone recording story). Record button visible alongside upload field. Clicking it requests mic permission. While recording: Stop button with red indicator shown. Clicking Stop ends recording and sets the audio for transcription. Clicking Transcribe after recording → transcription appears.
  Verify: Click the record button — browser prompts for mic permission. Grant it and speak a short sentence. Click Stop. Click Transcribe — confirm the speech is accurately transcribed. Test denying mic permission — confirm error message appears.

- [ ] **10. Transcription PDF export**
  Spec ref: `spec.md > Frontend > lib/pdfExport.ts`
  What to build: Write `lib/pdfExport.ts` with `downloadTranscriptionAsPDF(text: string): void` using `jsPDF`. The function creates a jsPDF document, adds the transcription text with word-wrapping, and triggers a browser download as `transcription.pdf`. Wire the "Download PDF" button in `STTPanel.tsx` to call this function. The button should only be active (not greyed out) when `transcription` is non-empty.
  Acceptance: See `prd.md > Speech to Text` (PDF download story). After a transcription is generated, the "Download PDF" button becomes active. Clicking it downloads a `transcription.pdf` file containing the plain transcription text. The PDF is readable and the text is complete.
  Verify: Transcribe an audio file. Click "Download PDF." Open the downloaded PDF — confirm it contains the full transcription text, readable and complete. Confirm the button is inactive (greyed out or hidden) before any transcription has been generated.
