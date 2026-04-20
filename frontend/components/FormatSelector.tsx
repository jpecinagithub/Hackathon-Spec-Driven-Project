"use client";

const FORMATS = ["mp3", "wav", "webm"] as const;
type Format = (typeof FORMATS)[number];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Format</label>
      <div className="flex gap-1">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md uppercase transition-colors ${
              value === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
