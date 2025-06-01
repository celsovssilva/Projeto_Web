/*
  Warnings:

  - You are about to drop the column `endereco` on the `Event` table. All the data in the column will be lost.
  - Added the required column `cep` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "ticketDeadline" DATETIME NOT NULL,
    "ticketPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "maxTickets" INTEGER,
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "adminId" INTEGER NOT NULL,
    CONSTRAINT "Event_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("adminId", "createdAt", "description", "eventDate", "id", "maxTickets", "name", "status", "ticketDeadline", "ticketPrice", "ticketsSold", "updatedAt") SELECT "adminId", "createdAt", "description", "eventDate", "id", "maxTickets", "name", "status", "ticketDeadline", "ticketPrice", "ticketsSold", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
