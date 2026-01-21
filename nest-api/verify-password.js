const argon2 = require('argon2');
const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function testPasswordVerify() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to database\n');
    
    // 获取 admin 的密码哈希
    const result = await client.query('SELECT id, user_name, password FROM "user" WHERE user_name = $1', ['admin']);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found');
      client.release();
      await pool.end();
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('Admin user found:');
    console.log(`  ID: ${adminUser.id}`);
    console.log(`  Username: ${adminUser.user_name}`);
    console.log(`  Password hash: ${adminUser.password.substring(0, 50)}...`);
    
    // 测试密码验证
    const testPassword = 'admin123';
    console.log(`\nTesting password: "${testPassword}"`);
    
    const isValid = await argon2.verify(adminUser.password, testPassword);
    console.log(`Verification result: ${isValid ? '✓ Valid' : '❌ Invalid'}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testPasswordVerify();
