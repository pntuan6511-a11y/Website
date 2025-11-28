-- CreateTable
CREATE TABLE "interest_rates" (
    "id" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interest_rates_pkey" PRIMARY KEY ("id")
);
