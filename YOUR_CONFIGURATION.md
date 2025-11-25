# Your Project Configuration

This file contains your actual configuration details. Use these values when setting up your `.env` files.

## ⚠️ Important Security Note
**DO NOT commit this file to version control!** This file is for your reference only.

## Backend Configuration (`backend/.env`)

Create a file named `.env` in the `backend` folder with these contents:

```env
# Supabase Configuration
SUPABASE_URL=https://tkfsxdmxvggdoehtncce.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnN4ZG14dmdnZG9laHRuY2NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIxMDEyOCwiZXhwIjoyMDc4Nzg2MTI4fQ.28ZtAJiCKcHkaRfxlTIE99zFmohJZ2IBnAk-Tg9lJ2U

# JWT Secret (generate a random string for production)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Google Maps API Key (optional - currently using Leaflet/OpenStreetMap)
GOOGLE_MAPS_API_KEY=AIzaSyAqzaRZIBMoM7vEAG7JPI4b-SJMC5F58JY
```

## Frontend Configuration (`frontend/.env`)

Create a file named `.env` in the `frontend` folder with these contents:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Google Maps API Key (optional - currently using Leaflet/OpenStreetMap)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAqzaRZIBMoM7vEAG7JPI4b-SJMC5F58JY
```

## Quick Setup Instructions

1. **Backend `.env` file:**
   - Navigate to `backend` folder
   - Create a new file named `.env` (no extension)
   - Copy the backend configuration above into it
   - **Important:** Generate a random string for `JWT_SECRET` (you can use: https://randomkeygen.com/)

2. **Frontend `.env` file:**
   - Navigate to `frontend` folder
   - Create a new file named `.env` (no extension)
   - Copy the frontend configuration above into it

## Your Supabase Details

- **Project URL**: https://tkfsxdmxvggdoehtncce.supabase.co
- **Project ID**: tkfsxdmxvggdoehtncce
- **Service Role Key**: (see backend/.env above)
- **Anon Public Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnN4ZG14dmdnZG9laHRuY2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAxMjgsImV4cCI6MjA3ODc4NjEyOH0.0FQJ4mO3UzdDeQMAOY0ijGnMlE4AxcWDF19l1gngrOw

## Next Steps

1. ✅ Create both `.env` files with the configurations above
2. ✅ Generate a secure JWT_SECRET (use a random string generator)
3. ✅ Run the database schema in Supabase SQL Editor
4. ✅ Start the backend server: `cd backend && npm run dev`
5. ✅ Start the frontend server: `cd frontend && npm run dev`
6. ✅ Create your admin user (see CREATE_ADMIN_USER.md)

## Security Reminders

- ⚠️ Never share your service_role key publicly
- ⚠️ Never commit `.env` files to Git
- ⚠️ Change JWT_SECRET to a random string
- ⚠️ Keep this file private

