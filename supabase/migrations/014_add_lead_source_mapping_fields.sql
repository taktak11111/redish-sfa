-- Add lead source mapping fields for TEMPOS/OMC imports
ALTER TABLE public.call_records
  ADD COLUMN IF NOT EXISTS restaurant_type TEXT,
  ADD COLUMN IF NOT EXISTS desired_loan_amount TEXT,
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
  ADD COLUMN IF NOT EXISTS shop_phone TEXT,
  ADD COLUMN IF NOT EXISTS tempos_external_id TEXT,
  ADD COLUMN IF NOT EXISTS omc_external_id TEXT,
  ADD COLUMN IF NOT EXISTS tempos_cp_desk TEXT,
  ADD COLUMN IF NOT EXISTS tempos_sales_owner TEXT,
  ADD COLUMN IF NOT EXISTS tempos_cp_code TEXT,
  ADD COLUMN IF NOT EXISTS omc_interior_match_applied TEXT;
