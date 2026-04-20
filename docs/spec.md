# VoiceForge — Technical Spec

## Stack

| Layer | Technology | Version | Docs |
|---|---|---|---|
| Frontend framework | Next.js (App Router) | 15.x | https://nextjs.org/docs |
| Styling | Tailwind CSS | 4.x | https://tailwindcss.com/docs |
| Waveform player | @wavesurfer/react | latest | https://wavesurfer.xyz/docs/modules/react |
| PDF extraction | pdfjs-dist (PDF.js) | latest | https://mozilla.github.io/pdf.js/ |
| Backend framework | FastAPI | latest | https://fastapi.tiangolo.com |
| TTS model | kokoro (pip) | latest | https://pypi.org/project/kokoro/ |
| Audio conversion | pydub | latest | https://github.com/jiaaro/pydub |
| STT model | faster-whisper | latest | https://github.com/SYSTRAN/faster-whisper |
| Browser recording | MediaRecorder API | native | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder |

**Rationale:** FastAPI + kokoro + faster-whisper keeps the backend pure Python with no external API calls. Next.js + Tailwind matches Jon's existing stack. All models run locally on the Oracle server — no vendor lock-in, no usage costs.

---

## Runtime & Deployment

- **Runtime:** Web app, runs in any modern browser
- **Backend:** Python 3.11+, FastAPI served via `uvicorn`
- **Frontend:** Next.js served via `npm run start` (production build)
- **Deployment target:** Oracle Cloud server (public URL for anyone to access)
- **Ports:** Backend on `:8000`, frontend on `:3000` (or reverse-proxied via nginx)
- **System dependency:** `ffmpeg` must be installed on the server (`apt install ffmpeg`) — required by pydub for MP3/WebM conversion
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL` — URL of the FastAPI backend (e.g., `http://your-oracle-ip:8000`)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 Browser (Next.js)                │
│                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐ │
│  │    TTS Panel     │   │      STT Panel        │ │
│  │                  │   │                      │ │
│  │  PDF.js (client) │   │  MediaRecorder API   │ │
│  │  WaveSurfer.js   │   │  File upload         │ │
│  └────────┬─────────┘   └──────────┬───────────┘ │
│           │  lib/api.ts (fetch)    │              │
└───────────┼───────────────────────┼──────────────┘
            │                       │
            ▼  HTTP (JSON / multipart/form-data)
┌─────────────────────────────────────────────────┐
│                FastAPI Backend                   │
│                                                  │
│  POST /api/tts           POST /api/stt           │
│  ┌────────────────┐   ┌────────────────────────┐ │
│  │ kokoro_service │   │   whisper_service       │ │
│  │ kokoro model   │   │   faster-whisper small  │ │
│  │ pydub convert  │   │   PyAV (audio decode)   │ │
│  └────────────────┘   └────────────────────────┘ │
│                                                  │
│  Models loaded once at startup (singletons)      │
└─────────────────────────────────────────────────┘
```

**Data flow — TTS:**
1. User types/pastes text or imports PDF (PDF.js extracts text in browser)
2. User selects voice and format
3. `callTTS(text, voiceId, format)` in `lib/api.ts` sends `POST /api/tts` with JSON body
4. FastAPI calls `kokoro_service.generate()` → raw WAV audio
5. pydub converts to requested format (MP3/WAV/WebM)
6. Backend returns audio as `StreamingResponse` with correct `Content-Type`
7. Frontend receives blob → creates object URL → WaveSurfer loads it → download button available

**Data flow — STT:**
1. User uploads audio file or records via MediaRecorder (produces WebM blob)
2. `callSTT(audioFile)` in `lib/api.ts` sends `POST /api/stt` as `multipart/form-data`
3. FastAPI saves file to temp location → `whisper_service.transcribe()` runs faster-whisper
4. Returns `{ "text": "..." }` JSON
5. Frontend displays text → user can download as PDF (generated client-side with jsPDF or plain Blob)

---

## Frontend

### app/page.tsx — Main Page
Implements `prd.md > App Navigation`

- Holds `activeTab: "tts" | "stt"` state
- Renders top navigation with two tabs
- Renders `<TTSPanel />` or `<STTPanel />` based on active tab
- Active tab is visually indicated (Tailwind active class)
- Default tab on load: TTS

### app/layout.tsx — Root Layout
- Sets global font, background, metadata (title: "VoiceForge")
- Includes Tailwind globals

### components/TTSPanel.tsx — TTS Mode Panel
Implements `prd.md > Text to Speech`

Local state:
- `text: string` — current text input
- `selectedVoice: string` — default `"af_heart"`
- `selectedFormat: "mp3" | "wav" | "webm"` — default `"mp3"`
- `isGenerating: boolean`
- `audioUrl: string | null` — object URL of generated audio blob
- `error: string | null`

Behavior:
- Renders `<textarea>` for text input (no character limit)
- Renders PDF import button → calls `extractTextFromPDF()` → sets `text`
- Renders `<VoiceSelector>` and `<FormatSelector>`
- "Generate" button: disabled (no-op) when `text` is empty; calls `callTTS()` when active
- While generating: shows spinner, disables button
- On success: sets `audioUrl`, renders `<WaveformPlayer audioUrl={audioUrl} />` + download button
- On error: sets `error`, shows error message, hides spinner
- Download button: triggers browser download of audio blob in selected format

### components/STTPanel.tsx — STT Mode Panel
Implements `prd.md > Speech to Text`

Local state:
- `audioFile: File | null` — uploaded or recorded audio
- `isRecording: boolean`
- `isTranscribing: boolean`
- `transcription: string`
- `error: string | null`

Behavior:
- Renders `<AudioUploader>` and `<MicRecorder>` side by side
- AudioUploader sets `audioFile`; MicRecorder produces a File/Blob and sets `audioFile` (replaces any previous)
- "Transcribe" button: disabled (no-op) when `audioFile` is null; calls `callSTT()` when active
- While transcribing: shows spinner, disables button
- On success: sets `transcription`, displays in `<textarea>` (read-only)
- On error: sets `error`, shows error message
- "Download PDF" button: visible only when `transcription` is non-empty; generates PDF client-side

### components/WaveformPlayer.tsx — Waveform Audio Player
- Wraps `@wavesurfer/react`
- **Must be imported with `dynamic(() => import(...), { ssr: false })`** in TTSPanel — WaveSurfer uses browser-only APIs
- Props: `audioUrl: string`
- Renders WaveSurfer waveform + play/pause controls
- Loads new audio when `audioUrl` changes

### components/VoiceSelector.tsx — Voice Dropdown
- Props: `value: string`, `onChange: (v: string) => void`
- 4 options hardcoded:

| Label | Value |
|---|---|
| Heart (Female) | `af_heart` |
| Bella (Female) | `af_bella` |
| Fenrir (Male) | `am_fenrir` |
| Michael (Male) | `am_michael` |

### components/FormatSelector.tsx — Format Selector
- Props: `value: string`, `onChange: (v: string) => void`
- 3 options: MP3, WAV, WebM
- Positioned bottom-right within TTS panel via Tailwind

### components/AudioUploader.tsx — Audio File Upload
- Accepts MP3, WAV, WebM (`accept="audio/mpeg,audio/wav,audio/webm"`)
- On unsupported format: shows inline error message
- Sets `audioFile` via callback

### components/MicRecorder.tsx — Microphone Recorder
- Uses `MediaRecorder` API (browser native)
- On mount: does NOT request mic permission — waits for user to click
- On record click: calls `navigator.mediaDevices.getUserMedia({ audio: true })`
  - If denied: shows error message "Microphone access denied"
- While recording: button shows "Stop" state with red indicator
- On stop: creates `File` from recorded blob (type: `audio/webm`), passes to STTPanel via callback

### lib/api.ts — API Client

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function callTTS(
  text: string,
  voiceId: string,
  format: string
): Promise<Blob>

export async function callSTT(
  audioFile: File
): Promise<{ text: string }>
```

- `callTTS`: POST to `/api/tts` with JSON body; returns audio Blob
- `callSTT`: POST to `/api/stt` with FormData; returns parsed JSON
- Both throw `Error` on non-2xx response (caught by panel components to set `error` state)

### lib/pdfUtils.ts — PDF Text Extraction

```ts
export async function extractTextFromPDF(file: File): Promise<string>
```

- Uses `pdfjs-dist` to extract text from uploaded PDF
- Concatenates text across all pages
- Throws on failure (caught by TTSPanel to show error)

### lib/pdfExport.ts — PDF Download for Transcription

```ts
export function downloadTranscriptionAsPDF(text: string): void
```

- Generates a plain-text PDF client-side using the browser Blob API or `jsPDF`
- Triggers download via a temporary `<a>` element

---

## Backend

### main.py — FastAPI Application

```python
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])  # tighten in production
app.include_router(tts_router, prefix="/api")
app.include_router(stt_router, prefix="/api")
```

- CORS configured to allow frontend origin
- Models loaded at startup via `lifespan` handler (not per-request)

### routes/tts.py — TTS Endpoint
Implements `prd.md > Text to Speech`

```
POST /api/tts
Content-Type: application/json

Request body:
{
  "text": string,
  "voice_id": string,   // "af_heart" | "af_bella" | "am_fenrir" | "am_michael"
  "format": string      // "mp3" | "wav" | "webm"
}

Response:
  Content-Type: audio/mpeg | audio/wav | audio/webm
  Body: raw audio bytes (StreamingResponse)

Errors:
  400 — empty text
  500 — generation failed
```

- Validates `text` is non-empty (returns 400 otherwise)
- Calls `kokoro_service.generate(text, voice_id)` → returns WAV bytes
- Calls `kokoro_service.convert(wav_bytes, format)` → returns converted bytes
- Returns `StreamingResponse` with appropriate `media_type`

### routes/stt.py — STT Endpoint
Implements `prd.md > Speech to Text`

```
POST /api/stt
Content-Type: multipart/form-data

Request:
  audio: File   // MP3, WAV, or WebM

Response:
{
  "text": string
}

Errors:
  400 — no file provided
  500 — transcription failed
```

- Saves uploaded file to a temp file
- Calls `whisper_service.transcribe(filepath)` → returns text string
- Cleans up temp file
- Returns `{ "text": ... }`

### services/kokoro_service.py — Kokoro TTS Wrapper

```python
# Loaded once at startup
pipeline = KPipeline(lang_code='a')  # 'a' = American English

def generate(text: str, voice_id: str) -> bytes:
    # Returns raw WAV bytes

def convert(wav_bytes: bytes, format: str) -> bytes:
    # Uses pydub to convert WAV → MP3 / WAV / WebM
    # Returns converted audio bytes
```

- `KPipeline` from `kokoro` package, loaded as module-level singleton
- `generate()` calls the pipeline with the given voice, collects audio chunks, returns WAV
- `convert()` wraps pydub `AudioSegment.from_wav()` → `export(format=...)`
- WebM export uses pydub with `codec="libopus"` (requires ffmpeg)

### services/whisper_service.py — Whisper STT Wrapper

```python
# Loaded once at startup
model = WhisperModel("small", device="cpu", compute_type="int8")

def transcribe(filepath: str) -> str:
    # Returns full transcription as a single string
```

- `WhisperModel` from `faster_whisper`, loaded as module-level singleton
- `transcribe()` calls `model.transcribe(filepath, language="en")` — language fixed to English
- Joins all segments into a single string and returns it

---

## File Structure

```
voiceforge/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, lifespan, routers
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── tts.py                 # POST /api/tts
│   │   └── stt.py                 # POST /api/stt
│   ├── services/
│   │   ├── __init__.py
│   │   ├── kokoro_service.py      # Kokoro model + pydub conversion
│   │   └── whisper_service.py     # faster-whisper model
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Main page — tab state + layout
│   │   ├── layout.tsx             # Root layout, metadata
│   │   └── globals.css            # Tailwind base
│   ├── components/
│   │   ├── TTSPanel.tsx           # Full TTS mode UI + logic
│   │   ├── STTPanel.tsx           # Full STT mode UI + logic
│   │   ├── WaveformPlayer.tsx     # @wavesurfer/react wrapper (SSR disabled)
│   │   ├── VoiceSelector.tsx      # 4-voice dropdown
│   │   ├── FormatSelector.tsx     # MP3/WAV/WebM picker
│   │   ├── AudioUploader.tsx      # Audio file input
│   │   └── MicRecorder.tsx        # MediaRecorder hook + button
│   ├── lib/
│   │   ├── api.ts                 # callTTS() and callSTT()
│   │   ├── pdfUtils.ts            # extractTextFromPDF() via PDF.js
│   │   └── pdfExport.ts           # downloadTranscriptionAsPDF()
│   ├── .env.local                 # NEXT_PUBLIC_API_URL=http://localhost:8000
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
└── process-notes.md
```

---

## Key Technical Decisions

| Decision | Choice | Tradeoff accepted |
|---|---|---|
| PDF extraction location | Client-side (PDF.js) | No server load; works offline for this step; large PDFs may be slow in browser |
| Whisper model size | `small` | Good accuracy/speed balance; `base` is faster but less accurate, `medium` is better but slower |
| Model loading strategy | Singletons at startup | Adds ~5-10s to server start time; eliminates per-request latency |
| PDF generation for transcription | Client-side (Blob API or jsPDF) | No server dependency; simple plain-text output |
| WaveSurfer SSR | `dynamic import, ssr: false` | Required because WaveSurfer uses Web Audio API; no server-side rendering for that component |

---

## Dependencies & External Services

### Backend (`requirements.txt`)
```
fastapi
uvicorn[standard]
python-multipart          # for file uploads in FastAPI
kokoro                    # Kokoro TTS — https://pypi.org/project/kokoro/
faster-whisper            # STT — https://github.com/SYSTRAN/faster-whisper
pydub                     # audio format conversion — https://github.com/jiaaro/pydub
soundfile                 # WAV I/O support
```
**System dependency:** `ffmpeg` — `apt install ffmpeg`

### Frontend (`package.json` key deps)
```
next, react, react-dom
tailwindcss
@wavesurfer/react         # https://www.npmjs.com/package/@wavesurfer/react
pdfjs-dist                # https://www.npmjs.com/package/pdfjs-dist
jspdf                     # https://www.npmjs.com/package/jspdf (for transcription PDF export)
```

---

## Open Issues

| Issue | Needs resolving before... |
|---|---|
| Safari records in MP4 via MediaRecorder, not WebM — faster-whisper handles it via PyAV but worth testing | Build |
| `kokoro` pip package version stability — check PyPI for latest before installing | Build |
| CORS `allow_origins=["*"]` is fine for hackathon; tighten to Oracle frontend URL before going fully public | Post-hackathon |
| pydub WebM export with `libopus` codec requires ffmpeg with libopus support — verify with `ffmpeg -codecs | grep opus` on Oracle | Build |
