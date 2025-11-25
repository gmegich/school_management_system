-- ============================================
-- Database Test Queries
-- Use this file to test your database setup
-- Run these queries in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VERIFY TABLES EXIST
-- ============================================
-- Check if all tables were created successfully
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'routes', 'buses', 'students', 'locations', 'attendance')
ORDER BY table_name;

-- Expected: 6 rows (one for each table)

-- ============================================
-- 2. VERIFY TABLE STRUCTURES
-- ============================================

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check buses table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'buses'
ORDER BY ordinal_position;

-- ============================================
-- 3. INSERT TEST DATA
-- ============================================

-- Insert a test admin user (password: admin123)
-- Note: This uses bcrypt hash. For actual use, use the create-admin.js script
INSERT INTO users (email, password, role, name)
VALUES (
    'testadmin@example.com',
    '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- This is a placeholder hash
    'admin',
    'Test Admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert test routes
INSERT INTO routes (name, stops)
VALUES 
    ('Route 1 - Main Street', '[
        {"name": "School", "latitude": 40.7128, "longitude": -74.0060, "order": 1},
        {"name": "Stop 1", "latitude": 40.7150, "longitude": -74.0080, "order": 2},
        {"name": "Stop 2", "latitude": 40.7180, "longitude": -74.0100, "order": 3}
    ]'::jsonb),
    ('Route 2 - Park Avenue', '[
        {"name": "School", "latitude": 40.7128, "longitude": -74.0060, "order": 1},
        {"name": "Stop A", "latitude": 40.7100, "longitude": -74.0040, "order": 2},
        {"name": "Stop B", "latitude": 40.7080, "longitude": -74.0020, "order": 3}
    ]'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert test driver and parent users
INSERT INTO users (email, password, role, name)
VALUES 
    ('driver1@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'driver', 'John Driver'),
    ('parent1@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'parent', 'Jane Parent')
ON CONFLICT (email) DO NOTHING;

-- Insert test buses
INSERT INTO buses (number_plate, capacity, route_id, driver_id)
SELECT 
    'BUS-001',
    50,
    (SELECT id FROM routes LIMIT 1),
    (SELECT id FROM users WHERE role = 'driver' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM buses WHERE number_plate = 'BUS-001');

INSERT INTO buses (number_plate, capacity, route_id)
SELECT 
    'BUS-002',
    40,
    (SELECT id FROM routes ORDER BY id DESC LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM buses WHERE number_plate = 'BUS-002');

-- Insert test students
INSERT INTO students (name, grade, parent_id, bus_id)
SELECT 
    'Alice Student',
    'Grade 5',
    (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
    (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM students WHERE name = 'Alice Student');

INSERT INTO students (name, grade, parent_id, bus_id)
SELECT 
    'Bob Student',
    'Grade 3',
    (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
    (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM students WHERE name = 'Bob Student');

-- ============================================
-- 4. TEST QUERIES - VIEW DATA
-- ============================================

-- View all users
SELECT id, email, role, name, created_at
FROM users
ORDER BY role, name;

-- View all routes
SELECT id, name, stops, created_at
FROM routes
ORDER BY name;

-- View all buses with route and driver info
SELECT 
    b.id,
    b.number_plate,
    b.capacity,
    r.name as route_name,
    u.name as driver_name,
    u.email as driver_email
FROM buses b
LEFT JOIN routes r ON b.route_id = r.id
LEFT JOIN users u ON b.driver_id = u.id
ORDER BY b.number_plate;

-- View all students with parent and bus info
SELECT 
    s.id,
    s.name,
    s.grade,
    p.name as parent_name,
    p.email as parent_email,
    b.number_plate as bus_number
FROM students s
LEFT JOIN users p ON s.parent_id = p.id
LEFT JOIN buses b ON s.bus_id = b.id
ORDER BY s.name;

-- ============================================
-- 5. TEST RELATIONSHIPS
-- ============================================

-- Test: Get all students for a specific bus
SELECT 
    s.name,
    s.grade,
    b.number_plate
FROM students s
JOIN buses b ON s.bus_id = b.id
WHERE b.number_plate = 'BUS-001';

-- Test: Get all buses for a specific driver
SELECT 
    b.number_plate,
    b.capacity,
    r.name as route_name
FROM buses b
LEFT JOIN routes r ON b.route_id = r.id
WHERE b.driver_id = (SELECT id FROM users WHERE email = 'driver1@example.com' LIMIT 1);

-- Test: Get all students for a specific parent
SELECT 
    s.name,
    s.grade,
    b.number_plate as bus_number
FROM students s
LEFT JOIN buses b ON s.bus_id = b.id
WHERE s.parent_id = (SELECT id FROM users WHERE email = 'parent1@example.com' LIMIT 1);

-- ============================================
-- 6. TEST GPS LOCATION INSERTS
-- ============================================

-- Insert test location data
INSERT INTO locations (bus_id, latitude, longitude, speed)
SELECT 
    (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1),
    40.7128,
    -74.0060,
    45.5
WHERE NOT EXISTS (
    SELECT 1 FROM locations 
    WHERE bus_id = (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1)
    AND created_at > NOW() - INTERVAL '1 hour'
);

-- Get latest location for a bus
SELECT 
    b.number_plate,
    l.latitude,
    l.longitude,
    l.speed,
    l.created_at
FROM locations l
JOIN buses b ON l.bus_id = b.id
WHERE b.number_plate = 'BUS-001'
ORDER BY l.created_at DESC
LIMIT 1;

-- Get location history for a bus (last 10)
SELECT 
    latitude,
    longitude,
    speed,
    created_at
FROM locations
WHERE bus_id = (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 7. TEST ATTENDANCE INSERTS
-- ============================================

-- Insert test attendance records
INSERT INTO attendance (student_id, bus_id, type, timestamp)
SELECT 
    (SELECT id FROM students WHERE name = 'Alice Student' LIMIT 1),
    (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1),
    'pickup',
    NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (
    SELECT 1 FROM attendance 
    WHERE student_id = (SELECT id FROM students WHERE name = 'Alice Student' LIMIT 1)
    AND DATE(timestamp) = CURRENT_DATE
    AND type = 'pickup'
);

INSERT INTO attendance (student_id, bus_id, type, timestamp)
SELECT 
    (SELECT id FROM students WHERE name = 'Alice Student' LIMIT 1),
    (SELECT id FROM buses WHERE number_plate = 'BUS-001' LIMIT 1),
    'dropoff',
    NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (
    SELECT 1 FROM attendance 
    WHERE student_id = (SELECT id FROM students WHERE name = 'Alice Student' LIMIT 1)
    AND DATE(timestamp) = CURRENT_DATE
    AND type = 'dropoff'
);

-- View attendance records
SELECT 
    s.name as student_name,
    b.number_plate as bus_number,
    a.type,
    a.timestamp,
    a.created_at
FROM attendance a
JOIN students s ON a.student_id = s.id
JOIN buses b ON a.bus_id = b.id
ORDER BY a.timestamp DESC
LIMIT 20;

-- Get attendance for a specific student
SELECT 
    type,
    timestamp,
    b.number_plate as bus_number
FROM attendance a
JOIN buses b ON a.bus_id = b.id
WHERE a.student_id = (SELECT id FROM students WHERE name = 'Alice Student' LIMIT 1)
ORDER BY timestamp DESC;

-- ============================================
-- 8. TEST STATISTICS QUERIES
-- ============================================

-- Count total users by role
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- Count students per bus
SELECT 
    b.number_plate,
    COUNT(s.id) as student_count,
    b.capacity
FROM buses b
LEFT JOIN students s ON b.id = s.bus_id
GROUP BY b.id, b.number_plate, b.capacity
ORDER BY b.number_plate;

-- Count attendance records by type (today)
SELECT 
    type,
    COUNT(*) as count
FROM attendance
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY type;

-- ============================================
-- 9. TEST JSONB QUERIES (Routes with stops)
-- ============================================

-- View route stops (JSONB)
SELECT 
    id,
    name,
    stops
FROM routes;

-- Extract specific stop from route
SELECT 
    r.name as route_name,
    stop->>'name' as stop_name,
    (stop->>'latitude')::numeric as latitude,
    (stop->>'longitude')::numeric as longitude,
    (stop->>'order')::integer as stop_order
FROM routes r,
     jsonb_array_elements(r.stops) as stop
ORDER BY r.name, (stop->>'order')::integer;

-- ============================================
-- 10. TEST CONSTRAINTS AND VALIDATIONS
-- ============================================

-- Test: Try to insert invalid role (should fail)
-- Uncomment to test:
-- INSERT INTO users (email, password, role, name)
-- VALUES ('test@test.com', 'hash', 'invalid_role', 'Test');

-- Test: Try to insert duplicate email (should fail)
-- Uncomment to test:
-- INSERT INTO users (email, password, role, name)
-- VALUES ('testadmin@example.com', 'hash', 'admin', 'Duplicate');

-- ============================================
-- 11. CLEANUP TEST DATA (Optional)
-- ============================================

-- Uncomment these to remove test data:

-- DELETE FROM attendance WHERE student_id IN (SELECT id FROM students WHERE name LIKE '%Student');
-- DELETE FROM locations WHERE bus_id IN (SELECT id FROM buses WHERE number_plate LIKE 'BUS-%');
-- DELETE FROM students WHERE name LIKE '%Student';
-- DELETE FROM buses WHERE number_plate LIKE 'BUS-%';
-- DELETE FROM routes WHERE name LIKE 'Route%';
-- DELETE FROM users WHERE email LIKE '%@example.com';

-- ============================================
-- 12. VERIFY INDEXES
-- ============================================

-- Check indexes on tables
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'buses', 'routes', 'students', 'locations', 'attendance')
ORDER BY tablename, indexname;

-- ============================================
-- 13. VERIFY TRIGGERS
-- ============================================

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 14. TEST ROW LEVEL SECURITY
-- ============================================

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'buses', 'routes', 'students', 'locations', 'attendance')
ORDER BY tablename;

-- ============================================
-- END OF TEST QUERIES
-- ============================================

-- Summary: Run these queries in order to test your database
-- 1. Verify tables exist (Section 1)
-- 2. Insert test data (Section 3)
-- 3. Run test queries (Sections 4-7)
-- 4. Check statistics (Section 8)
-- 5. Verify constraints (Section 10)

