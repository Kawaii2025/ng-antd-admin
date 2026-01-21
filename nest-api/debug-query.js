const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./src/drizzle/schema');
const { eq } = require('drizzle-orm');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function testQuery() {
  try {
    // 使用 Drizzle，配置和生产环境一样
    const db = drizzle({
      client: pool,
      schema,
      casing: 'snake_case',
      logger: true,
    });
    
    console.log('\n=== Test 1: Query with Drizzle ===');
    const result = await db
      .select({
        id: schema.userTable.id,
        userName: schema.userTable.userName,
        password: schema.userTable.password,
      })
      .from(schema.userTable)
      .where(eq(schema.userTable.userName, 'admin'));
    
    console.log('Result:', result);
    
    // 也用原生SQL测试
    console.log('\n=== Test 2: Raw SQL query ===');
    const client = await pool.connect();
    const rawResult = await client.query('SELECT id, user_name, password FROM "user" WHERE user_name = $1', ['admin']);
    console.log('Raw Result:', rawResult.rows);
    client.release();
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testQuery();
