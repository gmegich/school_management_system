-- Migration: Add 'absent' type to attendance table
-- This updates the attendance table to allow 'absent' as a valid attendance type

-- First, drop the existing check constraint
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_type_check;

-- Add the new check constraint that includes 'absent'
ALTER TABLE attendance ADD CONSTRAINT attendance_type_check 
  CHECK (type IN ('pickup', 'dropoff', 'absent'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'attendance'::regclass 
AND conname = 'attendance_type_check';

