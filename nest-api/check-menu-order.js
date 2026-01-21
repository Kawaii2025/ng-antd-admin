const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function checkMenuOrder() {
  try {
    const client = await pool.connect();
    
    // 查询菜单表结构
    console.log('=== Menu table columns ===');
    let result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'menu' 
      ORDER BY ordinal_position
    `);
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // 查询前10条菜单，看看排序
    console.log('\n=== First 10 menus (ordered by id) ===');
    result = await client.query(`
      SELECT id, name, code, sort_order 
      FROM menu 
      ORDER BY id 
      LIMIT 10
    `);
    console.table(result.rows);
    
    // 查询是否有 sort_order 字段
    console.log('\n=== First 10 menus (ordered by sort_order) ===');
    result = await client.query(`
      SELECT id, name, code, sort_order 
      FROM menu 
      ORDER BY sort_order, id 
      LIMIT 10
    `);
    console.table(result.rows);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMenuOrder();
