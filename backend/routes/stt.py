from fastapi import APIRouter, HTTPException, UploadFile, File
from services import whisper_service
import tempfile
import os

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".webm", ".mp4", ".m4a", ".ogg"}

@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    if not audio or not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    ext = os.path.splitext(audio.filename)[1].lower()
    # Accept common audio formats — faster-whisper handles them via PyAV

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        text = whisper_service.transcribe(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return {"text": text}
