-- Add tracking_enabled field to buses table
ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_buses_tracking_enabled ON buses(tracking_enabled);

