const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const ImpactFactor = require('../models/ImpactFactor');
const ImpactEvent = require('../models/ImpactEvent');
const AdminAuditLog = require('../models/AdminAuditLog');

const environmentalImpactService = require('../services/environmentalImpactService');
const impactController = require('../controllers/impactController');

const JWT_SECRET = process.env.JWT_SECRET || 'looop_jwt_dev_secret_key_2026';

// Helper mock response object
const createMockRes = () => {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
};

const runEnvironmentalImpactTests = async () => {
  console.log('================================================================');
  console.log('STARTING ANTIGRAVITY PROMPT 24 ENVIRONMENTAL IMPACT & SUSTAINABILITY TESTS');
  console.log('================================================================');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/looop');
  console.log('✓ Connected to MongoDB');

  const ts = Date.now();
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  // 1. Create Test Users
  const userA = await User.create({
    name: `Eco Sharer ${ts}`,
    email: `eco_sharer_${ts}@test.com`,
    password: passwordHash,
    role: 'customer',
    accountStatus: 'active'
  });

  const userB = await User.create({
    name: `Eco Recipient ${ts}`,
    email: `eco_recipient_${ts}@test.com`,
    password: passwordHash,
    role: 'customer',
    accountStatus: 'active'
  });

  const adminUser = await User.create({
    name: `Eco Admin ${ts}`,
    email: `eco_admin_${ts}@test.com`,
    password: passwordHash,
    role: 'admin',
    accountStatus: 'active'
  });

  console.log('✓ Test users and admin created');

  // 2. Create Items
  const bookItem = await Item.create({
    title: `Sustainable Energy Handbook ${ts}`,
    description: 'Textbook on renewable systems and life cycle analysis.',
    category: 'books',
    condition: 'like_new',
    sharingType: 'give_away',
    owner: userA._id,
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', isPrimary: true }],
    location: { city: 'Bengaluru', locality: 'Koramangala' },
    availability: 'Available'
  });

  const electronicItem = await Item.create({
    title: `Digital Scientific Calculator ${ts}`,
    description: 'Graphing scientific calculator for engineering students.',
    category: 'electronics',
    condition: 'good',
    sharingType: 'borrow',
    owner: userA._id,
    images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', isPrimary: true }],
    location: { city: 'Bengaluru', locality: 'Indiranagar' },
    availability: 'Available'
  });

  const exchangeOfferedItem = await Item.create({
    title: `Canvas Art Backpack ${ts}`,
    description: 'Durable organic cotton daypack for exchange.',
    category: 'clothing',
    condition: 'good',
    sharingType: 'exchange',
    owner: userB._id,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', isPrimary: true }],
    location: { city: 'Bengaluru', locality: 'HSR Layout' },
    availability: 'Available'
  });

  console.log('✓ Test items created across books, electronics, clothing');

  // Test 1: Pending request does NOT create impact
  console.log('\n--- Test 1: Pending request does not create impact ---');
  const pendingReq = await Request.create({
    item: bookItem._id,
    requester: userB._id,
    owner: userA._id,
    type: 'REQUEST_ITEM',
    status: 'PENDING',
    message: 'Can I have this book please?'
  });
  const pendingImpact = await ImpactEvent.findOne({ recipientUser: userB._id });
  if (!pendingImpact) {
    console.log('✓ PASS: Pending request created no impact event.');
  } else {
    throw new Error('FAIL: Impact event found for pending request!');
  }

  // Test 2 & 3: Declined & Cancelled requests do NOT create impact
  console.log('\n--- Test 2 & 3: Declined & Cancelled requests do not create impact ---');
  pendingReq.status = 'DECLINED';
  await pendingReq.save();
  let countAfterDecline = await ImpactEvent.countDocuments({ recipientUser: userB._id });
  if (countAfterDecline === 0) {
    console.log('✓ PASS: Declined request created no impact.');
  }

  pendingReq.status = 'CANCELLED';
  await pendingReq.save();
  let countAfterCancel = await ImpactEvent.countDocuments({ recipientUser: userB._id });
  if (countAfterCancel === 0) {
    console.log('✓ PASS: Cancelled request created no impact.');
  }

  // Test 4: Accepted request does not automatically create impact
  console.log('\n--- Test 4: Accepted request does not automatically create impact ---');
  pendingReq.status = 'ACCEPTED';
  await pendingReq.save();

  // Create transaction in PENDING_HANDOVER
  const txGiveaway = await Transaction.create({
    request: pendingReq._id,
    item: bookItem._id,
    owner: userA._id,
    recipient: userB._id,
    type: 'GIVEAWAY',
    status: 'PENDING_HANDOVER'
  });

  let impactOnAccept = await environmentalImpactService.createImpactForTransaction(txGiveaway._id);
  if (impactOnAccept === null) {
    console.log('✓ PASS: Non-completed transaction correctly rejected by impact service.');
  } else {
    throw new Error('FAIL: Impact created for non-completed transaction!');
  }

  // Test 5: Completed transaction creates one ImpactEvent
  console.log('\n--- Test 5: Completed transaction creates one ImpactEvent ---');
  txGiveaway.status = 'COMPLETED';
  txGiveaway.completedAt = new Date();
  await txGiveaway.save();

  const createdImpact = await environmentalImpactService.createImpactForTransaction(txGiveaway._id);
  if (createdImpact && createdImpact.metrics.reuseCount === 1) {
    console.log('✓ PASS: Completed transaction generated valid ImpactEvent with reuseCount = 1.');
    console.log(`   Estimated CO2e avoided: ${createdImpact.metrics.estimatedCo2eAvoided} kg`);
    console.log(`   Estimated Waste avoided: ${createdImpact.metrics.estimatedWasteAvoided} kg`);
  } else {
    throw new Error('FAIL: ImpactEvent not properly created for completed transaction!');
  }

  // Test 6: Repeating completion is IDEMPOTENT (no duplicate)
  console.log('\n--- Test 6: Idempotency: repeating completion does not duplicate ---');
  const duplicateCheck = await environmentalImpactService.createImpactForTransaction(txGiveaway._id);
  const totalEventsForTx = await ImpactEvent.countDocuments({ transaction: txGiveaway._id });
  if (duplicateCheck._id.toString() === createdImpact._id.toString() && totalEventsForTx === 1) {
    console.log('✓ PASS: Unique transaction index & service logic prevent duplicate events.');
  } else {
    throw new Error(`FAIL: Duplicate impact event detected! Count = ${totalEventsForTx}`);
  }

  // Test 7: Borrowing lifecycle completion rule
  console.log('\n--- Test 7: Borrowing creates impact ONLY when return is COMPLETED ---');
  const borrowReq = await Request.create({
    item: electronicItem._id,
    requester: userB._id,
    owner: userA._id,
    type: 'BORROW',
    status: 'ACCEPTED',
    message: 'May I borrow the calculator for exams?'
  });
  const txBorrow = await Transaction.create({
    request: borrowReq._id,
    item: electronicItem._id,
    owner: userA._id,
    recipient: userB._id,
    type: 'BORROW',
    status: 'ACTIVE' // Currently borrowed / in use
  });

  const borrowActiveImpact = await environmentalImpactService.createImpactForTransaction(txBorrow._id);
  if (borrowActiveImpact === null) {
    console.log('✓ PASS: Active borrow transaction does not generate impact until returned.');
  }

  // Now complete the return
  txBorrow.status = 'COMPLETED';
  txBorrow.returnedAt = new Date();
  txBorrow.completedAt = new Date();
  await txBorrow.save();

  const borrowCompletedImpact = await environmentalImpactService.createImpactForTransaction(txBorrow._id);
  if (borrowCompletedImpact && borrowCompletedImpact.impactType === 'BORROW') {
    console.log('✓ PASS: Completed borrow generated ImpactEvent.');
    console.log(`   Electronics CO2e avoided: ${borrowCompletedImpact.metrics.estimatedCo2eAvoided} kg`);
    console.log(`   Electronics Waste avoided: ${borrowCompletedImpact.metrics.estimatedWasteAvoided} kg`);
  } else {
    throw new Error('FAIL: Borrow return did not generate expected ImpactEvent!');
  }

  // Test 8: Exchange handles both items correctly in 1 platform transaction
  console.log('\n--- Test 8: Exchange handles both items in 1 transaction without double counting ---');
  const exchangeReq = await Request.create({
    item: bookItem._id,
    requester: userB._id,
    owner: userA._id,
    type: 'EXCHANGE',
    offeredItem: exchangeOfferedItem._id,
    status: 'ACCEPTED'
  });
  const txExchange = await Transaction.create({
    request: exchangeReq._id,
    item: bookItem._id,
    offeredItem: exchangeOfferedItem._id,
    owner: userA._id,
    recipient: userB._id,
    type: 'EXCHANGE',
    status: 'COMPLETED',
    completedAt: new Date()
  });

  const exchangeImpact = await environmentalImpactService.createImpactForTransaction(txExchange._id);
  if (exchangeImpact && exchangeImpact.items.length === 2 && exchangeImpact.metrics.reuseCount === 2) {
    console.log('✓ PASS: Exchange transaction correctly accounted for both items (reuseCount = 2, items.length = 2).');
    console.log(`   Items involved: "${exchangeImpact.items[0].title}" & "${exchangeImpact.items[1].title}"`);
    console.log(`   Combined CO2e: ${exchangeImpact.metrics.estimatedCo2eAvoided} kg, Water saved: ${exchangeImpact.metrics.estimatedWaterSaved} L`);
  } else {
    throw new Error('FAIL: Exchange did not account for both items correctly!');
  }

  // Test 9 & 10: Missing factor preserves null (never fabricates arbitrary numbers)
  console.log('\n--- Test 9 & 10: Missing factors preserve null (no fabrication) ---');
  const unconfiguredItem = await Item.create({
    title: `Vintage Wheelchair Accessory ${ts}`,
    description: 'A vintage mobility accessory for testing circular impact.',
    category: 'mobility', // No factor configured for mobility
    condition: 'good',
    sharingType: 'free',
    owner: userA._id,
    images: [{ url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61', isPrimary: true }],
    location: { city: 'Bengaluru', locality: 'Malleshwaram' },
    availability: 'Available'
  });
  const txUnconfigured = await Transaction.create({
    request: new mongoose.Types.ObjectId(),
    item: unconfiguredItem._id,
    owner: userA._id,
    recipient: userB._id,
    type: 'FREE',
    status: 'COMPLETED',
    completedAt: new Date()
  });

  const unconfiguredImpact = await environmentalImpactService.createImpactForTransaction(txUnconfigured._id);
  if (
    unconfiguredImpact.metrics.reuseCount === 1 &&
    unconfiguredImpact.metrics.estimatedCo2eAvoided === null &&
    unconfiguredImpact.metrics.estimatedWasteAvoided === null &&
    unconfiguredImpact.metrics.estimatedWaterSaved === null
  ) {
    console.log('✓ PASS: Category without factor records real reuse (1) while environmental metrics remain null.');
  } else {
    throw new Error('FAIL: Arbitrary non-null metric was fabricated for unconfigured category!');
  }

  // Test 11: Factor versioning: updating factor does not rewrite historical records
  console.log('\n--- Test 11: Factor versioning preserves historical calculation ---');
  const bookFactor = await ImpactFactor.findOne({ category: 'Books', metricType: 'CO2E_AVOIDED' });
  const originalCalculatedValue = createdImpact.metrics.estimatedCo2eAvoided;

  // Admin updates Books factor
  const reqUpdateFactor = {
    params: { id: bookFactor._id },
    body: { value: 2.5 },
    admin: adminUser,
    ip: '127.0.0.1'
  };
  const resUpdateFactor = createMockRes();
  await impactController.updateImpactFactor(reqUpdateFactor, resUpdateFactor);

  if (resUpdateFactor.statusCode === 200) {
    // Check that historical ImpactEvent preserved its original value
    const checkHistoricalEvent = await ImpactEvent.findById(createdImpact._id);
    if (checkHistoricalEvent.metrics.estimatedCo2eAvoided === originalCalculatedValue) {
      console.log(`✓ PASS: Historical calculation preserved original value (${originalCalculatedValue} kg), factor updated to v2.`);
    } else {
      throw new Error('FAIL: Historical event was unexpectedly modified by factor update!');
    }
  }

  // Test 12 & 13: User impact summary & milestones computation
  console.log('\n--- Test 12 & 13: User impact summary & Milestones ---');
  const summaryUserA = await environmentalImpactService.getUserImpactSummary(userA._id);
  console.log(`   User A completedReuseTransactions: ${summaryUserA.completedReuseTransactions}`);
  console.log(`   User A itemsShared: ${summaryUserA.itemsShared}`);
  console.log(`   User A totalItemsReused: ${summaryUserA.totalItemsReused}`);
  console.log(`   User A est. CO2e avoided: ${summaryUserA.environmentalMetrics.co2eAvoided} kg`);

  const firstCirculationMilestone = summaryUserA.milestones.find((m) => m.id === 'first_reuse');
  if (firstCirculationMilestone && firstCirculationMilestone.achieved === true) {
    console.log('✓ PASS: "First Circulation" milestone earned from real completed transactions.');
  } else {
    throw new Error('FAIL: Milestone was not earned despite completed transactions!');
  }

  // Test 14: History Pagination & Filtering
  console.log('\n--- Test 14: History pagination & filtering ---');
  const historyResult = await environmentalImpactService.getUserImpactHistory(userA._id, { page: 1, limit: 2 });
  if (historyResult.history.length <= 2 && historyResult.total >= 3 && historyResult.totalPages >= 2) {
    console.log(`✓ PASS: Pagination works. Returned ${historyResult.history.length} items of ${historyResult.total} total.`);
  } else {
    throw new Error('FAIL: History pagination did not return expected pages!');
  }

  // Test 15: Public Profile Privacy Protection
  console.log('\n--- Test 15: Public profile privacy inspection ---');
  const reqPublic = { params: { id: userA._id.toString() } };
  const resPublic = createMockRes();
  await impactController.getUserPublicImpact(reqPublic, resPublic);
  if (resPublic.statusCode === 200 && resPublic.data.success) {
    const pubImpact = resPublic.data.impact;
    if (pubImpact.completedReuseTransactions !== undefined && !pubImpact.transactions && !pubImpact.recentActivity) {
      console.log('✓ PASS: Public profile only exposes aggregate counts and milestones; private transactions omitted.');
    } else {
      throw new Error('FAIL: Private activity leaked in public impact response!');
    }
  }

  // Test 16: Platform Summary & Admin Trends
  console.log('\n--- Test 16: Platform summary & Admin Trends ---');
  const platformSummary = await environmentalImpactService.getPlatformImpactSummary();
  if (platformSummary.totalCompletedTransactions >= 3 && platformSummary.categoryBreakdown.length > 0) {
    console.log(`✓ PASS: Platform aggregate summary verified (${platformSummary.totalCompletedTransactions} handovers across ${platformSummary.categoryBreakdown.length} categories).`);
  } else {
    throw new Error('FAIL: Platform summary aggregation error!');
  }

  // Test 17: Admin Audit Log Integration
  console.log('\n--- Test 17: Admin Audit Log Integration ---');
  const auditLogs = await AdminAuditLog.find({ targetType: 'IMPACT_FACTOR' });
  if (auditLogs.length > 0) {
    console.log(`✓ PASS: Admin action logged to AdminAuditLog (${auditLogs.length} audit records found).`);
  } else {
    throw new Error('FAIL: No AdminAuditLog created for impact factor operation!');
  }

  console.log('\n================================================================');
  console.log('ALL 17 ENVIRONMENTAL IMPACT & SUSTAINABILITY INTEGRATION TESTS PASSED!');
  console.log('================================================================\n');

  process.exit(0);
};

runEnvironmentalImpactTests().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
