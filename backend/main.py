from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.tts import router as tts_router
from routes.stt import router as stt_router
from services import kokoro_service, whisper_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Models are loaded as module-level singletons in their service files.
    # Importing them here triggers loading at startup.
    print("Loading Kokoro TTS model...")
    kokoro_service.load()
    print("Kokoro ready.")
    print("Loading Whisper STT model...")
    whisper_service.load()
    print("Whisper ready.")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tts_router, prefix="/api")
app.include_router(stt_router, prefix="/api")
