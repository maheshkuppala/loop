const { connectPostgres, query: pgQuery } = require('../config/postgres');
const adminDashboardService = require('../services/adminDashboardService');

async function testFullVerification() {
  console.log('--- Comprehensive Neon PG & Admin Integration Verification ---');

  try {
    await connectPostgres();

    // 1. Check database counts directly from Neon PostgreSQL
    const usersCount = await pgQuery('SELECT COUNT(*)::int as count FROM users;');
    const itemsCount = await pgQuery('SELECT COUNT(*)::int as count FROM items;');
    const wantedCount = await pgQuery('SELECT COUNT(*)::int as count FROM wanted_items;');

    console.log('Direct PostgreSQL Table Counts:');
    console.log(`  - Users: ${usersCount.rows[0].count}`);
    console.log(`  - Items: ${itemsCount.rows[0].count}`);
    console.log(`  - Wanted Items: ${wantedCount.rows[0].count}`);

    // 2. Clear cache and test Admin Dashboard Service
    adminDashboardService.invalidateDashboardCache();
    const overview = await adminDashboardService.getDashboardOverview('30d');

    console.log('\nAdmin Dashboard Service Output:');
    console.log(JSON.stringify(overview.metrics, null, 2));

    if (overview.metrics.totalUsers > 0 && overview.metrics.totalItems > 0) {
      console.log('\n✔ VERIFIED: Real non-zero metrics successfully aggregated from Neon PostgreSQL database!');
    } else {
      console.warn('\n⚠ WARNING: Metrics contain 0 values.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  }
}

testFullVerification();
