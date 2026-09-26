"use client";

import { useState } from "react";
import { useCivicShieldStore } from "@/lib/store";
import { Sparkles, ArrowRight, CheckCircle2, X, ShieldAlert, Camera, MapPin, Cpu } from "lucide-react";

export default function OnboardingGuide() {
  const { showOnboardingGuide, setShowOnboardingGuide } = useCivicShieldStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboardingGuide) return null;

  const steps = [
    {
      title: "Welcome to CivicShield AI",
      desc: "An intelligent urban emergency & complaint platform. Let's walk through how to report and track infrastructure hazards in 3 simple steps.",
      icon: Sparkles,
      color: "text-blue-400 bg-blue-500/20",
    },
    {
      title: "1. Capture & Upload Photo",
      desc: "Take a picture of the pothole, flooded road, or fallen wire. Our modular YOLO AI agent immediately assesses surface depth and safety risk.",
      icon: Camera,
      color: "text-amber-400 bg-amber-500/20",
    },
    {
      title: "2. Automatic GPS Location",
      desc: "CivicShield uses your device coordinates to identify the municipal zone, ward, and proximity to critical assets like hospitals or transit arteries.",
      icon: MapPin,
      color: "text-emerald-400 bg-emerald-500/20",
    },
    {
      title: "3. Live Tracking & Verification",
      desc: "Track dispatch status step-by-step. Once the municipal field crew finishes repair, AI compares before/after photos and asks for your confirmation!",
      icon: CheckCircle2,
      color: "text-indigo-400 bg-indigo-500/20",
    },
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 light:bg-white text-slate-100 light:text-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border border-white/10 ${current.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h4 className="font-bold text-sm leading-tight text-slate-100 light:text-slate-900">{current.title}</h4>
            </div>
          </div>
          <button
            onClick={() => setShowOnboardingGuide(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg"
            title="Dismiss Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">{current.desc}</p>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 light:border-slate-200">
          <button
            onClick={() => setShowOnboardingGuide(false)}
            className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
          >
            Skip Guide
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowOnboardingGuide(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
              >
                Got It!
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
