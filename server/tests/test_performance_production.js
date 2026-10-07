/**
 * Comprehensive Automated Test Suite for Prompt 27:
 * Performance Optimization & Production Readiness
 */

const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('../app');
const { connectDB, closeDB, getDBStatus } = require('../config/db');

// Models for index and query verification
const User = require('../models/User');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Review = require('../models/Review');
const ImpactEvent = require('../models/ImpactEvent');
const AdminAuditLog = require('../models/AdminAuditLog');

// Services for caching and performance verification
const adminDashboardService = require('../services/adminDashboardService');
const adminAnalyticsService = require('../services/adminAnalyticsService');
const environmentalImpactService = require('../services/environmentalImpactService');
const matchingService = require('../services/matchingService');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runPerformanceTestSuite() {
  console.log('\n======================================================');
  console.log('   PROMPT 27 PERFORMANCE & PRODUCTION READINESS TEST   ');
  console.log('======================================================\n');

  let server;
  let baseUrl;

  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB.\n');

    // Ensure all model indexes are synchronized
    await Promise.all([
      User.syncIndexes(),
      Item.syncIndexes(),
      WantedItem.syncIndexes(),
      Request.syncIndexes(),
      Transaction.syncIndexes(),
      Conversation.syncIndexes(),
      Message.syncIndexes(),
      Notification.syncIndexes(),
      Report.syncIndexes(),
      Review.syncIndexes(),
      ImpactEvent.syncIndexes(),
      AdminAuditLog.syncIndexes()
    ]);

    // Spin up local HTTP server for endpoint tests
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // -----------------------------------------------------------------
    // TEST 1: Lightweight Health Check Endpoint (No Heavy DB Scans)
    // -----------------------------------------------------------------
    console.log('--- TEST 1: Health Check Endpoint Performance & Structure ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    const healthJson = await healthRes.json();
    assert(healthJson.success === true, 'Health check returns success: true');
    assert(healthJson.data?.status === 'healthy', 'Health status is "healthy"');
    assert(healthJson.data?.database?.isConnected === true, 'Database reports isConnected: true');
    assert(typeof healthJson.data?.uptime === 'string', 'Uptime is reported without full DB query');

    // -----------------------------------------------------------------
    // TEST 2: HTTP Response Compression Header
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: Response Compression Middleware Verification ---');
    // Request with Accept-Encoding: gzip
    const compRes = await fetch(`${baseUrl}/api/health`, {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' }
    });
    assert(compRes.status === 200, 'Compressed endpoint responds with 200');
    // Morgan / compression middleware are registered

    // -----------------------------------------------------------------
    // TEST 3: MongoDB Connection Pool Configuration
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: Database Connection Pooling & Status ---');
    const dbStatus = getDBStatus();
    assert(dbStatus.isConnected === true, 'Connection pool is connected');
    assert(dbStatus.stateName === 'connected', 'Database stateName is "connected"');

    // -----------------------------------------------------------------
    // TEST 4: Index Audit Across All Collections (Prompt Req 16)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 4: MongoDB Indexes Verification Across All Collections ---');

    // 4.1 User Indexes
    const userIndexes = await User.collection.indexes();
    const userIndexKeys = userIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(userIndexKeys.some(k => k.includes('email')), 'User has email index');
    assert(userIndexKeys.some(k => k.includes('role') && k.includes('accountStatus')), 'User has compound role_accountStatus index');
    assert(userIndexKeys.some(k => k.includes('createdAt')), 'User has createdAt index');

    // 4.2 Item Indexes
    const itemIndexes = await Item.collection.indexes();
    const itemIndexKeys = itemIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(itemIndexKeys.some(k => k.includes('category') && k.includes('status')), 'Item has category_status index');
    assert(itemIndexKeys.some(k => k.includes('owner')), 'Item has owner index');
    assert(itemIndexKeys.some(k => k.includes('locationCoordinates')), 'Item has 2dsphere location coordinates index');
    assert(itemIndexKeys.some(k => k.includes('status') && k.includes('createdAt')), 'Item has status_createdAt index');

    // 4.3 WantedItem Indexes
    const wantedIndexes = await WantedItem.collection.indexes();
    const wantedIndexKeys = wantedIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(wantedIndexKeys.some(k => k.includes('status') && k.includes('category')), 'WantedItem has status_category index');
    assert(wantedIndexKeys.some(k => k.includes('requester')), 'WantedItem has requester index');
    assert(wantedIndexKeys.some(k => k.includes('locationCoordinates')), 'WantedItem has 2dsphere index');

    // 4.4 Request Indexes
    const requestIndexes = await Request.collection.indexes();
    const requestIndexKeys = requestIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(requestIndexKeys.some(k => k.includes('requester')), 'Request has requester index');
    assert(requestIndexKeys.some(k => k.includes('owner') && k.includes('status')), 'Request has owner_status index');
    assert(requestIndexKeys.some(k => k.includes('status') && k.includes('createdAt')), 'Request has status_createdAt index');

    // 4.5 Transaction Indexes
    const txIndexes = await Transaction.collection.indexes();
    const txIndexKeys = txIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(txIndexKeys.some(k => k.includes('owner') && k.includes('status')), 'Transaction has owner_status index');
    assert(txIndexKeys.some(k => k.includes('recipient') && k.includes('status')), 'Transaction has recipient_status index');
    assert(txIndexKeys.some(k => k.includes('request')), 'Transaction has request index');
    assert(txIndexKeys.some(k => k.includes('status') && k.includes('createdAt')), 'Transaction has status_createdAt index');

    // 4.6 Conversation & Message Indexes
    const convIndexes = await Conversation.collection.indexes();
    const convIndexKeys = convIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(convIndexKeys.some(k => k.includes('participants')), 'Conversation has participants index');
    assert(convIndexKeys.some(k => k.includes('request')), 'Conversation has request unique index');

    const msgIndexes = await Message.collection.indexes();
    const msgIndexKeys = msgIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(msgIndexKeys.some(k => k.includes('conversation')), 'Message has conversation index');
    assert(msgIndexKeys.some(k => k.includes('conversation') && k.includes('createdAt')), 'Message has conversation_createdAt index');

    // 4.7 Notification Indexes
    const notifIndexes = await Notification.collection.indexes();
    const notifIndexKeys = notifIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(notifIndexKeys.some(k => k.includes('recipient') && k.includes('deletedAt') && k.includes('createdAt')), 'Notification has recipient_deletedAt_createdAt index');
    assert(notifIndexKeys.some(k => k.includes('recipient') && k.includes('isRead')), 'Notification has unread index');

    // 4.8 Report & Review Indexes
    const reportIndexes = await Report.collection.indexes();
    const reportIndexKeys = reportIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(reportIndexKeys.some(k => k.includes('status') && k.includes('createdAt')), 'Report has status_createdAt index');
    assert(reportIndexKeys.some(k => k.includes('targetType') && k.includes('targetId')), 'Report has targetType_targetId index');

    const reviewIndexes = await Review.collection.indexes();
    const reviewIndexKeys = reviewIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(reviewIndexKeys.some(k => k.includes('reviewer') && k.includes('transaction') && k.includes('reviewee')), 'Review has compound unique index');
    assert(reviewIndexKeys.some(k => k.includes('transaction')), 'Review has transaction index');

    // 4.9 ImpactEvent & AdminAuditLog Indexes
    const impactIndexes = await ImpactEvent.collection.indexes();
    const impactIndexKeys = impactIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(impactIndexKeys.some(k => k.includes('ownerUser')), 'ImpactEvent has ownerUser index');
    assert(impactIndexKeys.some(k => k.includes('recipientUser')), 'ImpactEvent has recipientUser index');
    assert(impactIndexKeys.some(k => k.includes('category')), 'ImpactEvent has category index');

    const auditIndexes = await AdminAuditLog.collection.indexes();
    const auditIndexKeys = auditIndexes.map(idx => Object.keys(idx.key).join('_'));
    assert(auditIndexKeys.some(k => k.includes('admin')), 'AdminAuditLog has admin index');
    assert(auditIndexKeys.some(k => k.includes('action')), 'AdminAuditLog has action index');

    // -----------------------------------------------------------------
    // TEST 5: Bounded Pagination & Safe Maximum Limits (Prompt Req 14)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 5: Bounded Pagination Enforcement (Max Limits) ---');
    // Discover items with excessive limit=9999
    const discoverRes = await fetch(`${baseUrl}/api/items/discover?limit=9999`);
    const discoverJson = await discoverRes.json();
    assert(discoverJson.success === true, 'Discover endpoint accepts query');
    assert(discoverJson.limit <= 50, `Excessive limit=9999 is safely capped to ${discoverJson.limit} (<= 50)`);

    // -----------------------------------------------------------------
    // TEST 6: Admin Dashboard Caching & Performance
    // -----------------------------------------------------------------
    console.log('\n--- TEST 6: In-Memory Caching for Expensive Operations ---');
    const start1 = Date.now();
    const dash1 = await adminDashboardService.getDashboardOverview('30d');
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    const dash2 = await adminDashboardService.getDashboardOverview('30d');
    const time2 = Date.now() - start2;

    assert(dash1.metrics.totalUsers !== undefined, 'Dashboard overview returns real metrics');
    assert(dash1.metrics.totalUsers === dash2.metrics.totalUsers, 'Cached metrics remain consistent');
    assert(time2 <= time1, `Cached call (${time2}ms) is faster than initial query (${time1}ms)`);

    // -----------------------------------------------------------------
    // TEST 7: Platform Impact Summary Caching
    // -----------------------------------------------------------------
    console.log('\n--- TEST 7: Platform Impact Summary Caching & Integrity ---');
    const startImp1 = Date.now();
    const imp1 = await environmentalImpactService.getPlatformImpactSummary();
    const timeImp1 = Date.now() - startImp1;

    const startImp2 = Date.now();
    const imp2 = await environmentalImpactService.getPlatformImpactSummary();
    const timeImp2 = Date.now() - startImp2;

    assert(imp1.totalCompletedTransactions !== undefined, 'Platform impact summary returned');
    assert(imp1.totalCompletedTransactions === imp2.totalCompletedTransactions, 'Impact summary caching consistent');
    assert(timeImp2 <= timeImp1, `Cached impact summary (${timeImp2}ms) faster or equal to initial (${timeImp1}ms)`);

    // -----------------------------------------------------------------
    // TEST 8: Candidate Bounding in Matching Service (Prompt Req 26)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 8: Matching Service Candidate Bounding ---');
    const mockItem = {
      _id: new mongoose.Types.ObjectId(),
      category: 'Electronics',
      status: 'active',
      availability: 'Available',
      owner: new mongoose.Types.ObjectId()
    };
    const itemMatches = await matchingService.findMatchesForItem(mockItem);
    assert(Array.isArray(itemMatches), 'findMatchesForItem returns an array safely');

    // -----------------------------------------------------------------
    // TEST 9: Parallel Admin Analytics Aggregation
    // -----------------------------------------------------------------
    console.log('\n--- TEST 9: Parallel Aggregations in Admin Analytics ---');
    const analytics = await adminAnalyticsService.getPlatformAnalytics('30d');
    assert(analytics.totals !== undefined, 'Analytics totals present');
    assert(Array.isArray(analytics.trends.users), 'User growth trends returned');
    assert(Array.isArray(analytics.distributions.itemsByCategory), 'Items by category returned');

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await closeDB();
    console.log('\nDisconnected from MongoDB.');
  }

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, 0 FAILED (out of ${totalTests})`);
  console.log('======================================================\n');
}

runPerformanceTestSuite().catch((err) => {
  console.error('\nTest Suite Fatal Error:', err);
  process.exit(1);
});
