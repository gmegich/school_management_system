# Setup Verification Checklist

Use this checklist to verify your setup is complete and working.

## ✅ Pre-Setup

- [ ] Node.js installed and working
- [ ] npm installed and working
- [ ] Code editor ready
- [ ] Internet connection active

## ✅ Database Setup

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Project URL copied
- [ ] Service role key copied
- [ ] `schema.sql` executed successfully
- [ ] All 6 tables visible in Table Editor:
  - [ ] users
  - [ ] routes
  - [ ] buses
  - [ ] students
  - [ ] locations
  - [ ] attendance

## ✅ Backend Setup

- [ ] Navigated to `backend` folder
- [ ] Ran `npm install` successfully
- [ ] Created `.env` file
- [ ] Filled in all environment variables:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] JWT_SECRET
  - [ ] PORT
  - [ ] CORS_ORIGIN
- [ ] Backend server starts without errors
- [ ] Server running on port 5000
- [ ] Health check works: http://localhost:5000/health

## ✅ Frontend Setup

- [ ] Navigated to `frontend` folder
- [ ] Ran `npm install` successfully
- [ ] Created `.env` file
- [ ] Filled in environment variables:
  - [ ] VITE_API_URL
  - [ ] VITE_SOCKET_URL
- [ ] Frontend server starts without errors
- [ ] App accessible at http://localhost:3001
- [ ] Login page loads

## ✅ Admin User

- [ ] Admin user created in database
- [ ] Can see admin user in Supabase Table Editor
- [ ] Admin user has `role = 'admin'`
- [ ] Password is hashed (starts with `$2a$` or `$2b$`)
- [ ] Know the email and password for login

## ✅ Application Testing

- [ ] Can access http://localhost:3001
- [ ] Login page displays correctly
- [ ] Can login with admin credentials
- [ ] Redirected to admin dashboard after login
- [ ] Dashboard loads without errors
- [ ] Navigation sidebar visible
- [ ] Can see statistics cards
- [ ] No console errors in browser
- [ ] No errors in backend terminal

## ✅ Functionality Tests

- [ ] Can view buses (even if empty)
- [ ] Can view routes (even if empty)
- [ ] Can view students (even if empty)
- [ ] Can view users list
- [ ] Live map component loads (may be empty)
- [ ] Logout button works
- [ ] Can login again after logout

## ⚠️ Common Issues to Check

- [ ] Both servers running simultaneously
- [ ] No port conflicts
- [ ] Environment variables correct
- [ ] Database connection working
- [ ] CORS configured correctly
- [ ] No firewall blocking ports

## 🎉 Setup Complete!

If all items are checked, your setup is complete! You can now:

1. Create more users (drivers, parents)
2. Add buses and routes
3. Add students
4. Test GPS tracking
5. Test attendance features

---

**Date Completed:** _______________
**Notes:** _________________________________

