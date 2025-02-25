-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coaster" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ridden" BOOLEAN NOT NULL,
    "riddenDate" TEXT,
    "opened" TEXT NOT NULL,
    "closed" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "rcdb" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    CONSTRAINT "Coaster_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "Park" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Coaster" ("closed", "id", "latitude", "longitude", "name", "opened", "parkId", "ridden", "riddenDate", "rcdb") SELECT "closed", "id", "latitude", "longitude", "name", "opened", "parkId", "ridden", "riddenDate", "rcdb" FROM "Coaster";
DROP TABLE "Coaster";
ALTER TABLE "new_Coaster" RENAME TO "Coaster";
CREATE UNIQUE INDEX "Coaster_id_key" ON "Coaster"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
