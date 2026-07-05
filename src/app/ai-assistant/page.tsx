"use client";

import SidebarNav from "@/components/sidebar-nav";
import { useState } from "react";

interface AIResult {
  intent: "TRACK_PRODUCT" | "PRICE_ADVICE" | "GENERAL_HELP";
  productUrl: string | null;
  targetPrice: number | null;
  summary: string;
  recommendation: string;
  nextAction: string;
}

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    {
      text: "Track this product if it drops below 55000: https://www.flipkart.com/example-product-url",
      label: "Track product URL with target",
    },
    {
      text: "Analyze my tracked products and tell me what is close to target.",
      label: "Portfolio purchase advice",
    },
    {
      text: "Should I buy my tracked items right now or wait for a price drop?",
      label: "General advice on buying",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to call AI assistant");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (text: string) => {
    setMessage(text);
  };

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case "TRACK_PRODUCT":
        return (
          <span className="rounded bg-[#2563eb]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2563eb] border border-[#2563eb]/20 uppercase">
            Track Product Intent
          </span>
        );
      case "PRICE_ADVICE":
        return (
          <span className="rounded bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-semibold text-[#10b981] border border-[#10b981]/20 uppercase">
            Price Advice Intent
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#6b7280]/10 px-2 py-0.5 text-[10px] font-semibold text-[#9ca3af] border border-[#1f2937] uppercase">
            General Help Intent
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1f2937] bg-[#0b0f19] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight">AI Shopping Assistant</h1>
            <span className="text-xs text-[#6b7280]">|</span>
            <span className="text-xs text-[#9ca3af]">Natural Language Tracking Agent</span>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Consult your AI Price Agent</h2>
              <p className="text-xs text-[#9ca3af] mt-1">
                Ask the agent to track a product URL, request buying advice based on your current trackers, or analyze target drops.
              </p>
            </div>

            {/* Prompt examples */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Quick Prompt Suggestions (Click to insert)
              </span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(ex.text)}
                    className="text-left text-xs bg-[#000000]/40 hover:bg-[#1f2937]/35 border border-[#1f2937] px-3 py-2 rounded-md text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#06b6d4] block text-[10px] mb-0.5 uppercase tracking-wider">
                      {ex.label}
                    </span>
                    <span className="line-clamp-1">{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Natural language query input */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Natural Language Command
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Track this product: https://www.amazon.in/dp/example-id if price goes below 4500"
                  className="w-full rounded-md border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2.5 text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#2563eb] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 text-xs text-[#ef4444]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#2563eb] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer border border-[#2563eb]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing Request...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Consult AI Assistant</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Result Card */}
          {result && (
            <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-6 space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Agent Analysis Output</h3>
                {getIntentBadge(result.intent)}
              </div>

              {/* Extraction Parameters */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block">
                    Detected URL
                  </span>
                  <span className="font-mono text-white break-all inline-block mt-1">
                    {result.productUrl ? (
                      <a
                        href={result.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#06b6d4] hover:underline"
                      >
                        {result.productUrl}
                      </a>
                    ) : (
                      "No URL parsed"
                    )}
                  </span>
                </div>

                <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] block">
                    Detected Target Price
                  </span>
                  <span className="text-base font-bold text-white block mt-1">
                    {result.targetPrice ? `₹${result.targetPrice.toLocaleString()}` : "No price parsed"}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Analysis Summary</span>
                  <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">{result.summary}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">AI Recommendation</span>
                  <p className="text-xs text-white mt-1 font-medium leading-relaxed">{result.recommendation}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Suggested Next Action</span>
                  <div className="mt-1.5 flex items-start gap-2 text-xs bg-[#2563eb]/10 border border-[#2563eb]/20 text-white rounded p-3">
                    <span className="font-semibold text-[#06b6d4] shrink-0">Action:</span>
                    <p className="leading-relaxed">{result.nextAction}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
