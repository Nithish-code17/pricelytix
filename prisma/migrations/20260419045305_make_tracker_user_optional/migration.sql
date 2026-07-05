-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "targetPrice" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tracker_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tracker" ("createdAt", "id", "isActive", "productId", "targetPrice", "userId") SELECT "createdAt", "id", "isActive", "productId", "targetPrice", "userId" FROM "Tracker";
DROP TABLE "Tracker";
ALTER TABLE "new_Tracker" RENAME TO "Tracker";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
