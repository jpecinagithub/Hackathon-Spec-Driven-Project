"use client";

import { useState } from "react";
import TTSPanel from "../components/TTSPanel";
import STTPanel from "../components/STTPanel";

type Tab = "tts" | "stt";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("tts");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">VoiceForge</h1>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Kokoro &amp; Whisper</p>
          </div>
          <nav className="flex gap-1 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("tts")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "tts"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Text to Speech
            </button>
            <button
              onClick={() => setActiveTab("stt")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "stt"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Speech to Text
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "tts" ? <TTSPanel /> : <STTPanel />}
      </main>
    </div>
  );
}
