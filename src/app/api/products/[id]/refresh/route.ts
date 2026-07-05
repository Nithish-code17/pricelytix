import { getSession } from "@/lib/auth";
import { sendPriceAlertEmail } from "@/lib/email";
import { fetchProductPrice } from "@/lib/price-fetcher";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  _: Request,
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

    const userTracker = await prisma.tracker.findFirst({
      where: {
        productId: id,
        userId: session.userId,
      },
    });

    if (!userTracker) {
      return NextResponse.json(
        { error: "Product tracker not found or forbidden" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const currentPrice = await fetchProductPrice(
      product.url,
      product.store || "Unknown"
    );

    if (currentPrice === null) {
      return NextResponse.json({
        message: "Price refresh skipped: no reliable price found",
        product,
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        currentPrice,
      },
    });

    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: currentPrice,
      },
    });

    // Check all active trackers for this product and create notifications
    const trackers = await prisma.tracker.findMany({
      where: {
        productId: product.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    for (const tracker of trackers) {
      if (currentPrice <= tracker.targetPrice) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            trackerId: tracker.id,
            productId: product.id,
            isRead: false,
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              trackerId: tracker.id,
              productId: product.id,
              message: `Target reached! Current price is ₹${currentPrice}, which is below your target of ₹${tracker.targetPrice}.`,
              type: "TARGET_REACHED",
              isRead: false,
            },
          });

          // Send email alert to tracker owner's email (with ALERT_EMAIL as fallback)
          await sendPriceAlertEmail({
            title: product.title,
            url: product.url,
            currentPrice,
            targetPrice: tracker.targetPrice,
            store: product.store || "Unknown",
            userEmail: tracker.user?.email,
          });
        }
      }
    }

    return NextResponse.json({
      message: "Price refreshed successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("REFRESH PRICE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to refresh price",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}