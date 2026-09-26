"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  UserCheck,
  Building2,
  KeyRound,
  Compass,
  Cpu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loginWithCredentials, verifyOtpCode, setAuthSession, getRoleDashboardPath } from "@/lib/auth";

type PortalRole = "CITIZEN" | "OFFICER" | "SUPER_ADMIN";

const TEST_ACCOUNTS = [
  {
    role: "CITIZEN" as const,
    label: "Citizen User",
    email: "citizen@civicshield.gov",
    badge: "Public Portal",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Submit hazards, verify KYC, track tickets",
  },
  {
    role: "OFFICER" as const,
    label: "Power & Electricity Lead",
    email: "officer.elec@civicshield.gov",
    badge: "Dept Locked: Power",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    desc: "Triage electrical grid hazards & dispatch crews",
  },
  {
    role: "OFFICER" as const,
    label: "Municipal Works Lead",
    email: "officer.works@civicshield.gov",
    badge: "Dept Locked: Works",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    desc: "Asphalt, drainage, and road obstruction queue",
  },
  {
    role: "OFFICER" as const,
    label: "Field Worker (Ali)",
    email: "worker.ali@civicshield.gov",
    badge: "Field PWA",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    desc: "Mobile dispatch, before/after evidence upload",
  },
  {
    role: "SUPER_ADMIN" as const,
    label: "Government Command",
    email: "superadmin@civicshield.gov",
    badge: "Full Command + Sim Suite",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    desc: "Autonomous multi-agent simulation & system oversight",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [activeTab, setActiveTab] = useState<PortalRole>("CITIZEN");
  const [email, setEmail] = useState("citizen@civicshield.gov");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 2FA OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("1234");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleRoleTabChange = (role: PortalRole) => {
    setActiveTab(role);
    setErrorMsg(null);
    if (role === "CITIZEN") {
      setEmail("citizen@civicshield.gov");
    } else if (role === "OFFICER") {
      setEmail("officer.elec@civicshield.gov");
    } else if (role === "SUPER_ADMIN") {
      setEmail("superadmin@civicshield.gov");
    }
  };

  const selectTestAccount = (accEmail: string, role: PortalRole) => {
    setEmail(accEmail);
    setPassword("password123");
    setActiveTab(role);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(email.trim(), password);
      setAuthSession(res.access_token, res.user, rememberMe);

      // If user is Officer or Super Admin, offer quick OTP confirmation for Viva demonstration
      if (res.user.role === "SUPER_ADMIN" || res.user.role === "OFFICER") {
        setPendingEmail(res.user.email);
        setShowOtpModal(true);
        setLoading(false);
        return;
      }

      const dest = callbackUrl || getRoleDashboardPath(res.user.role);
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid authentication credentials.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyOtpCode(pendingEmail, otpCode);
      setAuthSession(res.access_token, res.user, rememberMe);
      setShowOtpModal(false);
      const dest = callbackUrl || getRoleDashboardPath(res.user.role);
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Use default '1234'.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* ============================================================== */}
      {/* LEFT 50%: AMBIENT HIGH-TECH PREVIEW & DEVICE FRAME MOCKUP       */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-tr from-indigo-950/60 via-slate-900 to-slate-950 border-r border-slate-800/80 overflow-hidden">
        {/* Soft radial backdrop ambient glow */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CivicShield AI
              </span>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                Autonomous GovTech Grid
              </p>
            </div>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            City Agent Fabric Online
          </span>
        </div>

        {/* Center: iPhone 14 Pro / PWA Mobile Mockup with Live Scanner */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
          <div className="w-[300px] h-[520px] rounded-[44px] bg-slate-900 border-[7px] border-slate-800 shadow-2xl shadow-indigo-950/60 relative overflow-hidden flex flex-col">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Mobile Viewport Screen */}
            <div className="w-full h-full bg-slate-950 flex flex-col relative pt-10 px-3 pb-3 select-none">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full flex-1 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 overflow-hidden flex flex-col justify-between p-3">
                {/* HUD Header */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-cyan-400">
                    <Activity className="w-3 h-3 animate-spin" />
                    LIVE YOLOv8 FEED
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                    GPS LOCK
                  </span>
                </div>

                {/* Vertical Scanner Line Animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite]" />

                {/* Viewfinder Bounding Box on Simulated Pothole */}
                <div className="relative mx-auto my-auto w-44 h-28 border-2 border-dashed border-red-500/90 rounded-lg bg-red-500/10 flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-600 text-white shadow">
                      POTHOLE (94.2%)
                    </span>
                    <span className="text-[8px] font-mono text-red-300">CONF: 0.942</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-200 bg-slate-950/80 p-1 rounded border border-slate-800">
                    <div>SEV: <span className="text-red-400 font-bold">CRITICAL</span></div>
                    <div>AREA RATIO: 18.4%</div>
                  </div>
                </div>

                {/* Viewfinder Telemetry Footer */}
                <div className="space-y-1 bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>COORDS</span>
                    <span className="text-slate-200">33.6844° N, 73.0479° E</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ZONE</span>
                    <span className="text-indigo-300 font-semibold">Zone A Central Sector</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>MULTI-AGENT</span>
                    <span className="text-emerald-400">Fusion Check: Unique</span>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Quick Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="font-semibold text-slate-300">CivicShield Inspector</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[9px]">
                  v2.4 Production
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm font-semibold text-slate-200">
              Interactive Field Inspector Simulation
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              Live edge hazard classification with automated 50m spatial fusion and department routing.
            </p>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">15m Critical SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Multi-Agent Swarm</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Spatial Fusing</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT 50%: MINIMALIST ENTERPRISE AUTHENTICATION CARD            */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
        {/* Top bar with ThemeToggle and Back to Landing */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">CivicShield AI</span>
          </div>
          <div className="hidden lg:block text-xs font-medium text-slate-400">
            GovTech Emergency System • Official Access
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 bg-slate-800/40"
            >
              Public Portal
            </Link>
          </div>
        </div>

        {/* Center: Auth Box */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              System Authentication
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your authority tier to access the designated municipal operations portal.
            </p>
          </div>

          {/* Role Switching Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabChange("CITIZEN")}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "CITIZEN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Citizen
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("OFFICER")}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "OFFICER"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Officer
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("SUPER_ADMIN")}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "SUPER_ADMIN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Gov Command
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Identifier / Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicshield.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Security Passcode
                </label>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Evaluation Pin: password123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                Remember authentication on this device
              </label>
            </div>

            {/* Gradient CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {activeTab === "SUPER_ADMIN" ? "Government Command" : activeTab === "OFFICER" ? "Department Portal" : "Citizen Desk"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Evaluation / Viva Shortcuts */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Viva Defense 1-Click Credentials
              </span>
              <span className="text-[10px] text-slate-500">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {TEST_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectTestAccount(acc.email, acc.role)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${acc.badgeColor}`}>
                      {acc.badge}
                    </span>
                    <div>
                      <p className="font-medium text-slate-200 leading-tight">{acc.label}</p>
                      <p className="text-[10px] text-slate-400">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-mono">Use</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don&apos;t have an official citizen account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Register New Citizen
            </Link>
          </div>
        </div>

        {/* Bottom Security Disclaimer */}
        <div className="mt-8 text-center text-[11px] text-slate-500">
          Secured by SHA-256 JWT Encryption • Multi-Tenant Municipal Isolation
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2FA OTP MODAL DIALOG (DEFAULT CODE: 1234)                       */}
      {/* ============================================================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Government 2FA Gate</h3>
                <p className="text-xs text-slate-400">Restricted authority validation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              A 4-digit verification code has been dispatched to{" "}
              <span className="font-semibold text-indigo-300">{pendingEmail}</span>.
            </p>

            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
              <span>Demo Default Passcode:</span>
              <span className="font-mono font-bold text-sm bg-indigo-600/30 px-2 py-0.5 rounded text-white">1234</span>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="1234"
                  className="w-full text-center text-xl tracking-widest font-mono font-bold py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5"
                >
                  {otpLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
