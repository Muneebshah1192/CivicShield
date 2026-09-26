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
  Bell,
  PhoneCall,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ============================================================== */}
      {/* LEFT 50%: AMBIENT HIGH-TECH PREVIEW WITH IPHONE MOCKUP          */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-tr from-purple-100/80 via-indigo-50/50 to-white dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800/80 overflow-hidden">
        {/* Soft radial backdrop ambient glow */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/15 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                CivicShield AI
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">
                Autonomous GovTech Grid
              </p>
            </div>
          </Link>

          {/* Figma Reference Header Elements: Bell, Call 24/7 Support, Avatar */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:border-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
              <span>Call 24/7 Support</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              CA
            </div>
          </div>
        </div>

        {/* Center: Elevated Glass White Card with Preview Canvas */}
        <div className="relative z-10 my-auto py-4">
          <div className="w-full max-w-lg mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col">
            {/* Card Sub-Header matching Figma reference */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Preview Post
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Iphone 14 pro pill dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Iphone 14 pro</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Mobile Viewport with Left/Right Carousel Nav Arrows */}
            <div className="relative flex items-center justify-center py-6">
              {/* Left Carousel Arrow */}
              <button
                type="button"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-50 transition-colors z-20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* iPhone 14 Pro Frame */}
              <div className="w-[280px] h-[480px] rounded-[42px] bg-slate-950 border-[6px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                {/* Mobile Viewport Content */}
                <div className="w-full h-full bg-slate-950 flex flex-col relative pt-9 px-2.5 pb-2.5 select-none">
                  {/* Camera Scanner Viewfinder */}
                  <div className="relative w-full flex-1 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between p-2.5">
                    {/* HUD Header */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Activity className="w-3 h-3 animate-spin" />
                        LIVE YOLOv8 FEED
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                        GPS LOCK
                      </span>
                    </div>

                    {/* Vertical Laser Pulse */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite]" />

                    {/* Detected Pothole Bounding Box */}
                    <div className="relative mx-auto my-auto w-40 h-24 border-2 border-dashed border-red-500/90 rounded-lg bg-red-500/10 flex flex-col justify-between p-2 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-600 text-white shadow">
                          POTHOLE (94.2%)
                        </span>
                        <span className="text-[8px] font-mono text-red-300">CONF: 0.94</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-200 bg-slate-950/80 p-1 rounded border border-slate-800">
                        <div>SEV: <span className="text-red-400 font-bold">CRITICAL</span></div>
                        <div>AREA: 18.4%</div>
                      </div>
                    </div>

                    {/* Viewfinder Telemetry */}
                    <div className="space-y-1 bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-[9px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>COORDS</span>
                        <span className="text-slate-200">33.6844° N, 73.0479° E</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>MULTI-AGENT</span>
                        <span className="text-emerald-400">Fusion: Unique</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Bottom Quick Bar */}
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">CivicShield Inspector</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[8px]">
                      v2.4
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Carousel Arrow */}
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-50 transition-colors z-20 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-slate-800/80 pt-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">15m Critical SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Multi-Agent Swarm</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Spatial Fusing</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT 50%: MINIMALIST AUTHENTICATION CARD                       */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white dark:bg-slate-950/80 backdrop-blur-md">
        {/* Top bar with ThemeToggle and Back to Landing */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">CivicShield AI</span>
          </Link>
          <div className="hidden lg:block text-xs font-medium text-slate-500 dark:text-slate-400">
            GovTech Emergency System • Official Access
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40"
            >
              Public Portal
            </Link>
          </div>
        </div>

        {/* Center: Auth Box matching Figma Reference */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sign in to continue
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your user name and password
            </p>
          </div>

          {/* Role Switching Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabChange("CITIZEN")}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "CITIZEN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Gov Command
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                User name or email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Type your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/70 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                />
                Remember me
              </label>
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Gradient Action Button matching reference */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Viva Defense Shortcuts */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                Viva Defense 1-Click Credentials
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {TEST_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectTestAccount(acc.email, acc.role)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition-colors text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${acc.badgeColor}`}>
                      {acc.badge}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">{acc.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">Use</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Get started
            </Link>
          </div>
        </div>

        {/* Bottom Security Disclaimer */}
        <div className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Secured by SHA-256 JWT Encryption • Multi-Tenant Municipal Isolation
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2FA OTP MODAL DIALOG (DEFAULT CODE: 1234)                       */}
      {/* ============================================================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Government 2FA Gate</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Restricted authority validation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              A 4-digit verification code has been dispatched to{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">{pendingEmail}</span>.
            </p>

            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span>Demo Default Passcode:</span>
              <span className="font-mono font-bold text-sm bg-indigo-600/20 px-2 py-0.5 rounded text-indigo-900 dark:text-white">1234</span>
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
                  className="w-full text-center text-xl tracking-widest font-mono font-bold py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5"
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
