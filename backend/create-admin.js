import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration!');
  console.error('   Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  // ⚠️ CHANGE THESE VALUES!
  const email = 'admin@example.com';  // Change to your email
  const password = 'admin123';        // Change to your password
  const name = 'Admin User';           // Change to your name

  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('Name:', name);

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
    console.error('❌ Error creating admin:', error.message);
    if (error.code === '23505') {
      console.error('   → Email already exists. Use a different email or delete the existing user.');
    }
    process.exit(1);
  } else {
    console.log('\n✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Save these credentials!');
    console.log('⚠️  Change the password after first login!');
    console.log('\nUser ID:', data[0].id);
  }
}

createAdmin();

