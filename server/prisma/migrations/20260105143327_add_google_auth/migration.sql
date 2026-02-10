-- CreateTable
CREATE TABLE "mentor_google_auth" (
    "id" SERIAL NOT NULL,
    "mentorId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiryDate" BIGINT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_google_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_google_auth_mentorId_key" ON "mentor_google_auth"("mentorId");
