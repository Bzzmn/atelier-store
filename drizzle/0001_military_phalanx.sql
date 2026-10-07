CREATE TYPE "public"."gender" AS ENUM('women', 'men', 'unisex');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "gender" "gender" DEFAULT 'unisex' NOT NULL;--> statement-breakpoint
CREATE INDEX "products_gender_idx" ON "products" USING btree ("gender");