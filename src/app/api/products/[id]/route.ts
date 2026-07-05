import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const userTracker = await prisma.tracker.findFirst({
      where: {
        productId: id,
        userId: session.userId,
      },
    });

    if (!userTracker) {
      return NextResponse.json(
        { error: "Tracker not found or forbidden" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated Notification records for this tracker
      await tx.notification.deleteMany({
        where: { trackerId: userTracker.id },
      });

      // 2. Delete the user's tracker
      await tx.tracker.delete({
        where: { id: userTracker.id },
      });

      // 3. If no remaining trackers exist for this product, delete history and product
      const remainingTrackers = await tx.tracker.count({
        where: { productId: id },
      });

      if (remainingTrackers === 0) {
        await tx.notification.deleteMany({
          where: { productId: id },
        });
        await tx.priceHistory.deleteMany({
          where: { productId: id },
        });
        await tx.product.delete({
          where: { id },
        });
      }
    });

    return NextResponse.json({
      message: "Tracker deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete product tracker",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}