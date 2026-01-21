const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function testLogin() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to database\n');
    
    // Test 1: Check all users
    console.log('=== All users in database ===');
    let result = await client.query('SELECT id, user_name, email, available FROM "user"');
    console.log(result.rows);
    
    // Test 2: Query admin specifically
    console.log('\n=== Query for admin user ===');
    result = await client.query('SELECT id, user_name, password FROM "user" WHERE user_name = $1', ['admin']);
    console.log('Result:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!');
    } else {
      console.log('✓ Admin user found');
      // Test 3: Verify password hash
      const adminUser = result.rows[0];
      console.log(`Password hash: ${adminUser.password.substring(0, 50)}...`);
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
