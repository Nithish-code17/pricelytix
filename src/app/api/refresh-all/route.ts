import { NextResponse } from "next/server";
import { refreshAllTrackedProducts } from "@/lib/refresh-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    console.log("Manual refresh started:", new Date().toISOString());

    const result = await refreshAllTrackedProducts();

    console.log("Manual refresh completed:", {
      updated: result.updatedCount,
      skipped: result.skippedCount,
      failed: result.failedCount,
    });

    return NextResponse.json({
      message: "Manual refresh completed",
      ...result,
    });
  } catch (error) {
    console.error("MANUAL REFRESH ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to refresh all products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}