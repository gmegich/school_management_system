# Database Setup Guide

## Overview

This project uses Supabase (PostgreSQL) as the database. The schema includes tables for users, buses, routes, students, locations (GPS tracking), and attendance.

## Setup Instructions

### Option 1: Using Supabase (Recommended)

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose a name and database password
   - Select a region close to you
   - Wait for the project to be created (takes a few minutes)

3. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy your Project URL (this is your `SUPABASE_URL`)
   - Copy your `service_role` key (this is your `SUPABASE_SERVICE_KEY`)
   - ⚠️ Keep the service role key secret! It bypasses RLS.

4. **Run the Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy the contents of `schema.sql`
   - Paste and run it in the SQL Editor
   - Verify all tables were created successfully

5. **Update Your .env File**
   - In `backend/.env`, add:
     ```
     SUPABASE_URL=your_project_url_here
     SUPABASE_SERVICE_KEY=your_service_role_key_here
     ```

### Option 2: Local PostgreSQL

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Install and set up a local database

2. **Create Database**
   ```sql
   CREATE DATABASE bus_management;
   ```

3. **Run Schema**
   ```bash
   psql -d bus_management -f schema.sql
   ```

4. **Update Connection**
   - You'll need to modify the Supabase client in `backend/config/supabase.js`
   - Or use a PostgreSQL client library directly

## Creating Your First Admin User

After setting up the database, you need to create an admin user. See `CREATE_ADMIN_USER.md` for detailed instructions.

## Database Tables

- **users**: User accounts (admin, driver, parent)
- **buses**: Bus information and assignments
- **routes**: Bus routes with stops (stored as JSONB)
- **students**: Student information
- **locations**: GPS tracking data
- **attendance**: Student pickup/drop-off records

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- The current RLS policies are simplified - in production, implement more granular policies
- Always use the service role key securely (never expose it in frontend code)
- Application-level authorization is handled in the backend routes

## Troubleshooting

- **Connection errors**: Verify your Supabase URL and service key
- **Table not found**: Make sure you ran the schema.sql file
- **Permission errors**: Check that RLS policies are set correctly

