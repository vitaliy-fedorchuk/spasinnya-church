-- CreateEnum
CREATE TYPE "EventRepeat" AS ENUM ('WEEKLY', 'MONTHLY', 'ONCE');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('OFFLINE', 'ONLINE', 'HYBRID');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "repeat" "EventRepeat" NOT NULL DEFAULT 'WEEKLY',
    "weekdays" INTEGER[],
    "monthWeek" INTEGER,
    "startDate" DATE,
    "endDate" DATE,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "format" "EventFormat",
    "place" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "linkUrl" TEXT NOT NULL DEFAULT '',
    "linkLabel" TEXT NOT NULL DEFAULT '',
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventException" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "place" TEXT,
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "EventException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventException_eventId_date_key" ON "EventException"("eventId", "date");

-- AddForeignKey
ALTER TABLE "EventException" ADD CONSTRAINT "EventException_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
