-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "author_id" TEXT,
    "author_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_mentor_id_idx" ON "bookings"("mentor_id");

-- CreateIndex
CREATE INDEX "reviews_mentor_id_idx" ON "reviews"("mentor_id");
