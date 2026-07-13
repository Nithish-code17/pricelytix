import { prisma } from "@/lib/prisma";
import { fetchProductPrice } from "@/lib/price-fetcher";

export type RefreshProductResult = {
  productId: string;
  title: string;
  status: "updated" | "skipped" | "failed";
  currentPrice?: number;
  error?: string;
};

export type RefreshSummary = {
  totalProducts: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  startedAt: string;
  completedAt: string;
  results: RefreshProductResult[];
};

export async function refreshAllTrackedProducts(): Promise<RefreshSummary> {
  const startedAt = new Date().toISOString();

  const products = await prisma.product.findMany({
    where: {
      trackers: {
        some: {
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      title: true,
      url: true,
      store: true,
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  const results: RefreshProductResult[] = [];

  // Process sequentially to avoid opening many scrapers at the same time.
  for (const product of products) {
    try {
      console.log(`Refreshing product: ${product.title}`);

      const currentPrice = await fetchProductPrice(
        product.url,
        product.store ?? "Unknown"
      );

      if (currentPrice === null) {
        skippedCount++;

        results.push({
          productId: product.id,
          title: product.title,
          status: "skipped",
          error: "Price not found or site blocked",
        });

        continue;
      }

      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          currentPrice,
        },
      });

      /*
       * Protect against duplicate cron calls creating multiple history
       * records within a very short period.
       */
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const recentHistory = await prisma.priceHistory.findFirst({
        where: {
          productId: product.id,
          createdAt: {
            gte: tenMinutesAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!recentHistory) {
        await prisma.priceHistory.create({
          data: {
            productId: product.id,
            price: currentPrice,
          },
        });
      }

      updatedCount++;

      results.push({
        productId: product.id,
        title: product.title,
        status: "updated",
        currentPrice,
      });

      console.log(
        `Successfully refreshed ${product.title}: ₹${currentPrice}`
      );
    } catch (error) {
      failedCount++;

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error(
        `Failed to refresh product ${product.id}:`,
        errorMessage
      );

      results.push({
        productId: product.id,
        title: product.title,
        status: "failed",
        error: errorMessage,
      });
    }
  }

  return {
    totalProducts: products.length,
    updatedCount,
    skippedCount,
    failedCount,
    startedAt,
    completedAt: new Date().toISOString(),
    results,
  };
}