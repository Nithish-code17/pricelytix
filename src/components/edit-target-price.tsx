"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EditTargetPriceProps = {
  trackerId: string;
  currentTargetPrice: number;
};

export default function EditTargetPrice({
  trackerId,
  currentTargetPrice,
}: EditTargetPriceProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [targetPrice, setTargetPrice] = useState(String(currentTargetPrice));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to update target price");
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to update target price");
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="w-24 rounded-md border border-[#1f2937] bg-[#0b0f19] px-2.5 py-1 text-xs text-white outline-none focus:border-[#2563eb]"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-md bg-[#2563eb] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => {
            setEditing(false);
            setTargetPrice(String(currentTargetPrice));
          }}
          className="rounded-md bg-[#111827] px-2.5 py-1 text-xs font-medium text-[#9ca3af] hover:bg-[#1f2937] transition-colors cursor-pointer border border-[#1f2937]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors cursor-pointer"
    >
      <svg
        className="h-3.5 w-3.5 text-[#6b7280]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
      Edit Target
    </button>
  );
}