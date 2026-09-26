"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-slate-700/50 bg-slate-800/40 flex items-center justify-center ${className}`}>
        <div className="w-4 h-4 rounded-full bg-slate-600 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle visual theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/60 dark:bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-all duration-200 shadow-sm backdrop-blur-sm ${className}`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
