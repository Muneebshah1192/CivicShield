"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { fetchWorkerJobs, resolveWorkerJob } from "@/lib/api";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { Activity, MapPin, CheckCircle2, Camera, Navigation, AlertTriangle, Upload, X } from "lucide-react";

export default function FieldWorkerPWA() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [afterUrl, setAfterUrl] = useState("https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const loadJobs = () => {
    fetchWorkerJobs(1).then((data) => {
      setJobs(data);
      if (data.length > 0 && !selectedJob) setSelectedJob(data[0]);
    }).catch(console.error);
  };

  useEffect(() => {
    setUser(getStoredUser());
    loadJobs();
  }, []);

  const handleResolveSubmit = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const res = await resolveWorkerJob(
        selectedJob.id,
        afterUrl,
        notes || "Repaired damaged infrastructure, compacted subbase, and cleared hazard area."
      );
      setVerificationResult(res.verification_output);
      loadJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to submit resolution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 my-4">
        {/* Worker Header Banner */}
        <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg font-mono">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : "FL"}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 light:text-slate-900">
                {user?.full_name || "Ali Khan (Municipal Lead)"}
              </h1>
              <p className="text-xs text-slate-400 light:text-slate-600 font-mono">
                {user?.department_name || "Electricity & Rapid Repair"} • Zone A Central Sector
              </p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 light:text-emerald-700 border border-emerald-500/30 font-bold text-xs px-3 py-1 rounded-full font-mono">
            ON DUTY
          </span>
        </div>

        {/* Assigned Dispatch Queue */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Assigned Field Tasks ({jobs.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Real-time Task Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-slate-900 light:bg-white border rounded-3xl p-5 space-y-3 cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/10 light:bg-blue-50"
                    : "border-slate-800 light:border-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 light:text-blue-600">{job.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.severity_level === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 light:text-red-700"
                        : "bg-amber-500/20 text-amber-400 light:text-amber-700"
                    }`}
                  >
                    {job.severity_level}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 light:text-slate-900 text-sm leading-snug">{job.title}</h3>
                <p className="text-slate-400 light:text-slate-600 text-xs line-clamp-2">{job.description}</p>

                <div className="pt-2 border-t border-slate-800 light:border-slate-200 flex items-center justify-between text-xs text-slate-400 light:text-slate-600 font-mono">
                  <span>Status: <strong className="text-emerald-400 light:text-emerald-600">{job.status}</strong></span>
                  <button className="text-blue-400 light:text-blue-600 hover:underline flex items-center gap-1 font-bold">
                    <Navigation className="w-3 h-3" />
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Job Resolution Evidence Submission */}
        {selectedJob && (
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs text-blue-400 light:text-blue-600 font-bold">{selectedJob.id}</span>
                <h3 className="font-bold text-slate-100 light:text-slate-900 text-base">{selectedJob.title}</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 light:text-emerald-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                {selectedJob.status}
              </span>
            </div>

            <div className="bg-slate-950 light:bg-slate-50 p-4 rounded-2xl border border-slate-800 light:border-slate-300 space-y-1 text-xs">
              <span className="text-slate-400 light:text-slate-500 font-semibold block">Incident Location & Context</span>
              <p className="text-slate-200 light:text-slate-800">{selectedJob.address || "Sector Ward, Zone A"}</p>
            </div>

            {/* Resolution Form */}
            <div className="bg-slate-950 light:bg-slate-50 p-5 rounded-2xl border border-slate-800 light:border-slate-300 space-y-4 text-xs">
              <h4 className="font-bold text-slate-100 light:text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-500" />
                Upload After-Repair Resolution Evidence
              </h4>

              <div className="space-y-1.5">
                <label className="text-slate-300 light:text-slate-700 font-semibold block">After Repair Photo URL</label>
                <input
                  type="url"
                  value={afterUrl}
                  onChange={(e) => setAfterUrl(e.target.value)}
                  className="w-full bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-xl p-2.5 text-slate-200 light:text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 light:text-slate-700 font-semibold block">Field Crew Technical Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on materials used, grid voltage restored, road asphalt smoothed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-xl p-2.5 text-slate-200 light:text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleResolveSubmit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running AI Resolution Match Verification...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Repair & Trigger AI Verification
                  </>
                )}
              </button>
            </div>

            {/* AI Verification Output */}
            {verificationResult && (
              <div className="bg-emerald-950/30 light:bg-emerald-50 border border-emerald-500/40 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-emerald-400 light:text-emerald-700">
                  <span>AI Resolution Verification Match: {verificationResult.ai_verification_score_percent}%</span>
                  <span className="uppercase">{verificationResult.verification_status}</span>
                </div>
                <p className="text-slate-300 light:text-slate-700">{verificationResult.audit_summary}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
