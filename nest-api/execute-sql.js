const fs = require('fs');
const { Pool } = require('pg');

const connectionString = 'postgresql://***REMOVED***@***REMOVED***-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

async function executeSql() {
  try {
    const sqlContent = fs.readFileSync('./ng-antd-admin-db.sql', 'utf-8');
    
    const client = await pool.connect();
    console.log('✓ Connected to Neon database');
    
    await client.query(sqlContent);
    console.log('✓ SQL file executed successfully');
    
    client.release();
    await pool.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Error executing SQL:', error.message);
    process.exit(1);
  }
}

executeSql();
