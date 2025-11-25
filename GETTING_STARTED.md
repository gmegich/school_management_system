# Getting Started Guide

Welcome! This guide will walk you through setting up the School Bus Management System from scratch. If you're a beginner, don't worry - we'll go step by step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Node.js](#step-1-install-nodejs)
3. [Step 2: Set Up Database](#step-2-set-up-database)
4. [Step 3: Set Up Backend](#step-3-set-up-backend)
5. [Step 4: Set Up Frontend](#step-4-set-up-frontend)
6. [Step 5: Create Admin User](#step-5-create-admin-user)
7. [Step 6: Test the Application](#step-6-test-the-application)
8. [Common Issues](#common-issues)

## Prerequisites

Before starting, you need:

1. **A computer** (Windows, Mac, or Linux)
2. **Internet connection**
3. **A web browser** (Chrome, Firefox, or Edge)
4. **A code editor** (VS Code is recommended and free)

## Step 1: Install Node.js

Node.js is the runtime that runs our backend server.

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support)
3. Run the installer
4. Follow the installation wizard (use default settings)
5. **Verify installation**: Open a terminal/command prompt and type:
   ```bash
   node --version
   ```
   You should see a version number like `v18.x.x` or higher.

6. Also check npm:
   ```bash
   npm --version
   ```
   You should see a version number.

✅ **Checkpoint**: If both commands show version numbers, you're good to go!

## Step 2: Set Up Database

We'll use Supabase (a free cloud database service).

### 2.1 Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

### 2.2 Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `school-bus-management` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is fine
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### 2.3 Get Your Credentials

1. In your project, click **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (the long string under "service_role")
   - ⚠️ Keep these secret! Save them somewhere safe.

### 2.4 Run Database Schema

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**
3. Open the file `database/schema.sql` from this project
4. Copy all the contents
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success" message

✅ **Checkpoint**: Go to **Table Editor** - you should see 6 tables (users, buses, routes, students, locations, attendance)

## Step 3: Set Up Backend

The backend is the server that handles all the logic.

### 3.1 Open Terminal

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac/Linux**: Open Terminal app

### 3.2 Navigate to Backend Folder

```bash
cd "path/to/your/project/backend"
```

For example:
```bash
cd "C:\Users\YourName\Desktop\school bus management\backend"
```

### 3.3 Install Dependencies

```bash
npm install
```

This will take 1-2 minutes. Wait for it to finish.

### 3.4 Create Environment File

1. In the `backend` folder, find `.env.example`
2. Copy it and rename to `.env` (remove `.example`)
3. Open `.env` in a text editor
4. Fill in your values:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production
PORT=5000
CORS_ORIGIN=http://localhost:3001
```

Replace:
- `SUPABASE_URL` with your Project URL from Step 2.3
- `SUPABASE_SERVICE_KEY` with your service_role key from Step 2.3
- `JWT_SECRET` with any random string (you can use an online generator)

### 3.5 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📡 Socket.IO server ready
```

✅ **Checkpoint**: Keep this terminal open! The server must keep running.

## Step 4: Set Up Frontend

The frontend is what users see and interact with.

### 4.1 Open a NEW Terminal

Keep the backend terminal running, open a new one.

### 4.2 Navigate to Frontend Folder

```bash
cd "path/to/your/project/frontend"
```

### 4.3 Install Dependencies

```bash
npm install
```

Wait for it to finish (1-2 minutes).

### 4.4 Create Environment File

1. In the `frontend` folder, find `.env.example`
2. Copy it and rename to `.env`
3. Open `.env` and verify:

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

These should work as-is if backend is on port 5000.

### 4.5 Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3001/
```

✅ **Checkpoint**: Your browser should automatically open to `http://localhost:3001`

## Step 5: Create Admin User

You need an admin account to login. See `CREATE_ADMIN_USER.md` for detailed instructions.

**Quick Method** (using Node.js script):

1. In the `backend` folder, create a file `create-admin.js`:

```javascript
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createAdmin() {
  const email = 'admin@example.com';  // Change this!
  const password = 'admin123';        // Change this!
  const name = 'Admin User';

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password: hashedPassword,
      role: 'admin',
      name,
    })
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Admin created!');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

createAdmin();
```

2. Run it:
```bash
cd backend
node create-admin.js
```

3. Note your email and password - you'll use these to login!

## Step 6: Test the Application

1. **Open browser** to `http://localhost:3001`
2. **Login** with your admin credentials
3. **Explore** the dashboard!

### What to Test

- ✅ Login works
- ✅ Dashboard loads
- ✅ Can see the interface
- ✅ Navigation works

## Common Issues

### "npm is not recognized"
- Node.js isn't installed or not in PATH
- Reinstall Node.js and restart terminal

### "Port 5000 already in use"
- Another program is using port 5000
- Change `PORT=5001` in `backend/.env` and restart

### "Cannot connect to database"
- Check your Supabase URL and service key in `.env`
- Make sure you copied the `service_role` key (not `anon` key)
- Verify Supabase project is active

### "Module not found"
- Dependencies aren't installed
- Run `npm install` again in the folder with the error

### "Login doesn't work"
- Verify admin user was created correctly
- Check password was hashed properly
- See `TROUBLESHOOTING_LOGIN.md`

## Next Steps

Once everything is working:

1. ✅ Create more users (drivers, parents)
2. ✅ Add buses
3. ✅ Create routes
4. ✅ Add students
5. ✅ Assign students to buses
6. ✅ Test GPS tracking
7. ✅ Test attendance features

## Getting Help

- Check the other documentation files
- Review error messages in the terminal
- Verify all steps were completed
- Check that both servers are running

---

**Congratulations! 🎉 You've set up the School Bus Management System!**

