"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CitizenChatbot from "@/components/CitizenChatbot";
import { fetchIncidents, fetchDashboardAnalytics, fetchIncidentDetails } from "@/lib/api";
import {
  Shield,
  ArrowRight,
  Activity,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Sparkles,
  Layers,
  Lock,
  Search,
  Radio,
  Zap,
  Clock,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  
  // Public Incident Tracker State
  const [searchId, setSearchId] = useState("");
  const [trackedIncident, setTrackedIncident] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardAnalytics().then(setAnalytics).catch(console.error);
    fetchIncidents().then((data) => setIncidents(data.slice(0, 6))).catch(console.error);
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setTrackLoading(true);
    setTrackError(null);
    setTrackedIncident(null);

    try {
      const data = await fetchIncidentDetails(searchId.trim());
      setTrackedIncident(data);
    } catch (err: any) {
      setTrackError("Incident ticket not found. Please verify the identifier (e.g. INC-1042).");
    } finally {
      setTrackLoading(false);
    }
  };

  const stats = analytics?.stats || {
    total_active: 128,
    critical: 23,
    high: 41,
    resolved_today: 67,
    duplicate_fused_count: 14,
    avg_response_time_minutes: 12.4,
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Floating Citizen AI Assistant */}
      <CitizenChatbot />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center space-y-8">
        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs font-mono font-bold tracking-wider uppercase text-slate-400 light:text-slate-600">
          <span className="text-indigo-400 light:text-indigo-600 border-b-2 border-indigo-500 pb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            Autonomous Municipal Response
          </span>
          <span className="pb-1 text-slate-400 hover:text-slate-200">YOLOv8 Hazard Detection</span>
          <span className="pb-1 text-slate-400 hover:text-slate-200">50m Spatial Fusion</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-100 light:text-slate-900">
            See the Problem. Understand the Risk.{" "}
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent font-black">
              Coordinate the Response.
            </span>
          </h1>
          <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            CivicShield AI replaces manual municipal dispatch with an autonomous multi-agent swarm:
            detecting damage severity, fusing duplicate citizen reports, and enforcing strict 15-minute response SLAs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm hover:scale-105 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Official Portal Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 hover:border-slate-700 text-slate-200 light:text-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md"
          >
            <span>Register Verified Citizen</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-5xl mx-auto text-left" id="system-health">
          <div className="bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 p-4 rounded-2xl shadow-sm">
            <span className="text-slate-400 light:text-slate-500 text-xs font-medium uppercase font-mono">Active Incidents</span>
            <div className="text-2xl font-extrabold text-slate-100 light:text-slate-900 mt-1">{stats.total_active}</div>
            <span className="text-[10px] text-indigo-400 font-mono mt-1 block">Live Monitored</span>
          </div>
          <div className="bg-slate-900/80 light:bg-white border border-red-500/30 p-4 rounded-2xl shadow-sm">
            <span className="text-red-400 light:text-red-600 text-xs font-medium uppercase font-mono">Critical Priority</span>
            <div className="text-2xl font-extrabold text-red-400 light:text-red-600 mt-1">{stats.critical}</div>
            <span className="text-[10px] text-red-400 font-mono mt-1 block">&lt; 15m Response Target</span>
          </div>
          <div className="bg-slate-900/80 light:bg-white border border-emerald-500/30 p-4 rounded-2xl shadow-sm">
            <span className="text-emerald-400 light:text-emerald-600 text-xs font-medium uppercase font-mono">Resolved Today</span>
            <div className="text-2xl font-extrabold text-emerald-400 light:text-emerald-600 mt-1">{stats.resolved_today}</div>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">AI Verified SSIM</span>
          </div>
          <div className="bg-slate-900/80 light:bg-white border border-purple-500/30 p-4 rounded-2xl shadow-sm">
            <span className="text-purple-400 light:text-purple-600 text-xs font-medium uppercase font-mono">Fused Clusters</span>
            <div className="text-2xl font-extrabold text-purple-400 light:text-purple-600 mt-1">{stats.duplicate_fused_count}</div>
            <span className="text-[10px] text-purple-400 font-mono mt-1 block">50m Spatial Agent</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PUBLIC INCIDENT TRACKER SECTION                                */}
      {/* ============================================================== */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-4" id="track-incident">
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-900">
                Public Incident Status Tracking
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Enter any municipal incident tracking ID to inspect live dispatch progress without signing in.
              </p>
            </div>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex gap-2">
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. INC-1042 or INC-1041"
              className="flex-1 px-4 py-2.5 bg-slate-950 light:bg-slate-100 border border-slate-700 light:border-slate-300 rounded-xl text-sm text-slate-100 light:text-slate-900 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={trackLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {trackLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Track Status</span>
                  <Search className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {trackError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {trackError}
            </div>
          )}

          {trackedIncident && (
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 space-y-3 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-400">{trackedIncident.id}</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  trackedIncident.status === "RESOLVED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {trackedIncident.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">CATEGORY</span>
                  <span className="font-bold text-slate-200 light:text-slate-800">{trackedIncident.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                  <span className="font-bold text-red-400">{trackedIncident.severity_level}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DEPARTMENT</span>
                  <span className="font-bold text-indigo-300">
                    {trackedIncident.department ? trackedIncident.department.name : "Municipal Response"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">RISK SCORE</span>
                  <span className="font-bold text-cyan-400">{(trackedIncident.risk_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <p className="font-sans text-xs text-slate-300 light:text-slate-700 pt-1 border-t border-slate-800">
                {trackedIncident.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Multi-Agent Architecture Showcase */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            Autonomous Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 light:text-slate-900">
            How CivicShield AI Operates Behind the Scenes
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600">
            Every incoming hazard triggers an autonomous multi-agent pipeline from real-time computer vision to dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">YOLOv8 Threat Quantifier</h3>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
              Detects hazard bounding boxes and computes area ratio to determine immediate structural severity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">50m Spatial Fusion Agent</h3>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
              Clusters duplicate reports from nearby citizens into a single master ticket, preventing municipal flood.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">15m Critical SLA Dispatch</h3>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
              Routes tickets to locked department queues and field crews with active countdown timers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-100 light:text-slate-900">SSIM AI Verification</h3>
            <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
              Field repair photos are verified against the original hazard using structural similarity before closure.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900/60 light:bg-white border-t border-slate-800 light:border-slate-200 py-6 px-6 text-center text-xs text-slate-500 light:text-slate-600">
        CivicShield AI — Multi-Agent Urban Emergency Intelligence & Response Platform &copy; 2026.
      </footer>
    </div>
  );
}
