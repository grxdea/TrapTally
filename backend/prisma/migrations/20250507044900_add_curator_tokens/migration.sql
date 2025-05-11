-- CreateTable
CREATE TABLE "CuratorToken" (
    "id" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL DEFAULT 'TRAP_TALLY_CURATOR',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratorToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuratorToken_curatorId_key" ON "CuratorToken"("curatorId");
