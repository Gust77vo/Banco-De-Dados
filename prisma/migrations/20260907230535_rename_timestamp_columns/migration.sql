/*
  Warnings:

  - You are about to drop the column `data_atualizacao` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `data_criacao` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `data_atualizacao` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `data_criacao` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `data_atualizacao` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `data_criacao` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- Users
ALTER TABLE "users" RENAME COLUMN "data_criacao" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "data_atualizacao" TO "updated_at";

-- Subjects
ALTER TABLE "subjects" RENAME COLUMN "data_criacao" TO "created_at";
ALTER TABLE "subjects" RENAME COLUMN "data_atualizacao" TO "updated_at";

-- Questions
ALTER TABLE "questions" RENAME COLUMN "data_criacao" TO "created_at";
ALTER TABLE "questions" RENAME COLUMN "data_atualizacao" TO "updated_at";