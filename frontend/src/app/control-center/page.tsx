"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import AgentTraceModal from "@/components/AgentTraceModal";
import WhatIfModal from "@/components/WhatIfModal";
import ResolutionSlider from "@/components/ResolutionSlider";
import { fetchIncidents, fetchDashboardAnalytics, fetchHotspots, assignWorker } from "@/lib/api";
import { useCivicShieldStore } from "@/lib/store";
import { Map, Activity, Filter, Cpu, Sparkles, UserCheck, AlertTriangle, ShieldCheck, ShieldAlert, Radio } from "lucide-react";

const ControlMap = dynamic(() => import("@/components/ControlMap"), { ssr: false });

export default function ControlCenter() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // Modals state
  const [traceIncidentId, setTraceIncidentId] = useState<string | null>(null);
  const [whatIfIncidentId, setWhatIfIncidentId] = useState<string | null>(null);

  const { activeFilterStatus, setActiveFilterStatus, showHotspots, setShowHotspots } = useCivicShieldStore();

  const loadData = () => {
    fetchIncidents().then((data) => {
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) setSelectedIncident(data[0]);
    }).catch(console.error);

    fetchDashboardAnalytics().then(setAnalytics).catch(console.error);
    fetchHotspots().then(setHotspots).catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignWorkerClick = async (incidentId: string, workerId: number) => {
    try {
      await assignWorker(incidentId, workerId);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign worker.");
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilterStatus !== "ALL" && inc.status !== activeFilterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col transition-colors">
      <Navbar />

      {/* Control Center Header Toolbar */}
      <div className="bg-slate-900 light:bg-white border-b border-slate-800 light:border-slate-300 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 text-blue-400 light:text-blue-600 p-2 rounded-xl border border-blue-500/30">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 light:text-slate-900">Municipal Situation Command Center</h1>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 animate-ping" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600 font-mono">Real-time Triage, YOLO Damage Parameters & Spatial Risk Matrix</p>
          </div>
        </div>

        {/* Filter Controls & Layer Toggles */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center bg-slate-950 light:bg-slate-100 p-1 rounded-xl border border-slate-800 light:border-slate-300 font-mono text-[11px]">
            <span className="text-slate-400 light:text-slate-500 px-2 font-medium">Status:</span>
            {["ALL", "REPORTED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setActiveFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeFilterStatus === st
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 light:text-slate-600 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
              showHotspots
                ? "bg-red-500/20 text-red-400 border-red-500/40 ring-1 ring-red-500/30"
                : "bg-slate-900 light:bg-white text-slate-300 light:text-slate-700 border-slate-800 light:border-slate-300 hover:border-slate-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            Predictive Hotspots ({hotspots.length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaflet Situation Map & Incident Queue */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-slate-800 light:border-slate-300 shadow-2xl">
            <ControlMap
              incidents={filteredIncidents}
              hotspots={hotspots}
              onSelectIncident={(id) => {
                const found = incidents.find((i) => i.id === id);
                if (found) setSelectedIncident(found);
              }}
              onOpenAgentTrace={(id) => setTraceIncidentId(id)}
              onOpenWhatIf={(id) => setWhatIfIncidentId(id)}
            />
          </div>

          {/* Incident Queue Table */}
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 space-y-4 shadow-xl flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-3">
              <h3 className="font-bold text-slate-100 light:text-slate-900 text-sm">
                Incident Triage Matrix ({filteredIncidents.length} Records)
              </h3>
              <span className="text-xs text-slate-400 light:text-slate-600 font-mono">Priority Calibrated Order</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
                <thead className="bg-slate-950 light:bg-slate-100 text-slate-400 light:text-slate-600 uppercase font-mono border-b border-slate-800 light:border-slate-300 text-[10px]">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Hazard & Title</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Assigned Lead</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 font-mono text-[11px]">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`hover:bg-slate-800/40 light:hover:bg-slate-100 cursor-pointer transition-colors ${
                        selectedIncident?.id === inc.id ? "bg-blue-900/20 light:bg-blue-50 border-l-2 border-blue-500" : ""
                      }`}
                    >
                      <td className="p-2.5 font-bold text-blue-400 light:text-blue-600">{inc.id}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-100 light:text-slate-900 max-w-xs truncate">{inc.title}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.severity_level === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 light:text-red-700"
                              : inc.severity_level === "HIGH"
                              ? "bg-amber-500/20 text-amber-400 light:text-amber-700"
                              : "bg-blue-500/20 text-blue-400 light:text-blue-700"
                          }`}
                        >
                          {inc.severity_level} ({inc.risk_score})
                        </span>
                      </td>
                      <td className="p-2.5 text-emerald-400 light:text-emerald-700 font-semibold">{inc.status}</td>
                      <td className="p-2.5 text-slate-300 light:text-slate-700">{inc.department?.name || "Municipal Works"}</td>
                      <td className="p-2.5 text-slate-400 light:text-slate-600">{inc.assigned_worker?.user?.full_name || "Unassigned"}</td>
                      <td className="p-2.5 text-right font-sans">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTraceIncidentId(inc.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow"
                          >
                            <Cpu className="w-3 h-3" />
                            Trace
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhatIfIncidentId(inc.id);
                            }}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow"
                          >
                            <Sparkles className="w-3 h-3" />
                            What-If
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Incident Inspector Panel */}
        <div className="lg:col-span-4 space-y-6">
          {selectedIncident ? (
            <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 space-y-5 shadow-2xl sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-3">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-400 light:text-blue-600">{selectedIncident.id}</span>
                  <h3 className="font-bold text-slate-100 light:text-slate-900 text-base">{selectedIncident.title}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    selectedIncident.severity_level === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 light:text-red-700 border border-red-500/30"
                      : "bg-blue-500/20 text-blue-400 light:text-blue-700"
                  }`}
                >
                  {selectedIncident.severity_level}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 light:bg-slate-50 p-3 rounded-2xl border border-slate-800 light:border-slate-300 space-y-1">
                  <span className="text-slate-400 light:text-slate-500 font-semibold block">Citizen Description</span>
                  <p className="text-slate-200 light:text-slate-800 leading-relaxed">{selectedIncident.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-950 light:bg-slate-50 p-2.5 rounded-xl border border-slate-800 light:border-slate-300">
                    <span className="text-[10px] text-slate-400 light:text-slate-500 block">Risk Score</span>
                    <strong className="text-red-400 light:text-red-600 text-sm">{selectedIncident.risk_score}/100</strong>
                  </div>
                  <div className="bg-slate-950 light:bg-slate-50 p-2.5 rounded-xl border border-slate-800 light:border-slate-300">
                    <span className="text-[10px] text-slate-400 light:text-slate-500 block">Status</span>
                    <strong className="text-emerald-400 light:text-emerald-700 text-sm">{selectedIncident.status}</strong>
                  </div>
                </div>

                {/* Worker Assignment Card */}
                <div className="bg-slate-950 light:bg-slate-50 p-3 rounded-2xl border border-slate-800 light:border-slate-300 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 light:text-slate-500 font-semibold">Assigned Field Crew</span>
                    <span className="text-[10px] text-blue-400 light:text-blue-600 font-mono font-bold">Smart Dispatch</span>
                  </div>
                  <div className="font-semibold text-slate-100 light:text-slate-900 flex items-center justify-between">
                    <span>{selectedIncident.assigned_worker?.user?.full_name || "Unassigned"}</span>
                    {!selectedIncident.assigned_worker_id && (
                      <button
                        onClick={() => handleAssignWorkerClick(selectedIncident.id, 1)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                      >
                        Assign Lead #1
                      </button>
                    )}
                  </div>
                </div>

                {/* Resolution Evidence Comparison Slider */}
                {selectedIncident.resolution_evidence && (
                  <ResolutionSlider
                    beforeUrl={selectedIncident.resolution_evidence.before_image_url}
                    afterUrl={selectedIncident.resolution_evidence.after_image_url}
                    matchScore={selectedIncident.resolution_evidence.ai_match_score}
                    verificationStatus={selectedIncident.resolution_evidence.verification_status}
                    workerNotes={selectedIncident.resolution_evidence.worker_notes}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-8 text-center text-slate-500 text-xs">
              Select an incident from the map or triage queue to inspect multi-agent evidence.
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {traceIncidentId && <AgentTraceModal incidentId={traceIncidentId} onClose={() => setTraceIncidentId(null)} />}
      {whatIfIncidentId && <WhatIfModal incidentId={whatIfIncidentId} onClose={() => setWhatIfIncidentId(null)} />}
    </div>
  );
}
