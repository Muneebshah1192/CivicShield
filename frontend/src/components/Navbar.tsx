"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Activity,
  UserCheck,
  Building2,
  Lock,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStoredUser, clearAuthSession, getRoleDashboardPath, AuthUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push("/login");
  };

  const getRoleBadge = (role: string, deptName?: string | null) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return {
          label: "Government Command",
          classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        };
      case "OFFICER":
        return {
          label: deptName ? `Officer: ${deptName}` : "Department Officer",
          classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        };
      case "WORKER":
        return {
          label: "Field Worker",
          classes: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
        };
      default:
        return {
          label: "Verified Citizen",
          classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
    }
  };

  return (
    <header className="bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/95 backdrop-blur-md border-b border-slate-800/80 light:border-slate-200 sticky top-0 z-50 px-4 sm:px-8 py-3 text-slate-100 light:text-slate-900 flex items-center justify-between shadow-sm transition-colors duration-200">
      {/* Brand & System Status */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl text-white font-bold group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-100 light:text-slate-900">
                CivicShield AI
              </span>
              <span className="bg-emerald-500/15 text-emerald-400 light:text-emerald-700 light:bg-emerald-100 border border-emerald-500/30 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                SYSTEM LIVE
              </span>
            </div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 light:text-slate-500 font-semibold font-mono">
              Municipal Emergency Intelligence Grid
            </span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold tracking-wider">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/"
                ? "text-indigo-400 light:text-indigo-600 font-bold bg-indigo-500/10"
                : "text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900"
            }`}
          >
            Public Feed
          </Link>
          <a
            href="/#track-incident"
            className="px-3 py-1.5 rounded-lg text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Track Incident
          </a>
          <a
            href="/#system-health"
            className="px-3 py-1.5 rounded-lg text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            City Health SLA
          </a>
        </nav>
      </div>

      {/* Right Controls: ThemeToggle & Auth Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {mounted && user ? (
          /* Authenticated User Menu */
          <div className="flex items-center gap-2.5">
            <Link
              href={getRoleDashboardPath(user.role)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 hover:border-indigo-500 text-xs transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200 light:text-slate-800">
                {user.full_name}
              </span>
              {(() => {
                const badge = getRoleBadge(user.role, user.department_name);
                return (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.classes}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </Link>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 hover:border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Unauthenticated Guest Actions */
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black border border-slate-800 light:border-slate-300 hover:bg-slate-900 light:hover:bg-slate-100 transition-colors"
            >
              Register Citizen
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/25 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Official Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
