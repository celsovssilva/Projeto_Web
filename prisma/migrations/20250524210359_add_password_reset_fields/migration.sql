/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "passwordResetExpires" DATETIME;
ALTER TABLE "Admin" ADD COLUMN "passwordResetToken" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "passwordResetExpires" DATETIME;
ALTER TABLE "Usuario" ADD COLUMN "passwordResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_passwordResetToken_key" ON "Admin"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_passwordResetToken_key" ON "Usuario"("passwordResetToken");
