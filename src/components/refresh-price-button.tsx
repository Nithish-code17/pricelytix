"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RefreshPriceButtonProps = {
  productId: string;
};

export default function RefreshPriceButton({
  productId,
}: RefreshPriceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/products/${productId}/refresh`, {
        method: "PATCH",
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text.includes("<!DOCTYPE")
            ? "Refresh API route not found"
            : text
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.details || "Failed to refresh price"
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to refresh price"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
    >
      <svg
        className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#06b6d4]" : "text-[#6b7280]"}`}
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
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}