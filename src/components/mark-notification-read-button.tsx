"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MarkNotificationReadButtonProps = {
  notificationId: string;
};

export default function MarkNotificationReadButton({
  notificationId,
}: MarkNotificationReadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDismiss = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to mark notification as read");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to dismiss notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDismiss}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md bg-[#f59e0b]/15 px-2.5 py-1 text-xs font-semibold text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
    >
      <svg
        className={`h-3 w-3 ${loading ? "animate-spin text-[#f59e0b]" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {loading ? "Dismissing..." : "Dismiss Alert"}
    </button>
  );
}
