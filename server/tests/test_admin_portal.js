const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const Category = require('../models/Category');
const AdminSetting = require('../models/AdminSetting');
const AdminAuditLog = require('../models/AdminAuditLog');

const adminMiddleware = require('../middleware/adminMiddleware');
const authMiddleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');

const JWT_SECRET = process.env.JWT_SECRET || 'looop_jwt_dev_secret_key_2026';

// Helper mock response
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

const runAdminTests = async () => {
  console.log('=== STARTING PROMPT 22 ADMIN PORTAL INTEGRATION TESTS ===');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/looop');
  console.log('✓ Connected to MongoDB');

  // Setup Test Users
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  const customerUser = await User.create({
    name: `Customer Test ${timestamp}`,
    email: `customer_${timestamp}@test.com`,
    password: passwordHash,
    role: 'customer',
    accountStatus: 'active'
  });

  const adminUser = await User.create({
    name: `Admin Test ${timestamp}`,
    email: `admin_${timestamp}@test.com`,
    password: passwordHash,
    role: 'admin',
    accountStatus: 'active'
  });

  const customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // -------------------------------------------------------------
  // Test 1: Unauthenticated request to admin middleware -> 401
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Unauthenticated Request to Admin Route ---');
  const req1 = { headers: {} };
  const res1 = createMockRes();
  let nextCalled1 = false;
  await adminMiddleware(req1, res1, () => { nextCalled1 = true; });
  if (res1.statusCode === 401 && !nextCalled1) {
    console.log('✓ Test 1 Passed: Unauthenticated request rejected with 401');
  } else {
    throw new Error(`Test 1 Failed: Expected 401, got ${res1.statusCode}`);
  }

  // -------------------------------------------------------------
  // Test 2: Customer user attempting to access admin route -> 403
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Customer User Accessing Admin Route ---');
  const req2 = { headers: { authorization: `Bearer ${customerToken}` } };
  const res2 = createMockRes();
  let nextCalled2 = false;
  await adminMiddleware(req2, res2, () => { nextCalled2 = true; });
  if (res2.statusCode === 403 && !nextCalled2) {
    console.log('✓ Test 2 Passed: Customer user strictly rejected with 403');
  } else {
    throw new Error(`Test 2 Failed: Expected 403, got ${res2.statusCode}`);
  }

  // -------------------------------------------------------------
  // Test 3: Customer trying to self-promote to ADMIN via PATCH /api/users/me
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Customer Self-Promotion Prevention ---');
  const req3 = {
    user: { id: customerUser._id },
    body: { name: 'Attempted Hacker', role: 'admin' }
  };
  const res3 = createMockRes();
  await userController.updateMe(req3, res3);
  const reloadedCust = await User.findById(customerUser._id);
  if (reloadedCust.role === 'customer') {
    console.log('✓ Test 3 Passed: Role field cannot be modified by customer. Preserved as "customer".');
  } else {
    throw new Error('Test 3 Failed: Customer was able to change role!');
  }

  // -------------------------------------------------------------
  // Test 4: Authorized Admin accesses Dashboard -> 200 with Real Aggregated Metrics
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Admin Dashboard Metrics Aggregation ---');
  const req4 = {
    headers: { authorization: `Bearer ${adminToken}` },
    query: { range: '30d' }
  };
  const res4 = createMockRes();
  await adminMiddleware(req4, res4, async () => {
    await adminController.getDashboard(req4, res4);
  });
  if (res4.statusCode === 200 && res4.data && res4.data.data && res4.data.data.metrics) {
    const m = res4.data.data.metrics;
    console.log('Admin Dashboard Metrics:', m);
    if (typeof m.totalUsers === 'number' && typeof m.totalItems === 'number') {
      console.log('✓ Test 4 Passed: Dashboard returns real MongoDB metrics');
    } else {
      throw new Error('Test 4 Failed: Invalid metrics payload');
    }
  } else {
    throw new Error(`Test 4 Failed: Expected 200 with metrics, got ${res4.statusCode} and ${JSON.stringify(res4.data)}`);
  }

  // -------------------------------------------------------------
  // Test 5: Admin retrieves users list with backend pagination and search
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Admin Users Pagination and Search ---');
  const req5 = {
    admin: adminUser,
    query: { search: customerUser.email, page: '1', limit: '10' }
  };
  const res5 = createMockRes();
  await adminController.getUsers(req5, res5);
  if (res5.statusCode === 200 && res5.data?.data?.users?.length >= 1) {
    console.log(`✓ Test 5 Passed: Users list returned ${res5.data.data.users.length} matching user(s)`);
  } else {
    throw new Error(`Test 5 Failed: Expected search match, got ${res5.statusCode} data: ${JSON.stringify(res5.data)}`);
  }

  // -------------------------------------------------------------
  // Test 6: Admin suspends a customer account & verifies audit log
  // -------------------------------------------------------------
  console.log('\n--- Test 6: User Suspension & Audit Logging ---');
  const req6 = {
    admin: adminUser,
    params: { id: customerUser._id.toString() },
    body: { accountStatus: 'suspended', reason: 'Spam listings violation' },
    ip: '127.0.0.1'
  };
  const res6 = createMockRes();
  await adminController.updateUserStatus(req6, res6);
  const suspendedCust = await User.findById(customerUser._id);
  const audit6 = await AdminAuditLog.findOne({ action: 'USER_SUSPENDED', targetId: customerUser._id.toString() });

  if (res6.statusCode === 200 && suspendedCust.accountStatus === 'suspended' && audit6) {
    console.log('✓ Test 6 Passed: User suspended and audit log created');
  } else {
    throw new Error('Test 6 Failed: User suspension or audit failed');
  }

  // -------------------------------------------------------------
  // Test 7: Suspended user attempts authenticated action -> 403
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Suspended User Blocked at Auth Middleware ---');
  const req7 = { headers: { authorization: `Bearer ${customerToken}` } };
  const res7 = createMockRes();
  let nextCalled7 = false;
  await authMiddleware(req7, res7, () => { nextCalled7 = true; });
  if (res7.statusCode === 403 && !nextCalled7) {
    console.log('✓ Test 7 Passed: Suspended user rejected by auth middleware with 403');
  } else {
    throw new Error(`Test 7 Failed: Expected 403 for suspended user, got ${res7.statusCode}`);
  }

  // -------------------------------------------------------------
  // Test 8: Admin reactivates user
  // -------------------------------------------------------------
  console.log('\n--- Test 8: User Reactivation ---');
  const req8 = {
    admin: adminUser,
    params: { id: customerUser._id.toString() },
    body: { accountStatus: 'active', reason: 'Appeal accepted' },
    ip: '127.0.0.1'
  };
  const res8 = createMockRes();
  await adminController.updateUserStatus(req8, res8);
  const reactivatedCust = await User.findById(customerUser._id);
  if (res8.statusCode === 200 && reactivatedCust.accountStatus === 'active') {
    console.log('✓ Test 8 Passed: User reactivated successfully');
  } else {
    throw new Error('Test 8 Failed: User reactivation failed');
  }

  // -------------------------------------------------------------
  // Test 9: Item Moderation & Active Transaction Safety
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Item Moderation & Safety ---');
  const testItem = await Item.create({
    title: `Admin Test Drill ${timestamp}`,
    description: 'High power corded drill for DIY projects.',
    category: 'tools',
    owner: customerUser._id,
    images: [{ url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c', isPrimary: true }],
    sharingType: 'borrow',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    location: { city: 'Guntur', state: 'Andhra Pradesh' },
    locationCoordinates: { type: 'Point', coordinates: [80.45, 16.30] }
  });

  // Moderation hide
  const req9 = {
    admin: adminUser,
    params: { id: testItem._id.toString() },
    body: { action: 'hide', reason: 'Reviewing safety details' },
    ip: '127.0.0.1'
  };
  const res9 = createMockRes();
  await adminController.moderateItem(req9, res9);
  const hiddenItem = await Item.findById(testItem._id);
  if (res9.statusCode === 200 && hiddenItem.status === 'suspended') {
    console.log('✓ Test 9 Passed: Item safely hidden from public searches');
  } else {
    throw new Error('Test 9 Failed: Item hide failed');
  }

  // Restore item
  const req9b = {
    admin: adminUser,
    params: { id: testItem._id.toString() },
    body: { action: 'restore', reason: 'Approved after review' },
    ip: '127.0.0.1'
  };
  const res9b = createMockRes();
  await adminController.moderateItem(req9b, res9b);
  const restoredItem = await Item.findById(testItem._id);
  if (res9b.statusCode === 200 && restoredItem.status === 'active') {
    console.log('✓ Test 9b Passed: Item restored to active status');
  } else {
    throw new Error('Test 9b Failed: Item restore failed');
  }

  // -------------------------------------------------------------
  // Test 10: Category Management (Create, Case-Insensitive Duplicate, Toggle)
  // -------------------------------------------------------------
  console.log('\n--- Test 10: Category Management ---');
  const catName = `Woodworking_${timestamp}`;
  const req10a = {
    admin: adminUser,
    body: { name: catName, description: 'Handmade wooden crafts', icon: 'Wrench', subcategories: ['Chisels', 'Planes'] },
    ip: '127.0.0.1'
  };
  const res10a = createMockRes();
  await adminController.createCategory(req10a, res10a);
  if (res10a.statusCode === 201) {
    console.log('✓ Test 10a Passed: Category created successfully');
  } else {
    throw new Error(`Test 10a Failed: ${res10a.data?.message}`);
  }

  // Duplicate category creation attempt (case-insensitive)
  const req10b = {
    admin: adminUser,
    body: { name: catName.toLowerCase() },
    ip: '127.0.0.1'
  };
  const res10b = createMockRes();
  await adminController.createCategory(req10b, res10b);
  if (res10b.statusCode === 409) {
    console.log('✓ Test 10b Passed: Case-insensitive duplicate category rejected with 409');
  } else {
    throw new Error(`Test 10b Failed: Expected 409, got ${res10b.statusCode}`);
  }

  // Toggle category status to INACTIVE
  const createdCat = res10a.data.category;
  const req10c = {
    admin: adminUser,
    params: { id: createdCat._id.toString() },
    body: { status: 'INACTIVE' },
    ip: '127.0.0.1'
  };
  const res10c = createMockRes();
  await adminController.toggleCategoryStatus(req10c, res10c);
  const updatedCat = await Category.findById(createdCat._id);
  if (res10c.statusCode === 200 && updatedCat.status === 'INACTIVE') {
    console.log('✓ Test 10c Passed: Category safely deactivated without deleting historical data');
  } else {
    throw new Error('Test 10c Failed: Category status toggle failed');
  }

  // -------------------------------------------------------------
  // Test 11: Report Moderation & Resolution
  // -------------------------------------------------------------
  console.log('\n--- Test 11: Report Moderation & Resolution ---');
  const testReport = await Report.create({
    reporter: customerUser._id,
    targetType: 'ITEM',
    targetItem: testItem._id,
    reason: 'Misleading description',
    description: 'Item power wattage is different from photo',
    status: 'PENDING'
  });

  const req11 = {
    admin: adminUser,
    params: { id: testReport._id.toString() },
    body: { status: 'RESOLVED', resolutionNotes: 'Seller updated specification', actionTaken: 'NO_VIOLATION' },
    ip: '127.0.0.1'
  };
  const res11 = createMockRes();
  await adminController.resolveReport(req11, res11);
  const resolvedRep = await Report.findById(testReport._id);
  if (res11.statusCode === 200 && resolvedRep.status === 'RESOLVED' && resolvedRep.resolvedBy.toString() === adminUser._id.toString()) {
    console.log('✓ Test 11 Passed: Report resolved with recorded resolution notes and admin ID');
  } else {
    throw new Error('Test 11 Failed: Report resolution failed');
  }

  // -------------------------------------------------------------
  // Test 12: Admin Platform Settings Configuration
  // -------------------------------------------------------------
  console.log('\n--- Test 12: Platform Settings Configuration ---');
  const req12 = {
    admin: adminUser,
    body: { defaultMatchThreshold: 65, defaultSearchRadiusKm: 30, itemsPerPage: 25 },
    ip: '127.0.0.1'
  };
  const res12 = createMockRes();
  await adminController.updateSettings(req12, res12);
  const req12Get = {};
  const res12Get = createMockRes();
  await adminController.getSettings(req12Get, res12Get);
  if (res12.statusCode === 200 && res12Get.data.settings.defaultMatchThreshold === 65) {
    console.log('✓ Test 12 Passed: Admin settings updated and persisted');
  } else {
    throw new Error('Test 12 Failed: Settings update failed');
  }

  // -------------------------------------------------------------
  // Test 13: Admin Audit Trail Verification
  // -------------------------------------------------------------
  console.log('\n--- Test 13: Admin Audit Trail Verification ---');
  const req13 = {
    query: { page: '1', limit: '20' }
  };
  const res13 = createMockRes();
  await adminController.getAuditLogs(req13, res13);
  if (res13.statusCode === 200 && res13.data?.data?.logs?.length >= 5) {
    console.log(`✓ Test 13 Passed: Audit trail contains ${res13.data.data.logs.length} logged administrative events`);
  } else {
    throw new Error('Test 13 Failed: Audit log count lower than expected');
  }

  // Clean up test records
  await Promise.all([
    User.deleteMany({ _id: { $in: [customerUser._id, adminUser._id] } }),
    Item.deleteMany({ _id: testItem._id }),
    Report.deleteMany({ _id: testReport._id }),
    Category.deleteMany({ _id: createdCat._id }),
    AdminAuditLog.deleteMany({ admin: adminUser._id })
  ]);
  console.log('✓ Cleaned up test data');

  console.log('\n===============================================================');
  console.log('🎉 ALL 13 ADMIN PORTAL BACKEND INTEGRATION TESTS PASSED!');
  console.log('===============================================================\n');

  await mongoose.disconnect();
};

if (require.main === module) {
  runAdminTests().then(() => process.exit(0)).catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = runAdminTests;
