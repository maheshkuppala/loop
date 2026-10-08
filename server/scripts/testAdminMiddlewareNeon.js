require('dotenv').config();
const jwt = require('jsonwebtoken');
const { connectPostgres } = require('../config/postgres');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const { getJwtSecret } = require('../utils/jwtConfig');

async function testAdmin() {
  console.log('--- Testing Neon Admin Authorization & Dashboard Stats ---');

  const pool = await connectPostgres();
  if (!pool) {
    console.error('Failed to connect to Neon PostgreSQL!');
    process.exit(1);
  }

  // Generate valid JWT token for Neon Admin `usr-admin-01`
  const token = jwt.sign({ id: 'usr-admin-01', role: 'admin', email: 'maheshkuppala321@gmail.com' }, getJwtSecret(), { expiresIn: '7d' });

  const mockReq = {
    headers: {
      authorization: `Bearer ${token}`
    },
    query: { range: '30d' }
  };

  let dashboardData = null;
  const mockRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      dashboardData = data;
      return this;
    }
  };

  // Run adminMiddleware authorization
  await new Promise((resolve) => {
    adminMiddleware(mockReq, mockRes, () => {
      console.log('✔ VERIFIED: adminMiddleware successfully authorized Neon Admin!');
      console.log('  Admin User ID:', mockReq.admin?.id);
      console.log('  Admin User Role:', mockReq.admin?.role);
      resolve();
    });
  });

  // Call adminController.getDashboard
  await adminController.getDashboard(mockReq, mockRes);

  console.log('\n--- Admin Dashboard API Response ---');
  console.log('Status Code:', mockRes.statusCode);
  console.log('Success:', dashboardData?.success);
  console.log('Metrics:', JSON.stringify(dashboardData?.data?.metrics, null, 2));

  if (dashboardData?.success && dashboardData?.data?.metrics?.totalUsers > 0) {
    console.log('\n✔ SUCCESS: Admin Dashboard correctly returns real non-zero Neon metrics!');
    process.exit(0);
  } else {
    console.error('FAILED: Dashboard data was empty or 0');
    process.exit(1);
  }
}

testAdmin().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
