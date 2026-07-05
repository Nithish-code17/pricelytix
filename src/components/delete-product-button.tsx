"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteProductButtonProps = {
  productId: string;
};

export default function DeleteProductButton({
  productId,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md bg-[#ef4444]/10 px-3 py-1.5 text-xs font-medium text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/20 disabled:opacity-50 transition-colors cursor-pointer"
    >
      <svg
        className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#ef4444]" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}