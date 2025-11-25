# How to Create Your First Admin User

Since user registration requires admin privileges, you need to create the first admin user directly in the database.

## Method 1: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Click on **Table Editor** in the left sidebar
   - Click on the **users** table

2. **Insert New Row**
   - Click the **Insert** button (or right-click and select "Insert row")
   - Fill in the fields:
     - **email**: `admin@example.com` (or your email)
     - **password**: You need to hash this first (see below)
     - **role**: `admin`
     - **name**: `Admin User` (or your name)
   - Leave `id`, `created_at`, and `updated_at` as default (auto-generated)

3. **Hash the Password**
   - You need to hash your password using bcrypt
   - Option A: Use an online bcrypt generator (search "bcrypt generator")
     - Enter your password
     - Generate hash
     - Copy the hash (starts with `$2a$` or `$2b$`)
   - Option B: Use Node.js (see Method 2)

4. **Save the Row**
   - Paste the hashed password into the password field
   - Click **Save**

## Method 2: Using SQL Query (More Control)

1. **Open SQL Editor** in Supabase dashboard
2. **Run this query** (replace with your details):

```sql
-- First, install bcrypt extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user with hashed password
-- Password: 'admin123' (change this!)
INSERT INTO users (email, password, role, name)
VALUES (
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),  -- 'admin123' is the password
  'admin',
  'Admin User'
);
```

**Note**: The `crypt` function uses a different hashing method than bcryptjs. For compatibility with the backend, use Method 3.

## Method 3: Using Node.js Script (Recommended)

1. **Create a script file** `create-admin.js` in the backend folder:

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
  const email = 'admin@example.com';  // Change this
  const password = 'admin123';         // Change this
  const name = 'Admin User';           // Change this

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
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
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', data[0].id);
  }
}

createAdmin();
```

2. **Run the script**:
   ```bash
   cd backend
   node create-admin.js
   ```

3. **Login** with the credentials you just created!

## Method 4: Using Backend API (After First Admin Exists)

Once you have one admin user, you can create more users through the API:

1. **Login as admin** at `http://localhost:3001/login`
2. **Use the registration endpoint** (requires admin token):
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "newadmin@example.com",
       "password": "password123",
       "role": "admin",
       "name": "New Admin"
     }'
   ```

## Verify Admin User Was Created

1. Go to Supabase Table Editor
2. Open the **users** table
3. You should see your admin user with `role = 'admin'`

## Default Login Credentials

After creating your admin user, you can login with:
- **Email**: The email you used when creating the admin
- **Password**: The password you set (before hashing)

## Security Notes

- ⚠️ **Change the default password** after first login!
- ⚠️ **Use a strong password** for production
- ⚠️ **Never commit passwords** to version control
- The password is hashed using bcrypt (10 rounds)

## Troubleshooting

### "Email already exists"
- The email is already in use
- Try a different email or delete the existing user first

### "Invalid password" when logging in
- Make sure you're using the original password (not the hash)
- Verify the password was hashed correctly
- Check that you're using bcryptjs-compatible hashing

### "Permission denied"
- Make sure you're using the service role key in your backend `.env`
- Verify the user was created with `role = 'admin'`

