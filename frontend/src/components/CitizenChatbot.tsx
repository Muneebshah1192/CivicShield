"use client";

import { useState } from "react";
import { useCivicShieldStore } from "@/lib/store";
import { MessageSquare, Send, X, Bot, User, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

export default function CitizenChatbot() {
  const { chatbotOpen, setChatbotOpen } = useCivicShieldStore();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; card?: any }>>([
    {
      sender: "bot",
      text: "👋 Hi! I am **CivicShield Assistant**. Ask me anything, or type your complaint ID (e.g. *INC-1043*) to track live progress!",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/incidents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.response || "I've checked the municipal records for your query.",
          card: data.incident_card,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am having temporary trouble reaching the tracking service. Please try again in a few seconds.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!chatbotOpen && (
        <button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-2 text-xs font-bold"
          title="Open AI Assistant & Complaint Tracker"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="hidden sm:inline">Track Complaint / AI Help</span>
        </button>
      )}

      {/* Chatbot Window */}
      {chatbotOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  CivicShield AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-slate-400">Live Complaint Tracking & Municipal Guidance</p>
              </div>
            </div>
            <button
              onClick={() => setChatbotOpen(false)}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 text-xs bg-slate-900/90">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-slate-800/80 border border-slate-700 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Render Embedded Incident Card */}
                  {m.card && (
                    <div className="mt-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between text-blue-400 font-bold">
                        <span>{m.card.id}</span>
                        <span>{m.card.status}</span>
                      </div>
                      <div className="text-slate-300 font-sans font-semibold">{m.card.title}</div>
                      <div className="text-slate-400">Dept: {m.card.department} | Lead: {m.card.worker}</div>
                      <div className="text-amber-400 font-bold">Severity: {m.card.severity} (Risk: {m.card.risk_score})</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs font-mono">
                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Querying municipal multi-agent state...
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {["Where is INC-1043?", "How to report issue?", "Check active response time"].map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputQuery(prompt);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md shrink-0 border border-slate-700/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question or enter ticket ID (e.g. INC-1044)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
