"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CitizenChatbot from "@/components/CitizenChatbot";
import OnboardingGuide from "@/components/OnboardingGuide";
import { createIncident, fetchIncidents, submitCitizenFeedback } from "@/lib/api";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { Camera, MapPin, Send, CheckCircle2, AlertCircle, RotateCcw, Clock, ShieldAlert, Sparkles, Cpu, Layers, UserCheck } from "lucide-react";

export default function CitizenPortal() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState(33.6844);
  const [longitude, setLongitude] = useState(73.0479);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop");
  const [loading, setLoading] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<any>(null);
  const [myIncidents, setMyIncidents] = useState<any[]>([]);

  // Reopen feedback state
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState("");

  const samplePhotos = [
    { label: "Pothole", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop", cat: "Pothole" },
    { label: "Flooded Road", url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop", cat: "Flooded Road" },
    { label: "Fallen Pole", url: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop", cat: "Fallen Pole" },
    { label: "Water Leak", url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop", cat: "Water Leak" },
    { label: "Garbage Pile", url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop", cat: "Garbage Accumulation" },
  ];

  const loadMyComplaints = () => {
    fetchIncidents().then(setMyIncidents).catch(console.error);
  };

  useEffect(() => {
    setUser(getStoredUser());
    loadMyComplaints();
  }, []);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        },
        () => alert("Using default municipal coordinates (33.6844, 73.0479).")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return alert("Please describe the infrastructure problem.");

    setLoading(true);
    try {
      const res = await createIncident({
        description,
        latitude,
        longitude,
        category,
        image_url: imageUrl,
      });
      setSubmittedIncident(res);
      setDescription("");
      loadMyComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to create report.");
    } finally {
      setLoading(false);
    }
  };

  const handleReopenSubmit = async (incidentId: string) => {
    if (!reopenReason.trim()) return alert("Please specify why the issue remains unresolved.");
    try {
      await submitCitizenFeedback(incidentId, false, reopenReason);
      setReopenId(null);
      setReopenReason("");
      loadMyComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to submit reopen request.");
    }
  };

  const handleConfirmResolved = async (incidentId: string) => {
    try {
      await submitCitizenFeedback(incidentId, true);
      loadMyComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to confirm resolution.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col transition-colors">
      <Navbar />
      <OnboardingGuide />
      <CitizenChatbot />

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 my-4">
        {/* Verified Citizen Header */}
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 light:text-slate-900">
                  {user?.full_name || "Verified Citizen Desk"}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600 font-mono">
                {user?.email || "citizen@civicshield.gov"} • Direct Multi-Agent Priority Dispatch
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Active Tickets</span>
            <span className="text-lg font-bold text-emerald-400">{myIncidents.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Report Wizard */}
          <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-slate-800 light:border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Report Infrastructure Issue
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-xs mt-1">
                Upload image & GPS location. AI inspects depth, verifies authenticity, and dispatches the nearest crew.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Presets & Image URL */}
              <div className="space-y-2">
                <label className="text-slate-300 light:text-slate-700 font-semibold block">
                  Select Preset Hazard Photo or Enter URL
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {samplePhotos.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setCategory(p.cat);
                      }}
                      className={`relative h-14 rounded-lg overflow-hidden border transition-all ${
                        imageUrl === p.url
                          ? "border-blue-500 ring-2 ring-blue-500/50"
                          : "border-slate-800 light:border-slate-300 hover:opacity-80"
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5 truncate">
                        {p.label}
                      </div>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Custom image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl p-2.5 text-slate-200 light:text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-slate-300 light:text-slate-700 font-semibold block">Incident Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Deep pothole near main avenue causing cars to swerve and damaging vehicle tires..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl p-3 text-slate-200 light:text-slate-800 text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-300 light:text-slate-700 font-semibold block">Category (AI can auto-correct)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl p-2.5 text-slate-200 light:text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Flooded Road">Flooded Road</option>
                  <option value="Fallen Pole">Fallen Electricity Pole</option>
                  <option value="Transformer Damage">Transformer Damage</option>
                  <option value="Water Leak">Water Leakage</option>
                  <option value="Garbage Accumulation">Garbage Accumulation</option>
                  <option value="Road Obstruction">Road Obstruction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* GPS Coordinates */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 light:text-slate-700 font-semibold">Incident Coordinates</label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="text-blue-400 light:text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Detect Current GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl p-2 text-slate-200 light:text-slate-800 text-xs"
                  />
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl p-2 text-slate-200 light:text-slate-800 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running YOLO & Multi-Agent Investigation...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submission Live Result & Tracked Complaints */}
        <div className="lg:col-span-7 space-y-6">
          {/* Submission Result Card with YOLO Damage Depth */}
          {submittedIncident && (
            <div className="bg-slate-900 light:bg-white border border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 light:text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Complaint {submittedIncident.id} Analyzed & Registered</span>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 light:text-emerald-700 px-2 py-0.5 rounded">
                  Status: {submittedIncident.status}
                </span>
              </div>

              {/* YOLO Damage & Depth Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950 light:bg-slate-100 p-3 rounded-2xl border border-slate-800 light:border-slate-300 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 light:text-slate-500 block">Class</span>
                  <strong className="text-slate-100 light:text-slate-900">{submittedIncident.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 light:text-slate-500 block">Severity</span>
                  <strong className="text-amber-400 light:text-amber-600">{submittedIncident.severity_level}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 light:text-slate-500 block">Risk Score</span>
                  <strong className="text-red-400 light:text-red-600">{submittedIncident.risk_score}/100</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 light:text-slate-500 block">Department</span>
                  <strong className="text-blue-400 light:text-blue-600">{submittedIncident.department?.name || "Municipal Works"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tracked Complaints Feed */}
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 light:border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-100 light:text-slate-900">Tracked Public Complaints</h2>
              <span className="text-xs font-mono text-slate-400 light:text-slate-500">Live Municipal Dispatch Feed</span>
            </div>

            <div className="space-y-4">
              {myIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400 light:text-blue-600">{inc.id}</span>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        inc.status === "RESOLVED" || inc.status === "AI_VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-400 light:text-emerald-700"
                          : inc.status === "REJECTED"
                          ? "bg-red-500/20 text-red-400 light:text-red-700"
                          : "bg-blue-500/20 text-blue-400 light:text-blue-700"
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 light:text-slate-900 text-sm leading-snug">{inc.title}</h4>
                  <p className="text-slate-400 light:text-slate-600 text-xs line-clamp-2">{inc.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 light:border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-400 light:text-slate-600 font-mono gap-2">
                    <span>Dept: <strong className="text-slate-200 light:text-slate-800">{inc.department?.name || "Municipal Works"}</strong></span>
                    <span>Lead: <strong className="text-blue-400 light:text-blue-600">{inc.assigned_worker?.user?.full_name || "Queued in Triage"}</strong></span>
                  </div>

                  {/* Citizen Reopen & Confirmation Loop */}
                  {(inc.status === "AI_VERIFIED" || inc.status === "RESOLVED") && (
                    <div className="pt-3 border-t border-slate-800 light:border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-300 light:text-slate-700 font-semibold">Confirm Repair Quality:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmResolved(inc.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors shadow"
                        >
                          👍 Satisfied
                        </button>
                        <button
                          onClick={() => setReopenId(inc.id)}
                          className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors shadow flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          👎 Reopen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reopen Input Form */}
                  {reopenId === inc.id && (
                    <div className="bg-red-950/20 light:bg-red-50 border border-red-500/30 p-3 rounded-xl space-y-2 mt-2">
                      <span className="text-xs text-red-300 light:text-red-700 font-semibold block">Explain reason for reopening:</span>
                      <input
                        type="text"
                        placeholder="e.g. Surface patch is uneven and still poses hazard..."
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        className="w-full bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 rounded-lg p-2 text-xs text-slate-200 light:text-slate-800"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReopenSubmit(inc.id)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg text-xs"
                        >
                          Submit Reopen Request
                        </button>
                        <button
                          onClick={() => setReopenId(null)}
                          className="bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-700 px-3 py-1 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
