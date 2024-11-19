-- CreateTable
CREATE TABLE "Coaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ridden" BOOLEAN NOT NULL,
    "opened" DATETIME NOT NULL,
    "closed" DATETIME,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "rcdb" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    CONSTRAINT "Coaster_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "Park" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
