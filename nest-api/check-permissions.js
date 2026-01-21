const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function checkPermissions() {
  try {
    const client = await pool.connect();
    
    // 查询 admin 用户的角色
    console.log('=== Admin user roles ===');
    let result = await client.query(`
      SELECT ur.id, ur.role_id, r.role_name 
      FROM sys_user_role ur
      JOIN role r ON ur.role_id = r.id
      WHERE ur.user_id = 1
    `);
    console.log(result.rows);
    
    // 查询角色1的所有权限
    console.log('\n=== Role 1 (超级管理员) permissions (first 20) ===');
    result = await client.query(`
      SELECT perm_code FROM sys_role_perm WHERE role_id = 1 LIMIT 20
    `);
    console.log(result.rows.map(r => r.perm_code));
    
    // 查询是否有 default:system:account 权限
    console.log('\n=== Search for default:system:account ===');
    result = await client.query(`
      SELECT * FROM sys_role_perm WHERE perm_code = 'default:system:account'
    `);
    console.log(`Found: ${result.rows.length} record(s)`);
    if (result.rows.length > 0) {
      console.log(result.rows);
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPermissions();
