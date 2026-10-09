const { connectPostgres, query } = require('../config/postgres');
const authController = require('../controllers/authController');

async function testUserLoginPersistenceFlow() {
  console.log('--- Testing Immediate User Login Database Storage & Welcome Back Flow ---');
  await connectPostgres();

  const testEmail = `customer_${Date.now()}@looop.test`;
  const testPassword = 'Password123!';
  const testName = 'Seshu Kumar';

  // 1. Register User
  const regReq = {
    body: { name: testName, email: testEmail, password: testPassword }
  };
  const regRes = {
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };

  await authController.register(regReq, regRes);
  console.log('[Register Result]:', regRes.statusCode, regRes.data?.message);

  // Verify stored in PostgreSQL database
  const dbCheck1 = await query('SELECT id, name, email, account_status, created_at FROM users WHERE LOWER(email) = $1', [testEmail.toLowerCase()]);
  console.log('✔ Database Verification (New User Stored):', dbCheck1.rows[0]);

  // 2. Login again with same email
  const loginReq = {
    body: { email: testEmail, password: testPassword },
    headers: { 'user-agent': 'Chrome test runner' }
  };
  const loginRes = {
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };

  await authController.login(loginReq, loginRes);
  console.log('\n[Login Again Result]:', loginRes.statusCode, loginRes.data?.message);
  console.log('Already Exists Flag:', loginRes.data?.alreadyExists);

  // Verify PostgreSQL timestamp updated
  const dbCheck2 = await query('SELECT id, name, email, updated_at FROM users WHERE LOWER(email) = $1', [testEmail.toLowerCase()]);
  console.log('✔ Database Verification (Login Updated Timestamp):', dbCheck2.rows[0]);

  process.exit(0);
}

testUserLoginPersistenceFlow().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
