import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { refreshProducts } from "../src/lib/refresh-products";

async function main() {
  console.log("=========================================");
  console.log("STARTING AUTOMATIC SCHEDULED PRICE REFRESH");
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log("=========================================");

  try {
    const summary = await refreshProducts();

    console.log("\n=========================================");
    console.log("REFRESH COMPLETED SUCCESSFULLY");
    console.log("-----------------------------------------");
    console.log(`Total Products Tracked:  ${summary.totalProducts}`);
    console.log(`Successfully Updated:    ${summary.updatedCount}`);
    console.log(`Skipped / No Change:     ${summary.skippedCount}`);
    console.log(`Notifications Created:   ${summary.notificationCount}`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n=========================================");
    console.error("REFRESH PROCESS FAILED");
    console.error("-----------------------------------------");
    console.error(error instanceof Error ? error.message : error);
    console.error("=========================================\n");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
