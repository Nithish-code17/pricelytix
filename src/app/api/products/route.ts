import { getSession } from "@/lib/auth";
import { fetchProductPrice } from "@/lib/price-fetcher";
import { prisma } from "@/lib/prisma";
import { detectStore, generateTitleFromUrl } from "@/lib/product-utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to track products." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, targetPrice } = body;

    if (!url || !targetPrice) {
      return NextResponse.json(
        { error: "URL and target price are required" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(targetPrice);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Target price must be a valid number" },
        { status: 400 }
      );
    }

    const store = detectStore(url);
    const title = generateTitleFromUrl(url);
    const currentPrice = await fetchProductPrice(url, store);

    let product = await prisma.product.findUnique({
      where: { url },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          title,
          url,
          store,
          currentPrice,
          imageUrl: "",
        },
      });
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          title,
          store,
          ...(currentPrice !== null ? { currentPrice } : {}),
        },
      });
    }

    if (currentPrice !== null) {
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: currentPrice,
        },
      });
    }

    const tracker = await prisma.tracker.create({
      data: {
        userId: session.userId,
        productId: product.id,
        targetPrice: parsedPrice,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Product saved successfully",
      product,
      tracker,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to save product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}