"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertTriangle,
  Zap,
  Activity,
  Cpu,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { registerWithCredentials, setAuthSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerWithCredentials({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password,
        role: "CITIZEN",
      });

      setAuthSession(res.access_token, res.user, true);
      router.push("/citizen");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* LEFT 50%: AMBIENT INTEL VIEW */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-tr from-indigo-950/60 via-slate-900 to-slate-950 border-r border-slate-800/80 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                CivicShield AI
              </span>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                Citizen Civic Registry
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-md mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Citizen Access
            </span>
            <h2 className="text-xl font-bold text-white">
              Empower your community with autonomous municipal response.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you register as a verified citizen, your incident reports trigger instant multi-agent triage:
              fraud detection, computer-vision threat quantification, 50m spatial fusion, and automated SLA dispatch.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Live tracking on GPS response tickets</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Transparent AI evidence before & after resolution</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Zero duplicate spam via intelligent geo-clustering</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-800/80 pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Municipal Ordinance Compliant</span>
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* RIGHT 50%: REGISTRATION FORM */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">CivicShield AI</span>
          </Link>
          <div className="hidden lg:block text-xs font-medium text-slate-400">
            Citizen Onboarding Portal
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Citizen Account
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Join the smart municipal grid to report and monitor hazards in your sector.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Fatima Zahra"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
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
                  placeholder="citizen@domain.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92-300-1234567"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already registered?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Sign In to Existing Account
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-[11px] text-slate-500">
          CivicShield Urban Emergency Intelligence Platform
        </div>
      </div>
    </div>
  );
}
