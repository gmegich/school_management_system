# 🚀 START HERE - Beginner's Quick Start

Welcome! This is your starting point. Follow these steps to get your School Bus Management System running.

## 📋 What You'll Need

1. **Computer** with internet
2. **15-20 minutes** of time
3. **Patience** (it's easier than it looks!)

## 🎯 The 5 Main Steps

### Step 1: Install Node.js (2 minutes)
- Go to https://nodejs.org/
- Download and install the **LTS version**
- ✅ Done when: `node --version` shows a number

### Step 2: Set Up Database (5 minutes)
- Go to https://supabase.com and sign up (free)
- Create a new project
- Run the SQL from `database/schema.sql`
- Copy your Project URL and service key
- 📖 **Detailed guide:** `database/CREATE_NEW_DATABASE.md`

### Step 3: Set Up Backend (3 minutes)
```bash
cd backend
npm install
```
- Create `backend/.env` file with:
  ```
  SUPABASE_URL=your_url_here
  SUPABASE_SERVICE_KEY=your_key_here
  JWT_SECRET=any_random_string
  PORT=5000
  CORS_ORIGIN=http://localhost:3001
  ```
- Run: `npm run dev`
- ✅ Done when: You see "Server running on port 5000"

### Step 4: Set Up Frontend (3 minutes)
```bash
cd frontend
npm install
```
- Create `frontend/.env` file with:
  ```
  VITE_API_URL=http://localhost:5000
  VITE_SOCKET_URL=http://localhost:5000
  ```
- Run: `npm run dev`
- ✅ Done when: Browser opens to http://localhost:3001

### Step 5: Create Admin User (2 minutes)
```bash
cd backend
# Edit create-admin.js to set your email/password
node create-admin.js
```
- 📖 **Detailed guide:** `CREATE_ADMIN_USER.md`

## 🎉 You're Done!

1. Go to http://localhost:3001
2. Login with your admin credentials
3. Start exploring!

## 📚 Need More Help?

- **Complete beginner?** → Read `BEGINNER_GUIDE.md`
- **Detailed setup?** → Read `GETTING_STARTED.md`
- **Quick reference?** → Read `QUICK_SETUP.md`
- **Login problems?** → Read `TROUBLESHOOTING_LOGIN.md`
- **Check your setup?** → Use `SETUP_CHECKLIST.md`

## ⚠️ Important Notes

1. **Keep both servers running** - Backend AND Frontend terminals must stay open
2. **Save your credentials** - Write down your admin email/password
3. **Don't skip steps** - Each step builds on the previous one
4. **Read error messages** - They usually tell you what's wrong

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm not found" | Install Node.js |
| "Port in use" | Change PORT in `.env` |
| "Can't connect" | Check Supabase credentials |
| "Can't login" | Verify admin user exists |

## 📁 Project Structure

```
school-bus-management/
├── START_HERE.md          ← You are here!
├── BEGINNER_GUIDE.md      ← Read this if you're new
├── GETTING_STARTED.md     ← Detailed setup guide
├── backend/               ← Server code
├── frontend/              ← Website code
└── database/              ← Database setup
```

## ✅ Quick Checklist

Before you start, make sure you have:
- [ ] Node.js installed
- [ ] Internet connection
- [ ] Code editor (VS Code recommended)
- [ ] 15-20 minutes free

After setup, verify:
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3001)
- [ ] Can access http://localhost:3001
- [ ] Can login with admin account

---

## 🎓 Learning Path

1. **First time?** → Start with `BEGINNER_GUIDE.md`
2. **Ready to set up?** → Follow `GETTING_STARTED.md`
3. **Having issues?** → Check `TROUBLESHOOTING_LOGIN.md`
4. **Everything works?** → Start using the system!

---

**Ready? Let's go! 🚀**

Start with: `BEGINNER_GUIDE.md` or `GETTING_STARTED.md`

