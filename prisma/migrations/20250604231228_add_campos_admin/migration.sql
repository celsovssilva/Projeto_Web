/*
  Warnings:

  - You are about to drop the column `resetPasswordRequestedAt` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `cpf` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "atuacao" TEXT,
    "empresa" TEXT,
    "faculdade" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME
);
INSERT INTO "new_Admin" ("createdAt", "email", "id", "name", "password", "passwordResetExpires", "passwordResetToken", "sobrenome", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "passwordResetExpires", "passwordResetToken", "sobrenome", "updatedAt" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Admin_cpf_key" ON "Admin"("cpf");
CREATE UNIQUE INDEX "Admin_passwordResetToken_key" ON "Admin"("passwordResetToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
