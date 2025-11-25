-- ============================================
-- QUICK DATABASE TEST
-- Run this first to quickly verify your database
-- ============================================

-- 1. Check if all tables exist
SELECT 'Tables Check' as test;
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'routes', 'buses', 'students', 'locations', 'attendance');
-- Expected: 6

-- 2. Check if you can insert and read data
SELECT 'Insert/Read Test' as test;

-- Insert a test route
INSERT INTO routes (name, stops)
VALUES ('Test Route', '[{"name": "Test Stop", "latitude": 40.7128, "longitude": -74.0060, "order": 1}]'::jsonb)
ON CONFLICT DO NOTHING;

-- Read it back
SELECT id, name FROM routes WHERE name = 'Test Route';
-- Expected: 1 row

-- 3. Check foreign key relationships
SELECT 'Foreign Keys Test' as test;

-- This should work (assuming you have a route)
SELECT 
    b.id,
    b.number_plate,
    r.name as route_name
FROM buses b
LEFT JOIN routes r ON b.route_id = r.id
LIMIT 5;
-- Expected: Should run without errors

-- 4. Check JSONB functionality
SELECT 'JSONB Test' as test;
SELECT 
    name,
    jsonb_array_length(stops) as stop_count
FROM routes
LIMIT 5;
-- Expected: Should show route names and stop counts

-- 5. Summary
SELECT '✅ Database is working!' as status;

