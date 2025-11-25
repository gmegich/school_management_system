# Backend Server Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (found in Supabase dashboard > Settings > API)
     - `JWT_SECRET`: A random secret string for JWT tokens (generate a strong random string)
     - `PORT`: Server port (default: 5000)
     - `CORS_ORIGIN`: Frontend URL (default: http://localhost:3001)

4. **Start the server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/bus` - Bus management
- `/api/routes` - Route management
- `/api/gps` - GPS tracking
- `/api/attendance` - Attendance management
- `/api/students` - Student management
- `/api/users` - User management

## Socket.IO

The server includes Socket.IO for real-time GPS tracking. Clients can:
- Join bus rooms: `join-bus-room`
- Leave bus rooms: `leave-bus-room`
- Send location updates: `location-update`
- Receive location updates: `location-update`

## Troubleshooting

- **Port already in use**: Change the PORT in `.env`
- **Supabase connection errors**: Verify your credentials in `.env`
- **CORS errors**: Make sure CORS_ORIGIN matches your frontend URL

