-- Add status column to buses table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'inactive', 'maintenance', 'out_of_service'));

-- Update existing buses to have 'active' status if they don't have one
UPDATE buses SET status = 'active' WHERE status IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);

