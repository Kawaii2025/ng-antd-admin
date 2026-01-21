const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function checkUsers() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to database');
    
    // 查询所有用户
    const result = await client.query('SELECT id, user_name, email FROM "user"');
    console.log('✓ Users in database:');
    console.log(result.rows);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
