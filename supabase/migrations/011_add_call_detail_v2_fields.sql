-- Add v2 call detail fields to call_records
-- Purpose: align CallDetailPanel inputs with updated dropdown settings (status separation + lost reason taxonomy)

ALTER TABLE public.call_records
  ADD COLUMN IF NOT EXISTS customer_type TEXT,
  ADD COLUMN IF NOT EXISTS disqualify_reason TEXT,
  ADD COLUMN IF NOT EXISTS unreachable_reason TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_primary TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_customer_sub TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_company_sub TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_competitor_sub TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_self_sub TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_other_sub TEXT,
  ADD COLUMN IF NOT EXISTS lost_reason_memo_template TEXT;

CREATE INDEX IF NOT EXISTS idx_call_records_customer_type ON public.call_records(customer_type);
CREATE INDEX IF NOT EXISTS idx_call_records_lost_reason_primary ON public.call_records(lost_reason_primary);
