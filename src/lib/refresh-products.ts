import { sendPriceAlertEmail } from "./email";
import { fetchProductPrice } from "./price-fetcher";
import { prisma } from "./prisma";

export interface RefreshSummary {
  totalProducts: number;
  updatedCount: number;
  skippedCount: number;
  notificationCount: number;
}

export interface RefreshProductsOptions {
  userId?: string;
}

export async function refreshProducts(
  options: RefreshProductsOptions = {}
): Promise<RefreshSummary> {
  const { userId } = options;

  const products = await prisma.product.findMany({
    where: userId
      ? {
          trackers: {
            some: {
              userId,
            },
          },
        }
      : undefined,
  });

  let updatedCount = 0;
  let skippedCount = 0;
  let notificationCount = 0;

  for (const product of products) {
    try {
      const currentPrice = await fetchProductPrice(
        product.url,
        product.store || "Unknown"
      );

      if (currentPrice === null) {
        skippedCount++;
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
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

      // Check active trackers and create notifications
      const trackers = await prisma.tracker.findMany({
        where: {
          productId: product.id,
          isActive: true,
          ...(userId ? { userId } : {}),
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
            notificationCount++;

            // Trigger email alert asynchronously
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

      updatedCount++;
    } catch (error) {
      console.error(`FAILED TO REFRESH PRODUCT: ${product.id}`, error);
      skippedCount++;
    }
  }

  return {
    totalProducts: products.length,
    updatedCount,
    skippedCount,
    notificationCount,
  };
}
