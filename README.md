# 🚌 Smart School Bus Management System

A complete full-stack application for managing school buses with real-time GPS tracking, attendance monitoring, and role-based access control.

## ✨ Features

- **Real-time GPS Tracking**: Live bus location updates using Socket.IO
- **Role-Based Access**: Separate dashboards for Admin, Driver, and Parent
- **Attendance Management**: Track student pickup and drop-off
- **Interactive Maps**: Real-time map visualization with Leaflet.js
- **Mobile-Friendly**: Responsive design for all devices

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router, TailwindCSS, Leaflet.js, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, JWT Authentication
- **Database**: Supabase (PostgreSQL) with Row Level Security

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase Account** (free tier works) - [Sign up](https://supabase.com)
- **Code Editor** (VS Code recommended)

## 🚀 Quick Start Guide

### Step 1: Clone or Download the Project

If you haven't already, make sure all project files are in your workspace.

### Step 2: Set Up Database

1. Follow the detailed guide in `database/CREATE_NEW_DATABASE.md`
2. Create a Supabase project
3. Run the SQL schema from `database/schema.sql`
4. Get your Supabase URL and service key

### Step 3: Set Up Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url_here
     SUPABASE_SERVICE_KEY=your_service_key_here
     JWT_SECRET=your_random_secret_string_here
     PORT=5000
     CORS_ORIGIN=http://localhost:3001
     ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   
   You should see: `🚀 Server running on port 5000`

### Step 4: Set Up Frontend

1. Open a **new terminal** (keep backend running) and navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   - Copy `frontend/.env.example` to `frontend/.env`
   - The defaults should work if backend is on port 5000:
     ```
     VITE_API_URL=http://localhost:5000
     VITE_SOCKET_URL=http://localhost:5000
     ```

4. Start the frontend server:
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3001`

### Step 5: Create Admin User

1. Follow the guide in `CREATE_ADMIN_USER.md`
2. The easiest method is using the Node.js script (Method 3)
3. Or use the Supabase dashboard to insert a user manually

### Step 6: Login and Explore!

1. Go to `http://localhost:3001`
2. Login with your admin credentials
3. Start managing buses, routes, and students!

## 📁 Project Structure

```
school-bus-management/
├── backend/              # Node.js backend server
│   ├── config/          # Configuration files
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── services/    # API and socket services
│   └── package.json
├── database/            # Database setup files
│   └── schema.sql       # Database schema
└── README.md           # This file
```

## 📚 Documentation

- **`GETTING_STARTED.md`** - Comprehensive setup guide
- **`QUICK_SETUP.md`** - Quick reference guide
- **`CREATE_ADMIN_USER.md`** - How to create your first admin
- **`database/CREATE_NEW_DATABASE.md`** - Database setup guide
- **`backend/README.md`** - Backend setup details
- **`frontend/README.md`** - Frontend setup details

## 🎯 User Roles

### Admin
- Full system access
- Manage buses, routes, students, and users
- View all data and live tracking

### Driver
- View assigned bus only
- Start/stop GPS tracking
- Mark student attendance
- Mobile-friendly interface

### Parent
- Track child's bus in real-time
- View attendance history
- View bus information

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Row Level Security (RLS) in database
- Role-based access control
- Protected API routes

## 🐛 Troubleshooting

### Backend won't start
- Check that port 5000 is not in use
- Verify `.env` file exists and has correct values
- Make sure all dependencies are installed (`npm install`)

### Frontend won't start
- Check that port 3001 is not in use
- Verify `.env` file exists
- Make sure all dependencies are installed

### Can't login
- Verify admin user was created in database
- Check that password was hashed correctly
- See `TROUBLESHOOTING_LOGIN.md` for more help

### Database connection errors
- Verify Supabase URL and service key in `.env`
- Check that database schema was run successfully
- Ensure Supabase project is active

## 📝 Next Steps

1. ✅ Set up database
2. ✅ Create admin user
3. ✅ Start backend and frontend
4. ⏭️ Create buses and routes
5. ⏭️ Add students and assign to buses
6. ⏭️ Assign drivers to buses
7. ⏭️ Test GPS tracking
8. ⏭️ Test attendance features

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting sections in the documentation
2. Verify all setup steps were completed
3. Check that all environment variables are set correctly
4. Review the console for error messages

## 📄 License

This project is provided as-is for educational and development purposes.

---

**Happy Coding! 🚀**

# school_management_system
