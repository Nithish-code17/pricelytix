import { NextResponse } from "next/server";
import { refreshAllTrackedProducts } from "@/lib/refresh-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[CRON REFRESH] CRON_SECRET is not configured in the environment.");
      return NextResponse.json(
        { error: "CRON_SECRET environment variable is missing on the server." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[CRON REFRESH] Unauthorized cron refresh attempt.");
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid Bearer token." },
        { status: 401 }
      );
    }

    console.log("Cron refresh started:", new Date().toISOString());

    const result = await refreshAllTrackedProducts();

    console.log("Cron refresh completed:", {
      updated: result.updatedCount,
      skipped: result.skippedCount,
      failed: result.failedCount,
    });

    return NextResponse.json({
      message: "Cron refresh completed",
      ...result,
    });
  } catch (error) {
    console.error("CRON REFRESH ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to refresh all products via cron",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
