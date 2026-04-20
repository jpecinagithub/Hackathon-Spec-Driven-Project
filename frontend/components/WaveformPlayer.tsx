"use client";

import WaveSurfer from "@wavesurfer/react";
import { useState } from "react";
import type WaveSurferInstance from "wavesurfer.js";

interface Props {
  audioUrl: string;
}

export default function WaveformPlayer({ audioUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurferInstance | null>(null);

  const onReady = (ws: WaveSurferInstance) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    if (wavesurfer) wavesurfer.playPause();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <WaveSurfer
        url={audioUrl}
        waveColor="#6366f1"
        progressColor="#818cf8"
        height={64}
        barWidth={2}
        barGap={1}
        barRadius={2}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={onPlayPause}
        className="self-center w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
