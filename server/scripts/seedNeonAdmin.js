require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { connectPostgres, query } = require('../config/postgres');

async function seed() {
  console.log('Connecting to PostgreSQL...');
  await connectPostgres();

  const accounts = [
    {
      id: 'usr-admin-01',
      name: 'Mahesh Naidu',
      email: 'maheshkuppala321@gmail.com',
      password: 'Mahesh@1',
      role: 'admin',
      bio: 'Looop Super Administrator',
      city: 'Guntur',
      state: 'Andhra Pradesh'
    },
    {
      id: 'usr-admin-02',
      name: 'Looop Administrator',
      email: 'admin@looop.community',
      password: 'AdminPassword123!',
      role: 'admin',
      bio: 'Platform Governance and Moderation Lead',
      city: 'Guntur',
      state: 'Andhra Pradesh'
    }
  ];

  for (const acc of accounts) {
    const existing = await query('SELECT id, email FROM users WHERE email = $1', [acc.email]);
    const hash = await bcrypt.hash(acc.password, 10);

    if (existing.rows.length > 0) {
      await query(
        'UPDATE users SET password = $1, role = $2, name = $3, account_status = $4, verified = $5 WHERE email = $6',
        [hash, acc.role, acc.name, 'active', true, acc.email]
      );
      console.log(`Updated existing user: ${acc.email} with role ${acc.role}`);
    } else {
      await query(
        `INSERT INTO users (id, name, email, password, role, bio, city, state, account_status, verified, trust_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', true, 100)`,
        [acc.id, acc.name, acc.email, hash, acc.role, acc.bio, acc.city, acc.state]
      );
      console.log(`Inserted new admin user: ${acc.email}`);
    }
  }

  const check = await query('SELECT id, name, email, role FROM users');
  console.log('All Users in Neon PostgreSQL:', check.rows);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
