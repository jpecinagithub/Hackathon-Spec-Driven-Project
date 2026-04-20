from kokoro import KPipeline
import io
import soundfile as sf
import numpy as np

_pipeline = None


def load():
    global _pipeline
    _pipeline = KPipeline(lang_code='a')  # 'a' = American English


def generate(text: str, voice_id: str) -> bytes:
    """Generate speech from text using Kokoro. Returns WAV bytes."""
    generator = _pipeline(text, voice=voice_id, speed=1.0)
    audio_chunks = []
    for _, _, audio in generator:
        audio_chunks.append(audio)
    audio_data = np.concatenate(audio_chunks, axis=0)
    buf = io.BytesIO()
    sf.write(buf, audio_data, 24000, format='WAV')
    buf.seek(0)
    return buf.read()


def convert(wav_bytes: bytes, format: str) -> bytes:
    """Convert WAV bytes to the requested format using pydub."""
    from pydub import AudioSegment
    buf_in = io.BytesIO(wav_bytes)
    audio = AudioSegment.from_wav(buf_in)
    buf_out = io.BytesIO()
    if format == 'mp3':
        audio.export(buf_out, format='mp3')
    elif format == 'webm':
        audio.export(buf_out, format='webm', codec='libopus')
    else:  # wav
        audio.export(buf_out, format='wav')
    buf_out.seek(0)
    return buf_out.read()
