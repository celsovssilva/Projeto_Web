-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "resetPasswordRequestedAt" DATETIME;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "resetPasswordRequestedAt" DATETIME;
