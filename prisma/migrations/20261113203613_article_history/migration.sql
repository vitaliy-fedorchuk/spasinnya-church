-- CreateEnum
CREATE TYPE "ArticleAction" AS ENUM ('CREATED', 'EDITED', 'PUBLISHED', 'UNPUBLISHED');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- CreateTable
CREATE TABLE "ArticleEvent" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT,
    "action" "ArticleAction" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleEvent_articleId_at_idx" ON "ArticleEvent"("articleId", "at");

-- CreateIndex
CREATE INDEX "Article_updatedAt_idx" ON "Article"("updatedAt");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEvent" ADD CONSTRAINT "ArticleEvent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEvent" ADD CONSTRAINT "ArticleEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
