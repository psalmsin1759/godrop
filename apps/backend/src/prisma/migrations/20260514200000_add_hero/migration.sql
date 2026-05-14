-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "badge" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT NOT NULL,
    "imageUrl" TEXT,
    "align" TEXT NOT NULL DEFAULT 'left',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);
