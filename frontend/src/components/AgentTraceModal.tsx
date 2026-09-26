"use client";

import { useEffect, useState } from "react";
import { fetchAgentTrace } from "@/lib/api";
import { Cpu, CheckCircle2, Clock, ShieldCheck, X, Sparkles, AlertTriangle } from "lucide-react";

interface AgentTraceModalProps {
  incidentId: string;
  onClose: () => void;
}

export default function AgentTraceModal({ incidentId, onClose }: AgentTraceModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentTrace(incidentId)
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">Multi-Agent Operational Trace</h3>
                <span className="font-mono text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                  {incidentId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step evidence, tool calls, & confidence metrics across 10 specialized agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Running multi-agent trace query...
            </div>
          ) : !data || !data.runs || data.runs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No agent runs recorded for this incident. Trigger simulation to generate agent graph execution.
            </div>
          ) : (
            <div className="space-y-4">
              {data.runs.map((run: any, idx: number) => (
                <div key={run.id || idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-100 text-sm">{run.agent_name}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold">
                        {run.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Conf: <strong className="text-blue-400">{(run.confidence * 100).toFixed(0)}%</strong></span>
                      <span>Latency: <strong className="text-slate-300">{run.latency_ms}ms</strong></span>
                    </div>
                  </div>

                  {/* Output payload structured view */}
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(run.output, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operational safety governed — Zero private LLM tokens exposed</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg font-semibold transition-colors"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
