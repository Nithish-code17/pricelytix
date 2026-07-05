import { getSession } from "@/lib/auth";
import { refreshProducts } from "@/lib/refresh-products";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    // If unauthenticated, verify CRON_SECRET to permit global system-wide refresh
    if (!session) {
      const authHeader = request.headers.get("Authorization");
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized. Missing or invalid CRON_SECRET." },
          { status: 401 }
        );
      }
    }

    // If logged in from dashboard, refresh only the user's products
    // If authenticated via CRON_SECRET (system cron), refresh all products
    const summary = await refreshProducts({
      userId: session?.userId,
    });

    return NextResponse.json({
      message: "Price refresh completed successfully",
      ...summary,
    });
  } catch (error) {
    console.error("REFRESH ALL ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh product prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}