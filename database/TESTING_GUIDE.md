# Database Testing Guide

This guide explains how to test your database setup using the provided SQL test files.

## Quick Test (Recommended First)

**File:** `QUICK_TEST.sql`

This is a simple test to verify your database is working correctly.

### How to Run:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open `database/QUICK_TEST.sql` file
4. Copy all the contents
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### What It Tests:

- ✅ All 6 tables exist
- ✅ Can insert data
- ✅ Can read data
- ✅ Foreign keys work
- ✅ JSONB functionality works

**Expected Result:** All queries should run successfully without errors.

---

## Comprehensive Test

**File:** `test_queries.sql`

This is a complete test suite with sample data and extensive testing.

### How to Run:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open `database/test_queries.sql` file
4. You can run:
   - **All queries at once** (copy entire file)
   - **Individual sections** (copy specific sections)

### What It Tests:

#### Section 1: Verify Tables Exist
- Checks if all 6 tables were created
- Shows table structure

#### Section 2: Verify Table Structures
- Checks column names and data types
- Verifies table schemas

#### Section 3: Insert Test Data
- Creates sample users (admin, driver, parent)
- Creates sample routes
- Creates sample buses
- Creates sample students
- **Note:** User passwords are placeholders - use `create-admin.js` for real users

#### Section 4: Test Queries
- View all users, routes, buses, students
- Test relationships between tables

#### Section 5: Test Relationships
- Students to buses
- Buses to drivers
- Students to parents

#### Section 6: Test GPS Location Inserts
- Insert location data
- Query latest locations
- Query location history

#### Section 7: Test Attendance Inserts
- Insert attendance records
- Query attendance by student
- Query attendance by date

#### Section 8: Test Statistics
- Count users by role
- Count students per bus
- Count attendance records

#### Section 9: Test JSONB Queries
- Query route stops (stored as JSON)
- Extract specific stop information

#### Section 10: Test Constraints
- Test invalid data (should fail)
- Test duplicate emails (should fail)

#### Section 11: Cleanup (Optional)
- Remove test data if needed

#### Section 12-14: Verify Database Features
- Check indexes
- Check triggers
- Check Row Level Security

---

## Step-by-Step Testing Process

### Step 1: Run Quick Test
```sql
-- Run QUICK_TEST.sql
```
**Goal:** Verify basic functionality

### Step 2: Insert Test Data
```sql
-- Run Section 3 from test_queries.sql
-- (Insert test data section)
```
**Goal:** Populate database with sample data

### Step 3: Test Queries
```sql
-- Run Sections 4-7 from test_queries.sql
```
**Goal:** Verify all queries work correctly

### Step 4: Test Relationships
```sql
-- Run Section 5 from test_queries.sql
```
**Goal:** Verify foreign keys and relationships

### Step 5: Test Advanced Features
```sql
-- Run Sections 8-9 from test_queries.sql
```
**Goal:** Test statistics and JSONB queries

---

## Common Test Scenarios

### Test 1: Verify Database Setup
```sql
-- Run QUICK_TEST.sql
```
**Expected:** All tests pass

### Test 2: Create Sample Data
```sql
-- Run Section 3 from test_queries.sql
```
**Expected:** Data inserted successfully

### Test 3: Test User Login Data
```sql
SELECT id, email, role, name FROM users;
```
**Expected:** See your users (or test users)

### Test 4: Test Bus-Route Relationship
```sql
SELECT b.number_plate, r.name as route_name
FROM buses b
LEFT JOIN routes r ON b.route_id = r.id;
```
**Expected:** Buses with their routes

### Test 5: Test Student-Parent Relationship
```sql
SELECT s.name, u.name as parent_name
FROM students s
JOIN users u ON s.parent_id = u.id;
```
**Expected:** Students with their parents

---

## Troubleshooting

### Error: "relation does not exist"
**Problem:** Tables weren't created
**Solution:** Run `schema.sql` first

### Error: "duplicate key value"
**Problem:** Test data already exists
**Solution:** Use `ON CONFLICT DO NOTHING` or delete existing data first

### Error: "foreign key constraint"
**Problem:** Referenced data doesn't exist
**Solution:** Insert parent records first (users before students, routes before buses)

### Error: "invalid input syntax for type jsonb"
**Problem:** JSON format is incorrect
**Solution:** Check JSON syntax in route stops

---

## Sample Test Queries

### Check User Count
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### Check Bus Capacity
```sql
SELECT 
    number_plate,
    capacity,
    (SELECT COUNT(*) FROM students WHERE bus_id = buses.id) as current_students
FROM buses;
```

### Check Recent Locations
```sql
SELECT 
    b.number_plate,
    l.latitude,
    l.longitude,
    l.created_at
FROM locations l
JOIN buses b ON l.bus_id = b.id
ORDER BY l.created_at DESC
LIMIT 10;
```

### Check Today's Attendance
```sql
SELECT 
    s.name,
    a.type,
    a.timestamp
FROM attendance a
JOIN students s ON a.student_id = s.id
WHERE DATE(a.timestamp) = CURRENT_DATE
ORDER BY a.timestamp DESC;
```

---

## Next Steps After Testing

1. ✅ Database is working
2. ✅ Test data inserted
3. ⏭️ Create real admin user (use `create-admin.js`)
4. ⏭️ Start backend server
5. ⏭️ Start frontend server
6. ⏭️ Login and test the application

---

## Notes

- **Test data passwords are placeholders** - Don't use them for login
- **Use `create-admin.js`** to create real users with proper password hashing
- **Clean up test data** using Section 11 if needed
- **Keep test data** if you want sample data for development

---

**Happy Testing! 🧪**

