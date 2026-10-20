-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "notificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notificationStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "notificationUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "projectSlug" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "draft" TEXT;

-- CreateTable
CREATE TABLE "ContactAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "ContactAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ConversionCount" (
    "key" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ConversionCount_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PageRevision" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageRedirect" (
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,

    CONSTRAINT "PageRedirect_pkey" PRIMARY KEY ("from")
);

-- CreateIndex
CREATE INDEX "ContactAttachment_messageId_idx" ON "ContactAttachment"("messageId");

-- CreateIndex
CREATE INDEX "RequestLimit_expiresAt_idx" ON "RequestLimit"("expiresAt");

-- CreateIndex
CREATE INDEX "ConversionCount_day_idx" ON "ConversionCount"("day");

-- CreateIndex
CREATE INDEX "PageRevision_pageId_createdAt_idx" ON "PageRevision"("pageId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMessage_requestId_key" ON "ContactMessage"("requestId");

-- AddForeignKey
ALTER TABLE "ContactAttachment" ADD CONSTRAINT "ContactAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageRevision" ADD CONSTRAINT "PageRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

