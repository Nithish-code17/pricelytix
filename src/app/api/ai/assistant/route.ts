import { getSession } from "@/lib/auth";
import { analyzeShoppingRequest } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to consult the AI assistant." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Fetch user trackers for context
    const trackers = await prisma.tracker.findMany({
      where: {
        userId: session.userId,
        isActive: true,
      },
      include: {
        product: {
          select: {
            title: true,
            currentPrice: true,
            store: true,
            url: true,
          },
        },
      },
    });

    const context = {
      trackers: trackers.map((t) => ({
        product: t.product,
        targetPrice: t.targetPrice,
      })),
    };

    const result = await analyzeShoppingRequest(message, context);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI ASSISTANT API ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to query AI assistant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
