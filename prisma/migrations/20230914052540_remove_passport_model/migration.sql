/*
  Warnings:

  - You are about to drop the `passports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "passports" DROP CONSTRAINT "passports_userId_fkey";

-- DropTable
DROP TABLE "passports";
