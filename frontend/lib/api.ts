const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function callTTS(text: string, voiceId: string, format: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId, format }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `TTS failed (${res.status})`);
  }
  return res.blob();
}

export async function callSTT(audioFile: File): Promise<{ text: string }> {
  const form = new FormData();
  form.append("audio", audioFile);
  const res = await fetch(`${API_URL}/api/stt`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `STT failed (${res.status})`);
  }
  return res.json();
}
