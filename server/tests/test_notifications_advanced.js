/**
 * Comprehensive Automated Test Suite for Prompt 25:
 * Advanced Notifications & User Notification Preferences
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const User = require('../models/User');
const Item = require('../models/Item');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const notificationService = require('../services/notificationService');
const notificationController = require('../controllers/notificationController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/looop';
const JWT_SECRET = process.env.JWT_SECRET || 'looop_jwt_dev_secret_key_2026';

// Test runner helper
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

// Mock express req/res
function mockReqRes(user, params = {}, query = {}, body = {}) {
  const req = { user, params, query, body };
  const res = {
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
  return { req, res };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   PROMPT 25 NOTIFICATIONS & PREFERENCES TEST SUITE   ');
  console.log('======================================================\n');

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.\n');

  // Setup test users
  const uniqueSuffix = Date.now();
  const userA = await User.create({
    name: 'Notification Tester A',
    email: `tester_notif_a_${uniqueSuffix}@example.com`,
    password: 'Password123!',
    role: 'customer',
    trustScore: 90
  });

  const userB = await User.create({
    name: 'Notification Tester B',
    email: `tester_notif_b_${uniqueSuffix}@example.com`,
    password: 'Password123!',
    role: 'customer',
    trustScore: 92
  });

  const testItem = await Item.create({
    title: 'Scientific Calculator fx-991EX',
    description: 'Advanced non-programmable calculator for engineering calculations',
    category: 'electronics',
    condition: 'like_new',
    sharingType: 'borrow',
    images: [{ url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400', isPrimary: true }],
    owner: userA._id,
    location: { city: 'Bengaluru', locality: 'Indiranagar' },
    status: 'active',
    availability: 'Available'
  });

  const testRequest = await Request.create({
    item: testItem._id,
    requester: userB._id,
    owner: userA._id,
    type: 'BORROW',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 3),
    status: 'PENDING',
    message: 'Need calculator for practical exam'
  });

  const testTransaction = await Transaction.create({
    request: testRequest._id,
    item: testItem._id,
    owner: userA._id,
    recipient: userB._id,
    type: 'BORROW',
    status: 'HANDOVER_SCHEDULED',
    handoverDate: new Date()
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Default Preferences Auto-Provisioning
    // ----------------------------------------------------
    console.log('--- TEST 1: Preferences Auto-Provisioning ---');
    const prefsA = await notificationService.getPreferences(userA._id);
    assert(prefsA !== null, 'Preferences auto-created on initial lookup');
    assert(prefsA.categories.requests === true, 'Default requests category is enabled');
    assert(prefsA.categories.account === true, 'Default account security category is enabled');
    assert(prefsA.inApp === true, 'In-app notifications enabled by default');

    // ----------------------------------------------------
    // TEST 2: Controller GET /preferences
    // ----------------------------------------------------
    console.log('\n--- TEST 2: GET /api/notifications/preferences ---');
    const { req: reqGetPref, res: resGetPref } = mockReqRes(userA);
    await notificationController.getPreferences(reqGetPref, resGetPref);
    assert(resGetPref.statusCode === 200, 'GET /preferences returns 200');
    assert(resGetPref.data.success === true, 'GET /preferences returns success: true');
    assert(resGetPref.data.preferences.categories.matching === true, 'Categories present in response');

    // ----------------------------------------------------
    // TEST 3: Controller PATCH /preferences (Whitelist & Security Enforcement)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: PATCH /api/notifications/preferences ---');
    // A. Rejects unknown keys
    const { req: reqBadKey, res: resBadKey } = mockReqRes(userA, {}, {}, { invalidField: true });
    await notificationController.updatePreferences(reqBadKey, resBadKey);
    assert(resBadKey.statusCode === 400, 'Rejects unknown preference keys with 400');

    // B. Enforces account security category cannot be disabled
    const { req: reqUpdate, res: resUpdate } = mockReqRes(userA, {}, {}, {
      categories: {
        matching: false,
        account: false // Attempt to disable security
      },
      quietHours: {
        enabled: true,
        start: '23:00',
        end: '06:00',
        timezone: 'Asia/Kolkata'
      }
    });
    await notificationController.updatePreferences(reqUpdate, resUpdate);
    assert(resUpdate.statusCode === 200, 'PATCH /preferences accepts valid updates');
    assert(resUpdate.data.preferences.categories.matching === false, 'Matching category disabled as requested');
    assert(resUpdate.data.preferences.categories.account === true, 'Account category protected and remains true');
    assert(resUpdate.data.preferences.quietHours.enabled === true, 'Quiet hours enabled');

    // ----------------------------------------------------
    // TEST 4: REQUEST Notifications & Deep Links
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Request Notifications ---');
    const notifReqReceived = await notificationService.notifyRequestReceived({
      request: testRequest,
      item: testItem,
      requester: userB
    });
    assert(notifReqReceived !== null, 'notifyRequestReceived creates notification');
    assert(notifReqReceived.category === 'REQUESTS', 'Mapped to REQUESTS category');
    assert(notifReqReceived.type === 'REQUEST_RECEIVED', 'Type is REQUEST_RECEIVED');
    assert(notifReqReceived.link.includes('/requests/'), 'Deep link points to /requests/:id');

    const notifReqAccepted = await notificationService.notifyRequestAccepted({
      request: testRequest,
      item: testItem,
      actor: userA,
      transaction: testTransaction
    });
    assert(notifReqAccepted !== null, 'notifyRequestAccepted creates notification for requester');
    assert(notifReqAccepted.recipient.toString() === userB._id.toString(), 'Recipient is requester (userB)');

    // ----------------------------------------------------
    // TEST 5: TRANSACTION Notifications
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Transaction Notifications ---');
    const notifHandover = await notificationService.notifyHandoverScheduled({
      transaction: testTransaction,
      item: testItem,
      actor: userA,
      recipientId: userB._id
    });
    assert(notifHandover !== null, 'notifyHandoverScheduled creates notification');
    assert(notifHandover.category === 'TRANSACTIONS', 'Category is TRANSACTIONS');
    assert(notifHandover.link.includes('/transactions/'), 'Deep link points to /transactions/:id');

    // ----------------------------------------------------
    // TEST 6: CHAT Message Notifications
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Chat Notifications ---');
    const notifMsg = await notificationService.notifyNewMessage({
      conversation: { id: new mongoose.Types.ObjectId() },
      message: { text: 'Hello, what time works for meeting?' },
      sender: userA,
      recipientId: userB._id
    });
    assert(notifMsg !== null, 'notifyNewMessage creates notification');
    assert(notifMsg.category === 'MESSAGES', 'Category is MESSAGES');

    // ----------------------------------------------------
    // TEST 7: SAFETY & REPORT Notifications
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Safety & Report Notifications ---');
    const notifReport = await notificationService.notifyReportUpdate({
      userId: userA._id,
      reportId: new mongoose.Types.ObjectId(),
      status: 'RESOLVED',
      details: 'Thank you for keeping LOOOP safe. The reported item was reviewed.'
    });
    assert(notifReport !== null, 'notifyReportUpdate creates notification');
    assert(notifReport.category === 'SAFETY', 'Category is SAFETY');

    // ----------------------------------------------------
    // TEST 8: IMPACT Milestone Notifications (Prompt 24 Integration)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Impact Milestone Notifications ---');
    const notifMilestone = await notificationService.notifyImpactMilestone({
      userId: userA._id,
      milestoneTitle: 'First Circulation',
      targetCount: 1,
      milestoneKey: 'first_reuse'
    });
    assert(notifMilestone !== null, 'notifyImpactMilestone creates notification');
    assert(notifMilestone.category === 'IMPACT', 'Category is IMPACT');
    assert(notifMilestone.type === 'IMPACT_MILESTONE', 'Type is IMPACT_MILESTONE');

    // ----------------------------------------------------
    // TEST 9: Deduplication Strategy
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Deduplication Strategy ---');
    const duplicateMilestone = await notificationService.notifyImpactMilestone({
      userId: userA._id,
      milestoneTitle: 'First Circulation',
      targetCount: 1,
      milestoneKey: 'first_reuse'
    });
    assert(duplicateMilestone._id.toString() === notifMilestone._id.toString(), 'Dedupe prevents duplicate milestone notification');

    // ----------------------------------------------------
    // TEST 10: Preference-Aware Delivery & Critical Security Override
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Preference-Aware Delivery & Security Override ---');
    // UserA disabled 'matching' in TEST 3
    const suppressedMatch = await notificationService.notifyWantedMatch({
      requester: userA._id,
      item: testItem,
      wantedItem: { _id: new mongoose.Types.ObjectId(), title: 'Scientific Calculator' },
      distanceKm: 2.5
    });
    assert(suppressedMatch === null, 'Disabled matching category suppresses notification');

    // Critical security event MUST NOT be suppressed
    const securityAlert = await notificationService.notifySecurityEvent({
      userId: userA._id,
      title: 'Password Changed',
      message: 'Your account password was updated successfully.'
    });
    assert(securityAlert !== null, 'Security alerts bypass preferences and are always delivered');
    assert(securityAlert.category === 'ACCOUNT', 'Security alert category is ACCOUNT');

    // ----------------------------------------------------
    // TEST 11: GET /api/notifications (Pagination & Category Filter)
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Pagination & Filtering ---');
    const { req: reqAll, res: resAll } = mockReqRes(userA, {}, { page: 1, limit: 10 });
    await notificationController.getNotifications(reqAll, resAll);
    assert(resAll.statusCode === 200, 'GET /notifications returns 200');
    assert(resAll.data.notifications.length > 0, 'Returns notification records');
    assert(typeof resAll.data.unreadCount === 'number', 'Returns authoritative unreadCount');
    assert(resAll.data.page === 1, 'Pagination page returned');

    // Category filter: REQUESTS only
    const { req: reqFilter, res: resFilter } = mockReqRes(userA, {}, { category: 'REQUESTS' });
    await notificationController.getNotifications(reqFilter, resFilter);
    assert(resFilter.data.notifications.every((n) => n.category === 'REQUESTS'), 'All filtered notifications belong to REQUESTS');

    // ----------------------------------------------------
    // TEST 12: GET /api/notifications/unread-count
    // ----------------------------------------------------
    console.log('\n--- TEST 12: GET /api/notifications/unread-count ---');
    const { req: reqUnread, res: resUnread } = mockReqRes(userA);
    await notificationController.getUnreadCount(reqUnread, resUnread);
    assert(resUnread.statusCode === 200, 'GET /unread-count returns 200');
    assert(resUnread.data.count > 0, 'Unread count is accurate and positive');
    const initialUnreadCount = resUnread.data.count;

    // ----------------------------------------------------
    // TEST 13: PATCH /api/notifications/:id/read (Ownership & Idempotency)
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Mark as Read & Ownership Enforcement ---');
    // A. UserB attempts to mark UserA's notification -> Forbidden
    const { req: reqCrossRead, res: resCrossRead } = mockReqRes(userB, { id: notifReqReceived._id });
    await notificationController.markAsRead(reqCrossRead, resCrossRead);
    assert(resCrossRead.statusCode === 403, 'Cross-user mark as read forbidden with 403');

    // B. Recipient marks as read
    const { req: reqMarkRead, res: resMarkRead } = mockReqRes(userA, { id: notifReqReceived._id });
    await notificationController.markAsRead(reqMarkRead, resMarkRead);
    assert(resMarkRead.statusCode === 200, 'Recipient marks notification as read successfully');
    assert(resMarkRead.data.notification.isRead === true, 'isRead is true');

    // Verify unread count decreased by 1
    const { req: reqUnreadAfter, res: resUnreadAfter } = mockReqRes(userA);
    await notificationController.getUnreadCount(reqUnreadAfter, resUnreadAfter);
    assert(resUnreadAfter.data.count === initialUnreadCount - 1, 'Unread count correctly decremented by 1');

    // ----------------------------------------------------
    // TEST 14: DELETE /api/notifications/:id (Soft Dismissal & Security Protection)
    // ----------------------------------------------------
    console.log('\n--- TEST 14: Dismissal & Security Alert Protection ---');
    // A. Attempt to delete critical security notification -> Forbidden
    const { req: reqDelSec, res: resDelSec } = mockReqRes(userA, { id: securityAlert._id });
    await notificationController.deleteNotification(reqDelSec, resDelSec);
    assert(resDelSec.statusCode === 403, 'Deletion of critical security notification forbidden with 403');

    // B. Dismiss normal notification
    const { req: reqDelNorm, res: resDelNorm } = mockReqRes(userA, { id: notifReqReceived._id });
    await notificationController.deleteNotification(reqDelNorm, resDelNorm);
    assert(resDelNorm.statusCode === 200, 'Normal notification dismissed successfully');

    // Verify dismissed notification is excluded from feed
    const { req: reqCheckFeed, res: resCheckFeed } = mockReqRes(userA);
    await notificationController.getNotifications(reqCheckFeed, resCheckFeed);
    assert(
      !resCheckFeed.data.notifications.some((n) => n._id.toString() === notifReqReceived._id.toString()),
      'Dismissed notification excluded from feed'
    );

    // Verify related request/item entities were NOT deleted
    const verifyItem = await Item.findById(testItem._id);
    assert(verifyItem !== null, 'Dismissing notification never deletes related item');

    // ----------------------------------------------------
    // TEST 15: PATCH /api/notifications/read-all
    // ----------------------------------------------------
    console.log('\n--- TEST 15: Mark All as Read ---');
    const { req: reqReadAll, res: resReadAll } = mockReqRes(userA);
    await notificationController.markAllAsRead(reqReadAll, resReadAll);
    assert(resReadAll.statusCode === 200, 'PATCH /read-all returns 200');

    const { req: reqFinalUnread, res: resFinalUnread } = mockReqRes(userA);
    await notificationController.getUnreadCount(reqFinalUnread, resFinalUnread);
    assert(resFinalUnread.data.count === 0, 'Unread count becomes 0 after mark-all-as-read');

  } finally {
    // Clean up test records
    await Notification.deleteMany({ recipient: { $in: [userA._id, userB._id] } });
    await NotificationPreference.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await Transaction.deleteMany({ _id: testTransaction._id });
    await Request.deleteMany({ _id: testRequest._id });
    await Item.deleteMany({ _id: testItem._id });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
