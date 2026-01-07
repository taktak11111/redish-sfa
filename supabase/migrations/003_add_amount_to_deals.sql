-- Add amount column to deals table for sales analysis
ALTER TABLE deals ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 0) DEFAULT 0;

-- Add index for performance on result_date
CREATE INDEX IF NOT EXISTS idx_deals_result_date ON deals(result_date);
