-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qutosikuhxabuujxgnnp/sql/new

-- Add offer/discount columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_text text;

-- Set original prices for all existing products (same as current price, since none are on sale yet)
UPDATE products SET original_price = price WHERE original_price IS NULL;
