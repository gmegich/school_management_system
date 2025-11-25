# Step-by-Step Database Creation Guide

This guide will walk you through creating a new Supabase database for the School Bus Management System.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## Step 2: Create New Project

1. Once logged in, click the "New Project" button
2. Fill in the project details:
   - **Name**: `school-bus-management` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is sufficient for development
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your Credentials

1. In your project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: This is for client-side (we won't use this)
   - **service_role key**: Copy this (this is your `SUPABASE_SERVICE_KEY`)
     - ⚠️ **IMPORTANT**: This key has admin privileges. Never expose it in frontend code!

## Step 4: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the `database/schema.sql` file from this project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this means it worked!

## Step 5: Verify Tables Were Created

1. In the Supabase dashboard, click on **Table Editor** in the left sidebar
2. You should see these tables:
   - users
   - routes
   - buses
   - students
   - locations
   - attendance

## Step 6: Update Backend Configuration

1. Open `backend/.env.example`
2. Copy it to `backend/.env` (if it doesn't exist)
3. Update these values:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   JWT_SECRET=your_random_secret_string_here
   ```
4. For `JWT_SECRET`, generate a random string (you can use an online generator or run `openssl rand -base64 32`)

## Step 7: Create Your First Admin User

See `CREATE_ADMIN_USER.md` for instructions on creating your first admin account.

## Troubleshooting

### "Connection refused" or "Invalid credentials"
- Double-check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Make sure there are no extra spaces or quotes
- Verify you're using the `service_role` key, not the `anon` key

### "Table does not exist"
- Go back to SQL Editor and run the schema again
- Check for any error messages in the SQL Editor output

### "Permission denied"
- Make sure you're using the `service_role` key (not `anon` key)
- The service role key bypasses Row Level Security

## Next Steps

1. ✅ Database is set up
2. ✅ Tables are created
3. ⏭️ Create admin user (see `CREATE_ADMIN_USER.md`)
4. ⏭️ Start backend server
5. ⏭️ Start frontend server
6. ⏭️ Login and start using the system!

