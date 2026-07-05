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

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        tracker: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.tracker.userId && notification.tracker.userId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden. You do not own this notification." },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
