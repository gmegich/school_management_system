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

async function deleteUser() {
  // Email of the user to delete
  const emailToDelete = 'parent1@example.com';

  console.log(`Attempting to delete user: ${emailToDelete}...\n`);

  try {
    // First, find the user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', emailToDelete)
      .single();

    if (findError || !user) {
      console.log(`❌ User with email ${emailToDelete} not found.`);
      return;
    }

    console.log('Found user:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('');

    // Check if user has associated students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('parent_id', user.id);

    if (students && students.length > 0) {
      console.log(`⚠️  Warning: This user has ${students.length} associated student(s):`);
      students.forEach(student => {
        console.log(`   - ${student.name} (ID: ${student.id})`);
      });
      console.log('');
      console.log('Note: Deleting the parent will also delete all associated students due to CASCADE.');
      console.log('');
    }

    // Delete the user (students will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError.message);
    } else {
      console.log('✅ User deleted successfully!');
      if (students && students.length > 0) {
        console.log(`   (Also deleted ${students.length} associated student(s))`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteUser();

