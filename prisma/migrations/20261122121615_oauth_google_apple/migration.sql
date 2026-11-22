-- AlterEnum
ALTER TYPE "AuthProvider" ADD VALUE 'APPLE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT;
