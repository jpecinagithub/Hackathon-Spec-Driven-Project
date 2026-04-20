"use client";

const VOICES = [
  { id: "af_heart", label: "Heart (Female)" },
  { id: "af_bella", label: "Bella (Female)" },
  { id: "am_fenrir", label: "Fenrir (Male)" },
  { id: "am_michael", label: "Michael (Male)" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function VoiceSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Voice</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {VOICES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
