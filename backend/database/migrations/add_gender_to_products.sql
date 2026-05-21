-- Migration: add gender column to products
-- Run once in Supabase SQL Editor or directly in PostgreSQL

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NOT NULL DEFAULT 'feminino'
    CHECK (gender IN ('feminino', 'masculino', 'misto'));

CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);

-- Optional: update existing products to feminino (already the default, but explicit)
-- UPDATE products SET gender = 'feminino' WHERE gender IS NULL;
