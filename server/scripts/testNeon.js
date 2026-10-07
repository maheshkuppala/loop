require('dotenv').config();
const { connectPostgres, query, getPostgresStatus } = require('../config/postgres');

async function test() {
  console.log('Testing connection to Neon PostgreSQL...');
  const pool = await connectPostgres();
  if (!pool) {
    console.error('Connection failed!');
    process.exit(1);
  }

  const status = getPostgresStatus();
  console.log('Neon Status:', JSON.stringify(status, null, 2));

  const res = await query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
  console.log(`\nVerified ${res.rows.length} tables in Neon PostgreSQL:`);
  res.rows.forEach(r => console.log('  ✔ ' + r.tablename));

  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
