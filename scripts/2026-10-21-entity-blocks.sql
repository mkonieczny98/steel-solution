-- Układ sekcji stron kategorii produktów i marek pojazdów (kreator w panelu). Bezpieczne przy ponownym uruchomieniu.
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "blocks" TEXT;
ALTER TABLE "VehicleBrand" ADD COLUMN IF NOT EXISTS "blocks" TEXT;
