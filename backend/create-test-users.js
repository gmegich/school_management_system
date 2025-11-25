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

async function createTestUsers() {
  // Test driver user
  const driverEmail = 'driver1@example.com';
  const driverPassword = 'driver123';  // Change this to your desired password
  const driverName = 'John Driver';

  console.log('Creating test users...\n');

  // Create driver user
  try {
    const driverHashedPassword = await bcrypt.hash(driverPassword, 10);
    const { data: driverData, error: driverError } = await supabase
      .from('users')
      .upsert({
        email: driverEmail,
        password: driverHashedPassword,
        role: 'driver',
        name: driverName,
      }, {
        onConflict: 'email'
      })
      .select();

    if (driverError) {
      console.error('❌ Error creating driver user:', driverError.message);
    } else {
      console.log('✅ Driver user created/updated successfully!');
      console.log('   Email:', driverEmail);
      console.log('   Password:', driverPassword);
      console.log('   Name:', driverName);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Driver:');
  console.log('  Email:    ', driverEmail);
  console.log('  Password: ', driverPassword);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  Save these credentials!');
}

createTestUsers();

