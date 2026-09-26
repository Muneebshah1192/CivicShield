"use client";

import { useEffect, useState } from "react";
import { fetchWhatIfSimulation } from "@/lib/api";
import { Sparkles, ShieldAlert, DollarSign, Clock, CheckCircle2, X } from "lucide-react";

interface WhatIfModalProps {
  incidentId: string;
  onClose: () => void;
}

export default function WhatIfModal({ incidentId, onClose }: WhatIfModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatIfSimulation(incidentId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [incidentId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">Decision-Support Response Simulator</h3>
                <span className="font-mono text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                  {incidentId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Simulate alternative municipal operational strategies before dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              Calculating decision simulation matrix...
            </div>
          ) : !data || !data.scenarios ? (
            <div className="py-12 text-center text-slate-400 text-sm">Failed to generate what-if matrix.</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center text-slate-300">
                <span>Target Incident Category: <strong className="text-slate-100">{data.incident_category}</strong></span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Decision-Support Estimate (Not Certainty)
                </span>
              </div>

              {data.scenarios.map((sc: any, idx: number) => (
                <div
                  key={idx}
                  className={`bg-slate-800/60 border rounded-xl p-4 space-y-3 transition-all ${
                    sc.recommendation_rank === 1
                      ? "border-emerald-500/50 bg-emerald-950/10 ring-1 ring-emerald-500/30"
                      : "border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sc.recommendation_rank === 1 && (
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          RECOMMENDED STRATEGY
                        </span>
                      )}
                      <h4 className="font-bold text-slate-100 text-sm">{sc.name}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{sc.summary}</p>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Risk Reduction</span>
                      <strong className="text-emerald-400 text-xs">{sc.risk_reduction}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Est. Cost Impact</span>
                      <strong className="text-amber-400 text-xs">{sc.cost}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Response Speed</span>
                      <strong className="text-blue-400 text-xs">{sc.response_time}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
