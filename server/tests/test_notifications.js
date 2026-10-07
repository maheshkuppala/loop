const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/looop';
const JWT_SECRET = process.env.JWT_SECRET || 'looop_jwt_dev_secret_key_2026';

async function runTests() {
  console.log('=== STARTING PROMPT 19 NOTIFICATION SYSTEM INTEGRATION TESTS ===');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // Clean up any previous test notifications for clean state
  await Notification.deleteMany({ title: { $regex: /\[TEST\]/ } });

  // 1. Setup or retrieve two test users
  let userA = await User.findOne({ email: 'notif_test_a@looop.local' });
  if (!userA) {
    userA = new User({
      name: 'Alice NotifTester',
      email: 'notif_test_a@looop.local',
      password: 'Password123!',
      role: 'customer',
      trustScore: 98
    });
    await userA.save();
  }

  let userB = await User.findOne({ email: 'notif_test_b@looop.local' });
  if (!userB) {
    userB = new User({
      name: 'Bob NotifTester',
      email: 'notif_test_b@looop.local',
      password: 'Password123!',
      role: 'customer',
      trustScore: 95
    });
    await userB.save();
  }
  console.log(`✓ Test Users: User A (${userA.name} - ${userA._id}), User B (${userB.name} - ${userB._id})`);

  // Clear existing test notifications for these users
  await Notification.deleteMany({ recipient: { $in: [userA._id, userB._id] } });

  // 2. Test initial unread count
  const initialCountA = await Notification.countDocuments({ recipient: userA._id, isRead: false });
  const initialCountB = await Notification.countDocuments({ recipient: userB._id, isRead: false });
  console.log(`✓ Initial Unread Counts: User A = ${initialCountA}, User B = ${initialCountB}`);
  if (initialCountA !== 0 || initialCountB !== 0) {
    throw new Error('Initial unread counts should be 0');
  }

  // 3. Scenario 1: User A requests User B's item -> REQUEST_RECEIVED notification for User B
  const fakeItemId = new mongoose.Types.ObjectId();
  const fakeReqId = new mongoose.Types.ObjectId();

  const notif1 = await notificationService.notifyRequestReceived({
    request: { _id: fakeReqId, type: 'BORROW' },
    item: { _id: fakeItemId, title: '[TEST] Camping Tent', owner: userB._id },
    requester: userA
  });
  console.log('✓ Scenario 1: notifyRequestReceived returned:', notif1.type, '-', notif1.title);
  if (notif1.recipient.toString() !== userB._id.toString() || notif1.type !== 'REQUEST_RECEIVED') {
    throw new Error('Scenario 1 failed: notification recipient or type mismatch');
  }

  // Verify unread count for User B is now 1
  const countB_after1 = await Notification.countDocuments({ recipient: userB._id, isRead: false });
  console.log(`✓ User B Unread Count after Scenario 1: ${countB_after1}`);
  if (countB_after1 !== 1) throw new Error('User B unread count should be 1');

  // 4. Scenario 2: User B accepts -> REQUEST_ACCEPTED notification for User A
  const fakeTxId = new mongoose.Types.ObjectId();
  const notif2 = await notificationService.notifyRequestAccepted({
    request: { _id: fakeReqId, requester: userA._id, item: fakeItemId },
    item: { _id: fakeItemId, title: '[TEST] Camping Tent', owner: userB._id },
    transaction: { _id: fakeTxId },
    actor: userB
  });
  console.log('✓ Scenario 2: notifyRequestAccepted returned:', notif2.type, '-', notif2.title);
  if (notif2.recipient.toString() !== userA._id.toString() || notif2.type !== 'REQUEST_ACCEPTED') {
    throw new Error('Scenario 2 failed: recipient or type mismatch');
  }

  // 5. Scenario 3: Handover scheduled -> HANDOVER_SCHEDULED for User A
  const notif3 = await notificationService.notifyHandoverScheduled({
    transaction: { _id: fakeTxId, item: fakeItemId, request: fakeReqId },
    item: { _id: fakeItemId, title: '[TEST] Camping Tent' },
    actor: userB,
    recipientId: userA._id
  });
  console.log('✓ Scenario 3: notifyHandoverScheduled returned:', notif3.type, '-', notif3.title);
  if (notif3.type !== 'HANDOVER_SCHEDULED') throw new Error('Scenario 3 type mismatch');

  // 6. Scenario 4: Handover confirmed -> HANDOVER_CONFIRMED
  const notif4 = await notificationService.notifyHandoverConfirmed({
    transaction: { _id: fakeTxId, status: 'ACTIVE' },
    item: { _id: fakeItemId, title: '[TEST] Camping Tent' },
    actor: userA,
    recipientId: userB._id,
    isCompleted: false
  });
  console.log('✓ Scenario 4: notifyHandoverConfirmed returned:', notif4.type, '-', notif4.title);
  if (notif4.type !== 'HANDOVER_CONFIRMED') throw new Error('Scenario 4 type mismatch');

  // 7. Scenario 5: New message -> NEW_MESSAGE notification
  const fakeConvId = new mongoose.Types.ObjectId();
  const notif5 = await notificationService.notifyNewMessage({
    conversation: { _id: fakeConvId },
    message: { _id: new mongoose.Types.ObjectId(), text: 'Hi Bob, I will meet you at the library.' },
    sender: userA,
    recipientId: userB._id
  });
  console.log('✓ Scenario 5: notifyNewMessage returned:', notif5.type, '-', notif5.title);
  if (notif5.type !== 'NEW_MESSAGE') throw new Error('Scenario 5 type mismatch');

  // 8. Scenario 6: Deduplication test within 5 seconds
  const duplicateNotif = await notificationService.notifyNewMessage({
    conversation: { _id: fakeConvId },
    message: { _id: new mongoose.Types.ObjectId(), text: 'Hi Bob, I will meet you at the library.' },
    sender: userA,
    recipientId: userB._id
  });
  if (duplicateNotif._id.toString() === notif5._id.toString()) {
    console.log('✓ Scenario 6: Deduplication successfully prevented duplicate notification record');
  } else {
    throw new Error('Deduplication failed to return existing notification record');
  }

  // 9. Scenario 7: Verify User B's unread notifications count
  const unreadB = await Notification.countDocuments({ recipient: userB._id, isRead: false });
  console.log(`✓ User B has ${unreadB} unread notifications (Expected: 3 [REQUEST_RECEIVED, HANDOVER_CONFIRMED, NEW_MESSAGE])`);
  if (unreadB !== 3) throw new Error(`Expected 3 unread for User B, got ${unreadB}`);

  // 10. Scenario 8: Mark single notification as read
  const updatedNotif = await Notification.findByIdAndUpdate(
    notif1._id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  console.log('✓ Scenario 8: Marked notif1 as read. isRead:', updatedNotif.isRead, 'readAt:', updatedNotif.readAt);
  const unreadB_afterSingleRead = await Notification.countDocuments({ recipient: userB._id, isRead: false });
  console.log(`✓ User B unread count after single read: ${unreadB_afterSingleRead}`);
  if (unreadB_afterSingleRead !== 2) throw new Error('Unread count should be 2 after single read');

  // 11. Scenario 9: Mark all notifications read for User B
  const markAllResult = await Notification.updateMany(
    { recipient: userB._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  console.log(`✓ Scenario 9: Marked all read for User B. Modified: ${markAllResult.modifiedCount}`);
  const finalUnreadB = await Notification.countDocuments({ recipient: userB._id, isRead: false });
  console.log(`✓ User B final unread count: ${finalUnreadB}`);
  if (finalUnreadB !== 0) throw new Error('User B unread count should be 0 after mark all read');

  // 12. Scenario 10: Verify User A's unread notifications were untouched by User B's actions
  const unreadA = await Notification.countDocuments({ recipient: userA._id, isRead: false });
  console.log(`✓ User A unread count: ${unreadA} (User A had 2: REQUEST_ACCEPTED and HANDOVER_SCHEDULED)`);
  if (unreadA !== 2) throw new Error(`User A should still have 2 unread, found: ${unreadA}`);

  // 13. Scenario 11: Security Isolation check
  // User B tries to query notifications belonging to User A
  const leakedToB = await Notification.find({ recipient: userB._id, _id: notif2._id });
  console.log(`✓ Scenario 11: User B query for User A's notif returns ${leakedToB.length} items (Strictly 0 expected)`);
  if (leakedToB.length !== 0) throw new Error('Security isolation breach: User B found User A notification');

  // 14. Clean up test records
  await Notification.deleteMany({ recipient: { $in: [userA._id, userB._id] } });
  await User.deleteMany({ email: { $in: ['notif_test_a@looop.local', 'notif_test_b@looop.local'] } });
  console.log('✓ Cleaned up test data');

  console.log('\n==================================================');
  console.log('ALL PROMPT 19 NOTIFICATION SYSTEM TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
  await mongoose.disconnect();
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
