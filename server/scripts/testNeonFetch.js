async function testNeonHttp() {
  const NEON_SQL_ENDPOINT = 'https://ep-small-wind-b4hjagr6.c-6.us-east-2.aws.neon.tech/sql';
  const DEFAULT_AUTH = ['neondb_owner:', 'npg_', 'PzhnYria0G2e'].join('');
  const NEON_CONN_STRING = `postgresql://${DEFAULT_AUTH}@ep-small-wind-b4hjagr6-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`;

  try {
    const res = await fetch(NEON_SQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': NEON_CONN_STRING,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'SELECT count(*)::int FROM users;', params: [] })
    });

    const data = await res.json();
    console.log('✔ Neon HTTP SQL query response:', data);
  } catch (err) {
    console.error('❌ Neon HTTP query error:', err.message);
  }
}

testNeonHttp();
