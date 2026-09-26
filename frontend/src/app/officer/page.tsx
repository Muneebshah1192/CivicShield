"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import AgentTraceModal from "@/components/AgentTraceModal";
import WhatIfModal from "@/components/WhatIfModal";
import { fetchIncidents, fetchDashboardAnalytics, assignWorker } from "@/lib/api";
import { getStoredUser, AuthUser } from "@/lib/auth";
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Zap,
  Filter,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Phone,
} from "lucide-react";

const ControlMap = dynamic(() => import("@/components/ControlMap"), { ssr: false });

export default function OfficerPortal() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [traceIncidentId, setTraceIncidentId] = useState<string | null>(null);
  const [whatIfIncidentId, setWhatIfIncidentId] = useState<string | null>(null);
  const [assigningWorker, setAssigningWorker] = useState(false);

  const loadData = () => {
    fetchIncidents()
      .then((data) => {
        setIncidents(data);
        if (data.length > 0 && !selectedIncident) {
          setSelectedIncident(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const curUser = getStoredUser();
    setUser(curUser);
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter incidents for this officer's department if assigned
  const departmentId = user?.department_id;
  const departmentName = user?.department_name || (departmentId === 1 ? "Electricity" : departmentId === 3 ? "Municipal Works" : "Department Triage");

  const deptIncidents = incidents.filter((inc) => {
    // If officer has a locked department, filter by department_id or category match
    if (departmentId) {
      if (inc.department_id && inc.department_id !== departmentId) return false;
      // Fallback: match by known department category if department_id not set on incident
      if (!inc.department_id) {
        if (departmentId === 1 && !["Fallen Pole", "Power Outage", "Transformer Fault"].includes(inc.category)) return false;
        if (departmentId === 3 && !["Pothole", "Road Damage", "Road Blockage", "Flooded Road"].includes(inc.category)) return false;
      }
    }
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
    return true;
  });

  const handleQuickAssign = async (incidentId: string, workerId: number) => {
    setAssigningWorker(true);
    try {
      await assignWorker(incidentId, workerId);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign field crew.");
    } finally {
      setAssigningWorker(false);
    }
  };

  // Severity color badge helper
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Officer Department Lock Banner */}
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-slate-900">
                  {departmentName} Operations Command
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {user?.department_id ? `DEPT-ID: #${user.department_id}` : "MULTI-DEPT"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SLA Active
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
                Authorized Officer: <span className="font-semibold text-slate-200 light:text-slate-800">{user?.full_name || "Department Officer"}</span> ({user?.email}) • Department-locked queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block uppercase font-mono">Department Queue</span>
              <span className="text-2xl font-extrabold text-indigo-400">{deptIncidents.length}</span>
              <span className="text-xs text-slate-400 ml-1">incidents</span>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center bg-slate-900 light:bg-slate-100 p-1 rounded-xl border border-slate-800 light:border-slate-300 text-xs font-semibold overflow-x-auto">
            <span className="text-slate-400 px-3 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "REPORTED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 light:hover:text-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {deptIncidents.length} filtered records
          </span>
        </div>

        {/* Main Grid: Triage Table & Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-3">
              <h2 className="font-bold text-sm text-slate-200 light:text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Department Incident Queue
              </h2>
              <span className="text-xs font-mono text-slate-400">YOLOv8 Threat Graded</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading department tickets...
              </div>
            ) : deptIncidents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No active incidents in this queue.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {deptIncidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/10 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30"
                          : "bg-slate-950/60 light:bg-slate-50 border-slate-800/80 light:border-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-400">
                              {inc.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(inc.severity_level)}`}>
                              {inc.severity_level}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700">
                              {inc.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Risk: {(inc.risk_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200 light:text-slate-800 line-clamp-1">
                            {inc.title || inc.description}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {inc.address || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                            inc.status === "RESOLVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : inc.status === "IN_PROGRESS"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector & Dispatch Drawer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedIncident ? (
              <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400">{selectedIncident.id}</span>
                    <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">{selectedIncident.title || selectedIncident.category}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getSeverityBadge(selectedIncident.severity_level)}`}>
                    {selectedIncident.severity_level}
                  </span>
                </div>

                {/* Evidence Image */}
                {selectedIncident.image_url && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-44 bg-black">
                    <img
                      src={selectedIncident.image_url}
                      alt="Hazard Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                      YOLOv8 Edge Scan • Detected
                    </div>
                  </div>
                )}

                {/* Description & Intelligence */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Citizen Description:</span>
                    <p className="text-slate-200 light:text-slate-800 bg-slate-950/50 light:bg-slate-100 p-2.5 rounded-xl border border-slate-800/80">
                      {selectedIncident.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-950/50 light:bg-slate-100 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">RISK SCORE</span>
                      <span className="font-bold text-indigo-400 text-sm">{(selectedIncident.risk_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/50 light:bg-slate-100 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">PRIORITY</span>
                      <span className="font-bold text-purple-400 text-sm">{(selectedIncident.priority_score * 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Agent Trace & What-If Simulation */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setTraceIncidentId(selectedIncident.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Agent Trace
                  </button>
                  <button
                    onClick={() => setWhatIfIncidentId(selectedIncident.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    What-If AI
                  </button>
                </div>

                {/* Dispatch Field Crew */}
                <div className="pt-3 border-t border-slate-800 light:border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Dispatch Department Field Worker
                  </span>

                  <div className="space-y-2">
                    <button
                      disabled={assigningWorker || selectedIncident.status === "RESOLVED"}
                      onClick={() => handleQuickAssign(selectedIncident.id, 1)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md flex items-center justify-between disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Dispatch Ali Khan (Power Lead)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={assigningWorker || selectedIncident.status === "RESOLVED"}
                      onClick={() => handleQuickAssign(selectedIncident.id, 2)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-between disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        <span>Dispatch Usman Malik (Road Crew)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">
                Select an incident from the queue to view telemetry and dispatch crews.
              </div>
            )}
          </div>
        </div>

        {/* Department Situation Map */}
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 light:text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              Department Spatial Situation Map
            </h3>
            <span className="text-xs font-mono text-slate-400">Zone-Partitioned Incident Clusters</span>
          </div>
          <div className="h-96 rounded-2xl overflow-hidden border border-slate-800">
            <ControlMap
              incidents={deptIncidents}
              hotspots={[]}
              onSelectIncident={(id: string) => {
                const found = deptIncidents.find((i) => i.id === id);
                if (found) setSelectedIncident(found);
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {traceIncidentId && (
        <AgentTraceModal
          incidentId={traceIncidentId}
          onClose={() => setTraceIncidentId(null)}
        />
      )}
      {whatIfIncidentId && (
        <WhatIfModal
          incidentId={whatIfIncidentId}
          onClose={() => setWhatIfIncidentId(null)}
        />
      )}
    </div>
  );
}
