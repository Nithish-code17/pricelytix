"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefreshAll = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/refresh-all", {
        method: "POST",
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text.includes("<!DOCTYPE")
            ? "Refresh All API route not found"
            : text
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.details || "Failed to refresh all prices");
      }

      alert(`Prices refreshed successfully!\nTotal: ${data.totalProducts}, Updated: ${data.updatedCount}, Skipped: ${data.skippedCount}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to refresh all prices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefreshAll}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer border border-[#2563eb]"
    >
      <svg
        className={`h-3.5 w-3.5 ${loading ? "animate-spin text-white" : "text-white"}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {loading ? "Refreshing All..." : "Refresh All Prices"}
    </button>
  );
}