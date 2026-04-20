from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services import kokoro_service
import io

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "af_heart"
    format: str = "mp3"  # "mp3" | "wav" | "webm"

MEDIA_TYPES = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "webm": "audio/webm",
}

VALID_VOICES = {"af_heart", "af_bella", "am_fenrir", "am_michael"}
VALID_FORMATS = {"mp3", "wav", "webm"}

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if request.voice_id not in VALID_VOICES:
        raise HTTPException(status_code=400, detail=f"Invalid voice_id. Must be one of: {VALID_VOICES}")

    if request.format not in VALID_FORMATS:
        raise HTTPException(status_code=400, detail=f"Invalid format. Must be one of: {VALID_FORMATS}")

    try:
        wav_bytes = kokoro_service.generate(request.text, request.voice_id)
        audio_bytes = kokoro_service.convert(wav_bytes, request.format)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

    media_type = MEDIA_TYPES.get(request.format, "audio/mpeg")
    filename = f"speech.{request.format}"

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
