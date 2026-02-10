-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "duration_hours" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "meet_link" TEXT,
ADD COLUMN     "mentor_response_at" TIMESTAMP(3),
ADD COLUMN     "rejection_reason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "bookings_student_id_idx" ON "bookings"("student_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
