"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col lg:flex-row">
      {/* Left Branding / Panel */}
      <div className="relative flex flex-col justify-between p-8 lg:p-12 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#1f2937] bg-[#0b0f19]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white mb-8">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2563eb]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>Pricelytix<span className="text-[#06b6d4]">.</span></span>
          </Link>
        </div>

        <div className="my-auto py-8 max-w-md">
          <div className="inline-flex items-center gap-2 rounded border border-[#1f2937] bg-[#000000] px-2.5 py-1 text-xs font-semibold text-[#06b6d4] mb-4">
            Price Intelligence Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            Enterprise Price Monitoring & Alert Infrastructure
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            Manage product inventory trackers, analyze price trend history, and receive automated target price notifications.
          </p>
        </div>

        <div className="text-xs text-[#6b7280]">
          © {new Date().getFullYear()} Pricelytix Inc. All rights reserved.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#000000]">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Account Sign In</h1>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 text-xs text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-md border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2.5 text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2.5 text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#2563eb] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer border border-[#2563eb]"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#9ca3af]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#2563eb] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
