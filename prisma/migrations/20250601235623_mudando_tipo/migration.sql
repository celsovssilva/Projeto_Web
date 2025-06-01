/*
  Warnings:

  - You are about to alter the column `number` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Made the column `maxTickets` on table `Event` required. This step will fail if there are existing NULL values in that column.

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
    "number" INTEGER NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "maxTickets" INTEGER NOT NULL,
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "adminId" INTEGER NOT NULL,
    CONSTRAINT "Event_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("adminId", "cep", "city", "complement", "createdAt", "description", "eventDate", "id", "maxTickets", "name", "neighborhood", "number", "state", "status", "street", "ticketDeadline", "ticketPrice", "ticketsSold", "updatedAt") SELECT "adminId", "cep", "city", "complement", "createdAt", "description", "eventDate", "id", "maxTickets", "name", "neighborhood", "number", "state", "status", "street", "ticketDeadline", "ticketPrice", "ticketsSold", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
