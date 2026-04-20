"use client";

import { useState } from "react";
import { callSTT } from "../lib/api";
import { downloadTranscriptionAsPDF } from "../lib/pdfExport";
import AudioUploader from "./AudioUploader";
import MicRecorder from "./MicRecorder";

export default function STTPanel() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setAudioFile(file);
    setAudioName(file.name);
    setError(null);
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setIsTranscribing(true);
    setError(null);
    setTranscription("");
    try {
      const result = await callSTT(audioFile);
      setTranscription(result.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Audio input row */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-300">Audio</label>
        <div className="flex flex-wrap gap-3 items-start">
          <AudioUploader onFile={handleFile} />
          <MicRecorder onRecording={handleFile} />
        </div>
        {audioName && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {audioName}
          </p>
        )}
      </div>

      {/* Transcribe button */}
      <div>
        <button
          type="button"
          onClick={handleTranscribe}
          disabled={!audioFile || isTranscribing}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isTranscribing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Transcribing...
            </>
          ) : (
            "Transcribe"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Transcription output */}
      {transcription && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-300">Transcription</label>
          <textarea
            readOnly
            value={transcription}
            rows={10}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 resize-none focus:outline-none"
          />
          <button
            type="button"
            onClick={() => downloadTranscriptionAsPDF(transcription)}
            className="self-end flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
