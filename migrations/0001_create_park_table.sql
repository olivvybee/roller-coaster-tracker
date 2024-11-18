-- CreateTable
CREATE TABLE "Park" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Park_id_key" ON "Park"("id");
