# Quick Setup Reference

A quick checklist for setting up the project.

## Prerequisites Check

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Supabase project created

## Setup Steps

### 1. Database (5 minutes)

- [ ] Created Supabase project
- [ ] Got Project URL and service_role key
- [ ] Ran `database/schema.sql` in Supabase SQL Editor
- [ ] Verified 6 tables exist

### 2. Backend (3 minutes)

```bash
cd backend
npm install
# Create .env file with Supabase credentials
npm run dev
```

- [ ] Dependencies installed
- [ ] `.env` file created and filled
- [ ] Server running on port 5000

### 3. Frontend (3 minutes)

```bash
cd frontend
npm install
# Create .env file (defaults work)
npm run dev
```

- [ ] Dependencies installed
- [ ] `.env` file created
- [ ] App running on port 3001

### 4. Create Admin (2 minutes)

- [ ] Admin user created (see `CREATE_ADMIN_USER.md`)
- [ ] Can login with admin credentials

## Environment Variables

### Backend `.env`
```
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=random_string
PORT=5000
CORS_ORIGIN=http://localhost:3001
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Quick Commands

**Start Backend:**
```bash
cd backend && npm run dev
```

**Start Frontend:**
```bash
cd frontend && npm run dev
```

**Create Admin (one-time):**
```bash
cd backend && node create-admin.js
```

## URLs

- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Change PORT in `.env` |
| Can't connect to DB | Check Supabase credentials |
| Module not found | Run `npm install` |
| Can't login | Verify admin user exists |

---

**Total Setup Time: ~15 minutes**

