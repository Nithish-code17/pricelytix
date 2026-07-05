"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Failed to sign out");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-md bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] border border-[#1f2937] hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30 disabled:opacity-50 transition-colors cursor-pointer"
    >
      <svg
        className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#ef4444]" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
