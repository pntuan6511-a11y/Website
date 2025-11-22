/*
  Warnings:

  - Added the required column `imageType` to the `car_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "car_images" ADD COLUMN     "imageType" TEXT NOT NULL;
