"use client";

import { useRef, useState } from "react";

const ACCEPTED = ["audio/mpeg", "audio/wav", "audio/webm"];
const ACCEPTED_EXT = [".mp3", ".wav", ".webm"];

interface Props {
  onFile: (file: File) => void;
}

export default function AudioUploader({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type) && !ACCEPTED_EXT.some((ext) => file.name.endsWith(ext))) {
      setError("Unsupported format. Please upload MP3, WAV, or WebM.");
      e.target.value = "";
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div className="flex flex-col gap-1 flex-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 border-dashed rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload audio
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.webm,audio/mpeg,audio/wav,audio/webm"
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
