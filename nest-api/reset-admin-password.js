const argon2 = require('argon2');
const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function updateAdminPassword() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to database');
    
    // 为新密码生成 argon2 hash
    const newPassword = 'admin123';
    const hashedPassword = await argon2.hash(newPassword);
    console.log(`✓ Generated hash for password "admin123": ${hashedPassword}`);
    
    // 更新 admin 用户的密码
    await client.query(
      'UPDATE "user" SET password = $1 WHERE user_name = $2',
      [hashedPassword, 'admin']
    );
    console.log('✓ Admin password updated successfully');
    console.log(`✓ You can now login with: user_name="admin", password="admin123"`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();
