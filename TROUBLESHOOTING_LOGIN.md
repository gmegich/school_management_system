# Login Troubleshooting Guide

Having trouble logging in? Follow this guide to diagnose and fix the issue.

## Quick Checks

1. ✅ **Both servers running?**
   - Backend on port 5000
   - Frontend on port 3001

2. ✅ **Admin user exists?**
   - Check Supabase Table Editor → users table
   - Should see your admin user

3. ✅ **Using correct credentials?**
   - Email matches exactly (case-sensitive)
   - Password is the original (not the hash)

## Common Issues & Solutions

### Issue 1: "Invalid email or password"

**Possible Causes:**
- Admin user doesn't exist
- Password was hashed incorrectly
- Email doesn't match exactly

**Solutions:**

1. **Verify user exists:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT id, email, role FROM users WHERE role = 'admin';
   ```

2. **Check password hash:**
   - Password should be hashed with bcrypt
   - Hash should start with `$2a$` or `$2b$`
   - If using `crypt()` function, it won't work with bcryptjs

3. **Recreate admin user:**
   - Delete existing admin user
   - Use the Node.js script from `CREATE_ADMIN_USER.md` (Method 3)
   - This ensures proper bcrypt hashing

### Issue 2: "Network Error" or "Cannot connect"

**Possible Causes:**
- Backend server not running
- Wrong API URL
- CORS issues

**Solutions:**

1. **Check backend is running:**
   ```bash
   # Should see: "Server running on port 5000"
   ```

2. **Verify API URL:**
   - Check `frontend/.env`
   - Should be: `VITE_API_URL=http://localhost:5000`
   - Restart frontend after changing `.env`

3. **Test backend directly:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

### Issue 3: "Token error" or "Unauthorized"

**Possible Causes:**
- JWT_SECRET mismatch
- Token expired
- Backend can't verify token

**Solutions:**

1. **Check JWT_SECRET:**
   - Verify `backend/.env` has `JWT_SECRET` set
   - Should be a random string
   - Restart backend after changing

2. **Clear browser storage:**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Delete `token` and `user` entries
   - Try logging in again

### Issue 4: Page loads but login form doesn't work

**Possible Causes:**
- JavaScript errors
- API not responding
- Network issues

**Solutions:**

1. **Check browser console:**
   - Press F12 → Console tab
   - Look for red error messages
   - Share errors for debugging

2. **Check network tab:**
   - Press F12 → Network tab
   - Try logging in
   - Check if `/api/auth/login` request appears
   - Check response status (should be 200)

3. **Verify backend logs:**
   - Check backend terminal
   - Should see request logs
   - Look for error messages

### Issue 5: "Email already exists" when creating admin

**Solution:**
- User already exists
- Either use existing credentials
- Or delete user first, then recreate

### Issue 6: Login works but redirects to wrong page

**Possible Causes:**
- User role not set correctly
- Frontend routing issue

**Solutions:**

1. **Check user role:**
   ```sql
   SELECT email, role FROM users WHERE email = 'your_email@example.com';
   ```
   Should show `role = 'admin'`

2. **Check browser console:**
   - After login, check what user object is stored
   - Should have `role: 'admin'`

## Step-by-Step Debugging

### Step 1: Verify Database

```sql
-- Run in Supabase SQL Editor
SELECT id, email, role, 
       CASE 
         WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' 
         THEN 'bcrypt' 
         ELSE 'other' 
       END as hash_type
FROM users 
WHERE role = 'admin';
```

**Expected:**
- At least one row
- `hash_type` should be 'bcrypt'

### Step 2: Test Backend API Directly

```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Expected:**
- Returns JSON with `token` and `user` objects
- Status 200

**If error:**
- Check backend terminal for details
- Verify credentials match database

### Step 3: Check Frontend Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Find the `/api/auth/login` request
5. Check:
   - Status code (should be 200)
   - Response body (should have token)
   - Request payload (email/password sent)

### Step 4: Verify Environment Variables

**Backend `.env`:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ... (long string)
JWT_SECRET=some_random_string
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Important:**
- No quotes around values
- No trailing spaces
- Restart servers after changing `.env`

## Still Not Working?

1. **Double-check all setup steps:**
   - Review `GETTING_STARTED.md`
   - Verify each step completed

2. **Check error messages:**
   - Backend terminal
   - Browser console
   - Network tab

3. **Try recreating admin:**
   - Delete existing admin user
   - Use Node.js script method
   - Use simple password for testing

4. **Verify database connection:**
   - Test Supabase connection
   - Check project is active
   - Verify credentials are correct

## Test Credentials Template

After creating admin, test with:

```
Email: admin@example.com
Password: admin123
```

(Use the actual email/password you created)

---

**If you're still stuck, check:**
- All error messages (backend + browser console)
- That both servers are running
- That database has the admin user
- That environment variables are correct

