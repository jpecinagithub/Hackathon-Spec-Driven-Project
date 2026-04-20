from faster_whisper import WhisperModel

_model = None


def load():
    global _model
    _model = WhisperModel("small", device="cpu", compute_type="int8")


def transcribe(filepath: str) -> str:
    """Transcribe audio file. Returns full text as a single string."""
    segments, _ = _model.transcribe(filepath, language="en")
    return " ".join(segment.text.strip() for segment in segments)
