import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { targetPrice } = body;

    const parsedPrice = Number(targetPrice);

    if (!id) {
      return NextResponse.json(
        { error: "Tracker id is required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Target price must be a valid number" },
        { status: 400 }
      );
    }

    const existingTracker = await prisma.tracker.findUnique({
      where: { id },
    });

    if (!existingTracker) {
      return NextResponse.json(
        { error: "Tracker not found" },
        { status: 404 }
      );
    }

    if (existingTracker.userId && existingTracker.userId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden. You do not own this tracker." },
        { status: 403 }
      );
    }

    const updatedTracker = await prisma.tracker.update({
      where: { id },
      data: {
        targetPrice: parsedPrice,
      },
    });

    return NextResponse.json({
      message: "Target price updated successfully",
      tracker: updatedTracker,
    });
  } catch (error) {
    console.error("UPDATE TRACKER ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update target price",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}