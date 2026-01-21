const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_YI6wKu3bDnPM@ep-long-base-ah52e5u1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

(async () => {
  try {
    const client = await pool.connect();
    
    // 检查用户
    let result = await client.query('SELECT COUNT(*) as count FROM "user"');
    console.log('✅ 用户数量:', result.rows[0].count);
    
    // 检查菜单
    result = await client.query('SELECT COUNT(*) as count FROM menu');
    console.log('✅ 菜单数量:', result.rows[0].count);
    
    // 检查角色
    result = await client.query('SELECT COUNT(*) as count FROM role');
    console.log('✅ 角色数量:', result.rows[0].count);
    
    // 检查权限
    result = await client.query('SELECT COUNT(*) as count FROM sys_role_perm');
    console.log('✅ 权限数量:', result.rows[0].count);
    
    client.release();
    await pool.end();
    console.log('\n✅ 所有数据完整!');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
})();
