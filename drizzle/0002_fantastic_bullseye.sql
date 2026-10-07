ALTER TABLE "products" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', "products"."name"), 'A')
        || setweight(to_tsvector('simple', "products"."color"), 'B')
        || setweight(to_tsvector('simple', "products"."description"), 'C')) STORED;--> statement-breakpoint
CREATE INDEX "products_search_vector_idx" ON "products" USING gin ("search_vector");