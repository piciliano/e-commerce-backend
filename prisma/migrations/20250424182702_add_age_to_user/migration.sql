/*
  Warnings:

  - Added the required column `birth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birth" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
