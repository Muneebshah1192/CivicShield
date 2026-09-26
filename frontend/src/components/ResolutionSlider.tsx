"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, AlertOctagon } from "lucide-react";

interface ResolutionSliderProps {
  beforeUrl: string;
  afterUrl: string;
  matchScore: number;
  verificationStatus: string;
  workerNotes?: string;
}

export default function ResolutionSlider({
  beforeUrl,
  afterUrl,
  matchScore,
  verificationStatus,
  workerNotes,
}: ResolutionSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-slate-100 text-sm">AI Resolution Verification Evidence</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Match Score:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {matchScore}%
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              verificationStatus === "PASSED"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {verificationStatus}
          </span>
        </div>
      </div>

      {/* Interactive Image Comparison Slider */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden select-none border border-slate-800 bg-slate-950">
        {/* After Image (Base) */}
        <img
          src={afterUrl || "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop"}
          alt="After Repair Evidence"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
          AFTER (WORKER REPAIR)
        </div>

        {/* Before Image (Overlay clipped by slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"}
            alt="Before Damage"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute bottom-2 left-2 bg-red-600/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
            BEFORE (HAZARD)
          </div>
        </div>

        {/* Slider Bar Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white border-2 border-white flex items-center justify-center text-xs shadow-md">
            ↔
          </div>
        </div>

        {/* Hidden Range Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      {workerNotes && (
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-semibold">Field Worker Technical Notes:</span>
          <p className="text-slate-200">{workerNotes}</p>
        </div>
      )}
    </div>
  );
}
