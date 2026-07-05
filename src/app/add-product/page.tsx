"use client";

import SidebarNav from "@/components/sidebar-nav";
import Link from "next/link";
import { useState } from "react";

export default function AddProductPage() {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          targetPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "Product saved & price tracking initialized successfully!",
          isError: false,
        });
        setUrl("");
        setTargetPrice("");
      } else {
        setMessage({
          text: data.error || data.details || "Failed to save product",
          isError: true,
        });
      }
    } catch (error) {
      setMessage({
        text: "Something went wrong while saving the product",
        isError: true,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1f2937] bg-[#0b0f19] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight">Add Product Tracker</h1>
            <span className="text-xs text-[#6b7280]">|</span>
            <span className="text-xs text-[#9ca3af]">New Inventory Item</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-2xl w-full mx-auto">
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Configure Product Tracker</h2>
              <p className="text-xs text-[#9ca3af] mt-1">
                Enter an Amazon or Flipkart product URL to initialize automated price scraping and target alerts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Product URL <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/example or https://www.flipkart.com/..."
                  className="w-full rounded-md border border-[#1f2937] bg-[#0b0f19] px-3.5 py-2.5 text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#2563eb] transition-colors"
                />
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  Supported platforms: Amazon India & Flipkart. Store type is auto-detected.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Target Price (₹) <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b7280]">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="2499"
                    className="w-full rounded-md border border-[#1f2937] bg-[#0b0f19] pl-7 pr-3.5 py-2.5 text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#2563eb] transition-colors"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  Alert notifications & emails trigger when the current price drops to or below this threshold.
                </p>
              </div>

              {message && (
                <div
                  className={`rounded-md p-3 text-xs font-medium border flex items-center gap-2 ${
                    message.isError
                      ? "bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]"
                      : "bg-[#059669]/10 border-[#059669]/20 text-[#10b981]"
                  }`}
                >
                  <span>{message.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#2563eb] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer border border-[#2563eb]"
                >
                  {loading ? "Fetching Initial Price..." : "Save & Initialize Tracker"}
                </button>

                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#111827] px-4 py-2.5 text-xs font-medium text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}