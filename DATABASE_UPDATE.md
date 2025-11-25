# Database Update Required

## Add Tracking Field to Buses Table

You need to run this SQL query in your Supabase SQL Editor to add the tracking_enabled field:

```sql
-- Add tracking_enabled field to buses table
ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_buses_tracking_enabled ON buses(tracking_enabled);
```

Or use the file: `database/add_tracking_field.sql`

## What This Does

- Adds a `tracking_enabled` boolean field to the buses table
- Defaults to `false` (tracking disabled by default)
- Creates an index for faster queries
- Allows drivers to enable/disable tracking for their bus
- Only buses with `tracking_enabled = true` will appear on the live map for admins and parents

## After Running the SQL

1. Restart your backend server
2. The tracking toggle will appear in the Driver Dashboard
3. Drivers can enable/disable tracking
4. Only tracked buses will be visible to admins and parents

