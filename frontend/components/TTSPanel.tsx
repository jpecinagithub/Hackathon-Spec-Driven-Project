"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { callTTS } from "../lib/api";
import { extractTextFromPDF } from "../lib/pdfUtils";
import FormatSelector from "./FormatSelector";
import VoiceSelector from "./VoiceSelector";

const WaveformPlayer = dynamic(() => import("./WaveformPlayer"), { ssr: false });

export default function TTSPanel() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("af_heart");
  const [format, setFormat] = useState("mp3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    try {
      const blob = await callTTS(text, voice, format);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioBlob || !audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `speech.${format}`;
    a.click();
  };

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError(null);
    try {
      const extracted = await extractTextFromPDF(file);
      setText(extracted);
    } catch {
      setPdfError("Could not extract text from PDF.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Text</label>
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import PDF
          </button>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfImport}
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here, or import a PDF..."
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {pdfError && <p className="text-xs text-red-400">{pdfError}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <VoiceSelector value={voice} onChange={setVoice} />
        <div className="flex items-end gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <FormatSelector value={format} onChange={setFormat} />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="flex flex-col gap-3">
          <WaveformPlayer audioUrl={audioUrl} />
          <button
            type="button"
            onClick={handleDownload}
            className="self-end flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {format.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}
