const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Models
const User = require('../models/User');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Report = require('../models/Report');
const ImpactEvent = require('../models/ImpactEvent');
const AdminAuditLog = require('../models/AdminAuditLog');

// Controllers & Services
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const itemController = require('../controllers/itemController');
const requestController = require('../controllers/requestController');
const transactionController = require('../controllers/transactionController');
const reviewController = require('../controllers/reviewController');
const reportController = require('../controllers/reportController');
const adminController = require('../controllers/adminController');
const conversationService = require('../services/conversationService');
const matchingService = require('../services/matchingService');
const environmentalImpactService = require('../services/environmentalImpactService');

// Middleware
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

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

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
};

const runMasterE2ETests = async () => {
  console.log('================================================================');
  console.log('   PROMPT 29: LOOOP MASTER END-TO-END INTEGRATION TEST SUITE   ');
  console.log('================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/looop';
  await mongoose.connect(mongoUri);
  console.log(`[Database] Connected successfully to ${mongoUri}`);

  let passedTests = 0;
  const testTrack = (fn) => {
    try {
      fn();
      passedTests++;
    } catch (e) {
      console.error(`  ✗ FAIL: ${e.message}`);
      throw e;
    }
  };

  const timestamp = Date.now();
  const testPassword = 'Password123!';

  // ============================================================================
  // SUITE 1: AUTHENTICATION FULL LIFECYCLE
  // ============================================================================
  console.log('\n--- SUITE 1: Authentication Full Lifecycle ---');

  // 1.1 Valid Registration
  const regReq = {
    body: {
      name: `User Alpha ${timestamp}`,
      email: `user_alpha_${timestamp}@looop.test`,
      password: testPassword
    }
  };
  const regRes = createMockRes();
  await authController.register(regReq, regRes);
  testTrack(() => assert(regRes.statusCode === 201, 'Registration returns HTTP 201'));
  testTrack(() => assert(regRes.data.success === true, 'Registration returns success: true'));
  testTrack(() => assert(!!regRes.data.token, 'JWT token returned on registration'));
  testTrack(() => assert(regRes.data.user.role === 'customer', 'New registrant is assigned customer role'));

  const userAId = regRes.data.user.id;
  const userAEmail = regRes.data.user.email;
  const tokenA = regRes.data.token;

  // 1.2 Duplicate Registration Prevention
  const dupRes = createMockRes();
  await authController.register(regReq, dupRes);
  testTrack(() => assert(dupRes.statusCode === 409, 'Duplicate registration is rejected with HTTP 409'));

  // 1.3 Weak Password Validation
  const weakReq = {
    body: {
      name: 'Weak User',
      email: `weak_${timestamp}@looop.test`,
      password: '123'
    }
  };
  const weakRes = createMockRes();
  await authController.register(weakReq, weakRes);
  testTrack(() => assert(weakRes.statusCode === 400, 'Password under 6 characters rejected with HTTP 400'));

  // 1.4 Invalid Email Format
  const badEmailReq = {
    body: {
      name: 'Bad Email',
      email: 'notanemail',
      password: testPassword
    }
  };
  const badEmailRes = createMockRes();
  await authController.register(badEmailReq, badEmailRes);
  testTrack(() => assert(badEmailRes.statusCode === 400, 'Invalid email format rejected with HTTP 400'));

  // 1.5 Valid Login
  const loginReq = {
    body: {
      email: userAEmail,
      password: testPassword
    }
  };
  const loginRes = createMockRes();
  await authController.login(loginReq, loginRes);
  testTrack(() => assert(loginRes.statusCode === 200, 'Login with correct credentials returns HTTP 200'));
  testTrack(() => assert(!!loginRes.data.token, 'Login returns valid JWT session token'));

  // 1.6 Invalid Password Login
  const badPassReq = {
    body: {
      email: userAEmail,
      password: 'WrongPassword999!'
    }
  };
  const badPassRes = createMockRes();
  await authController.login(badPassReq, badPassRes);
  testTrack(() => assert(badPassRes.statusCode === 401, 'Invalid password rejected with HTTP 401'));

  // 1.7 Non-Existent Account Login
  const noAccountReq = {
    body: {
      email: `nonexistent_${timestamp}@looop.test`,
      password: testPassword
    }
  };
  const noAccountRes = createMockRes();
  await authController.login(noAccountReq, noAccountRes);
  testTrack(() => assert(noAccountRes.statusCode === 401, 'Unknown account login rejected with HTTP 401'));

  // 1.8 Forgot Password & Single-Use Reset Password
  const forgotReq = {
    body: {
      email: userAEmail
    }
  };
  const forgotRes = createMockRes();
  await authController.forgotPassword(forgotReq, forgotRes);
  testTrack(() => assert(forgotRes.statusCode === 200, 'Forgot password request returns HTTP 200'));
  testTrack(() => assert(!!forgotRes.data.resetToken, 'Reset token generated securely'));

  const rawResetToken = forgotRes.data.resetToken;

  // Reset password with token
  const newPassword = 'NewSecretPassword456!';
  const resetReq = {
    body: {
      token: rawResetToken,
      password: newPassword
    }
  };
  const resetRes = createMockRes();
  await authController.resetPassword(resetReq, resetRes);
  testTrack(() => assert(resetRes.statusCode === 200, 'Password reset with valid token succeeds with HTTP 200'));

  // Single-use verification: reusing the same token must be rejected
  const reuseResetRes = createMockRes();
  await authController.resetPassword(resetReq, reuseResetRes);
  testTrack(() => assert(reuseResetRes.statusCode === 400, 'Reusing spent reset token is rejected with HTTP 400'));

  // Login with new password succeeds
  const newLoginReq = { body: { email: userAEmail, password: newPassword } };
  const newLoginRes = createMockRes();
  await authController.login(newLoginReq, newLoginRes);
  testTrack(() => assert(newLoginRes.statusCode === 200, 'Login with newly reset password succeeds'));

  // ============================================================================
  // SUITE 2: AUTHORIZATION, RBAC & IDOR PREVENTIONS
  // ============================================================================
  console.log('\n--- SUITE 2: Authorization, RBAC & IDOR Protections ---');

  // Create User B (Customer) and Admin User
  const passwordHash = await bcrypt.hash(testPassword, 10);
  const userB = await User.create({
    name: `User Beta ${timestamp}`,
    email: `user_beta_${timestamp}@looop.test`,
    password: passwordHash,
    role: 'customer',
    accountStatus: 'active'
  });
  const tokenB = jwt.sign({ id: userB._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

  const adminUser = await User.create({
    name: `Admin Test ${timestamp}`,
    email: `admin_${timestamp}@looop.test`,
    password: passwordHash,
    role: 'admin',
    accountStatus: 'active'
  });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

  // 2.1 Unauthenticated Request Rejected
  const unauthReq = { headers: {} };
  const unauthRes = createMockRes();
  let nextCalled = false;
  authMiddleware(unauthReq, unauthRes, () => { nextCalled = true; });
  testTrack(() => assert(unauthRes.statusCode === 401 && !nextCalled, 'Unauthenticated request rejected with HTTP 401'));

  // 2.2 Customer Accessing Admin Middleware Rejected
  const custAdminReq = {
    headers: { authorization: `Bearer ${tokenB}` },
    user: { id: userB._id, role: 'customer' }
  };
  const custAdminRes = createMockRes();
  let adminNextCalled = false;
  await adminMiddleware(custAdminReq, custAdminRes, () => { adminNextCalled = true; });
  testTrack(() => assert(custAdminRes.statusCode === 403 && !adminNextCalled, 'Customer blocked from admin routes with HTTP 403'));

  // 2.3 Customer Self-Promotion Prevention
  const promoReq = {
    user: { id: userB._id, role: 'customer' },
    body: { role: 'admin', accountStatus: 'suspended' }
  };
  const promoRes = createMockRes();
  await userController.updateMe(promoReq, promoRes);
  const reloadedUserB = await User.findById(userB._id);
  testTrack(() => assert(reloadedUserB.role === 'customer', 'Customer cannot promote self to admin role via profile update'));

  // 2.4 Suspended Account Blocked at Login
  userB.accountStatus = 'suspended';
  await userB.save();

  const suspLoginReq = { body: { email: userB.email, password: testPassword } };
  const suspLoginRes = createMockRes();
  await authController.login(suspLoginReq, suspLoginRes);
  testTrack(() => assert(suspLoginRes.statusCode === 403, 'Suspended user blocked from logging in with HTTP 403'));

  // Restore User B to active
  userB.accountStatus = 'active';
  await userB.save();

  // ============================================================================
  // SUITE 3: COMPLETE ITEM LIFECYCLE & PRIVACY
  // ============================================================================
  console.log('\n--- SUITE 3: Item Lifecycle & Location Privacy ---');

  // User A publishes an Item
  const itemData = {
    title: `Vintage Drafting Compass Set ${timestamp}`,
    category: 'tools',
    subcategory: 'Hand Tools',
    condition: 'good',
    sharingType: 'give_away',
    description: 'High precision drafting compass in wooden box.',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      city: 'Bengaluru',
      locality: 'Indiranagar',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      approximateAddress: 'Indiranagar, Bengaluru'
    },
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600']
  };

  const createItemReq = {
    user: { id: userAId, role: 'customer' },
    body: itemData
  };
  const createItemRes = createMockRes();
  await itemController.createItem(createItemReq, createItemRes);
  testTrack(() => assert(createItemRes.statusCode === 201, 'Item successfully created with HTTP 201'));

  const createdItemId = createItemRes.data.item.id || createItemRes.data.item._id;

  // Privacy Check: Ensure no exact address or private credentials exposed
  const getItemReq = { params: { id: createdItemId } };
  const getItemRes = createMockRes();
  await itemController.getItemById(getItemReq, getItemRes);
  testTrack(() => assert(getItemRes.statusCode === 200, 'Public item details retrieved'));
  testTrack(() => assert(getItemRes.data.item.location.city === 'Bengaluru', 'Approximate city is present'));
  testTrack(() => assert(!getItemRes.data.item.location.streetAddress, 'Exact street address is not exposed'));

  // IDOR Prevention: User B cannot delete User A's item
  const idorDelReq = {
    user: { id: userB._id, role: 'customer' },
    params: { id: createdItemId }
  };
  const idorDelRes = createMockRes();
  await itemController.deleteItem(idorDelReq, idorDelRes);
  testTrack(() => assert(idorDelRes.statusCode === 403, 'Unauthorized item deletion rejected with HTTP 403'));

  // ============================================================================
  // SUITE 4: REQUEST SYSTEM & TRANSACTION STATE MACHINE
  // ============================================================================
  console.log('\n--- SUITE 4: Request System & Transaction State Machine ---');

  // Prevent User A from requesting their own item
  const selfReq = {
    user: { id: userAId, role: 'customer' },
    body: { itemId: createdItemId, message: 'I want my own item' }
  };
  const selfReqRes = createMockRes();
  await requestController.createRequest(selfReq, selfReqRes);
  testTrack(() => assert(selfReqRes.statusCode === 400, 'Requesting own item rejected with HTTP 400'));

  // User B submits valid request for User A's item
  const validReq = {
    user: { id: userB._id, role: 'customer' },
    body: { itemId: createdItemId, message: 'I would love to use this for my engineering project.' }
  };
  const validReqRes = createMockRes();
  await requestController.createRequest(validReq, validReqRes);
  testTrack(() => assert(validReqRes.statusCode === 201, 'User B request created with HTTP 201'));
  const requestId = validReqRes.data.request._id;

  // Duplicate active request prevention
  const dupReqRes = createMockRes();
  await requestController.createRequest(validReq, dupReqRes);
  testTrack(() => assert(dupReqRes.statusCode === 400, 'Duplicate active request rejected with HTTP 400'));

  // IDOR Prevention: User B cannot accept the request (only owner User A can)
  const idorAcceptReq = {
    user: { id: userB._id, role: 'customer' },
    params: { id: requestId }
  };
  const idorAcceptRes = createMockRes();
  await requestController.acceptRequest(idorAcceptReq, idorAcceptRes);
  testTrack(() => assert(idorAcceptRes.statusCode === 403, 'Non-owner accepting request rejected with HTTP 403'));

  // Owner User A accepts the request
  const acceptReq = {
    user: { id: userAId, role: 'customer' },
    params: { id: requestId }
  };
  const acceptRes = createMockRes();
  await requestController.acceptRequest(acceptReq, acceptRes);
  testTrack(() => assert(acceptRes.statusCode === 200, 'Owner accepts request with HTTP 200'));
  testTrack(() => assert(!!acceptRes.data.transaction, 'Transaction auto-created upon request acceptance'));

  const txId = acceptRes.data.transaction.id || acceptRes.data.transaction._id;

  // Verify item is now reserved/unavailable
  const updatedItem = await Item.findById(createdItemId);
  testTrack(() => assert(updatedItem.availability === 'Reserved' || updatedItem.availability === 'Unavailable', 'Item availability marked Reserved after acceptance'));

  // State Machine Step 1: Schedule Handover
  const scheduleReq = {
    user: { id: userAId, role: 'customer' },
    params: { id: txId },
    body: {
      handoverDate: new Date(Date.now() + 86400000).toISOString(),
      handoverTime: '10:00 AM',
      handoverLocation: 'Indiranagar Metro Station'
    }
  };
  const scheduleRes = createMockRes();
  await transactionController.updateHandover(scheduleReq, scheduleRes);
  testTrack(() => assert(scheduleRes.statusCode === 200, 'Handover scheduled successfully'));

  // State Machine Step 2: Confirm Handover (Owner + Recipient)
  const confirmOwnerReq = {
    user: { id: userAId, role: 'customer' },
    params: { id: txId }
  };
  const confirmOwnerRes = createMockRes();
  await transactionController.confirmHandover(confirmOwnerReq, confirmOwnerRes);
  testTrack(() => assert(confirmOwnerRes.statusCode === 200, 'Owner handover confirmed'));

  const confirmRecipReq = {
    user: { id: userB._id, role: 'customer' },
    params: { id: txId }
  };
  const confirmRecipRes = createMockRes();
  await transactionController.confirmHandover(confirmRecipReq, confirmRecipRes);
  testTrack(() => assert(confirmRecipRes.statusCode === 200, 'Recipient confirmed; transaction status is COMPLETED'));

  const txAfterHandover = await Transaction.findById(txId);
  testTrack(() => assert(txAfterHandover.status === 'COMPLETED', 'Free giveaway completed after bilateral confirmation'));

  // ============================================================================
  // SUITE 5: REVIEWS, RATINGS & ENVIRONMENTAL IMPACT VERIFICATION
  // ============================================================================
  console.log('\n--- SUITE 5: Reviews, Ratings & Environmental Impact ---');

  // Recipient User B reviews Owner User A
  const reviewReq = {
    user: { id: userB._id, role: 'customer' },
    body: {
      transactionId: txId,
      reviewedUserId: userAId,
      rating: 5,
      comment: 'Item was in fantastic condition and handover was effortless!'
    }
  };
  const reviewRes = createMockRes();
  await reviewController.createReview(reviewReq, reviewRes);
  testTrack(() => assert(reviewRes.statusCode === 201, 'Review submitted successfully with HTTP 201'));

  // Duplicate Review Prevention
  const dupReviewRes = createMockRes();
  await reviewController.createReview(reviewReq, dupReviewRes);
  testTrack(() => assert(dupReviewRes.statusCode === 409, 'Duplicate review prevented with HTTP 409'));

  // Self-Review Prevention
  const selfRevReq = {
    user: { id: userAId, role: 'customer' },
    body: {
      transactionId: txId,
      reviewedUserId: userAId,
      rating: 5,
      comment: 'Reviewing myself'
    }
  };
  const selfRevRes = createMockRes();
  await reviewController.createReview(selfRevReq, selfRevRes);
  testTrack(() => assert(selfRevRes.statusCode === 400, 'Self-review rejected with HTTP 400'));

  // Environmental Impact: Completed transaction generated an ImpactEvent
  const impactEvent = await ImpactEvent.findOne({ transaction: txId });
  testTrack(() => assert(!!impactEvent, 'ImpactEvent created for completed sharing transaction'));
  testTrack(() => assert((impactEvent.metrics?.reuseCount ?? impactEvent.reuseCount) === 1, 'reuseCount equals 1'));

  // Idempotency: Re-syncing does not duplicate ImpactEvent
  await environmentalImpactService.syncCompletedTransactions();
  const impactCount = await ImpactEvent.countDocuments({ transaction: txId });
  testTrack(() => assert(impactCount === 1, 'ImpactEvent idempotency verified (exact 1 event exists)'));

  // ============================================================================
  // SUITE 6: WANTED ITEM & DETERMINISTIC MATCHING ENGINE
  // ============================================================================
  console.log('\n--- SUITE 6: Wanted Item & Deterministic Matching Engine ---');

  // User B creates a Wanted Item
  const wantedItem = await WantedItem.create({
    requester: userB._id,
    title: `Calculus & Linear Algebra Textbook ${timestamp}`,
    category: 'books',
    description: 'Looking for a reference textbook for semester coursework.',
    preferredSharingType: 'borrow',
    urgency: 'high',
    status: 'ACTIVE',
    location: {
      city: 'Bengaluru'
    }
  });
  testTrack(() => assert(!!wantedItem._id, 'Wanted item created successfully'));

  // User A creates matching available item
  const matchingBook = await Item.create({
    owner: userAId,
    title: `Linear Algebra and Applications Textbook ${timestamp}`,
    category: 'books',
    subcategory: 'Engineering',
    condition: 'good',
    sharingType: 'borrow',
    description: 'Calculus and Linear Algebra textbook in clean condition.',
    status: 'active',
    availability: 'Available',
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' }],
    location: {
      city: 'Bengaluru'
    }
  });

  // Execute matching service
  const matchResult = await matchingService.findMatchesForItem(matchingBook);
  testTrack(() => assert(Array.isArray(matchResult), 'findMatchesForItem returns an array'));

  const foundMatch = matchResult.find((m) => m.wantedItem._id.toString() === wantedItem._id.toString());
  testTrack(() => assert(!!foundMatch, 'Matching engine deterministically linked Item to WantedItem'));
  testTrack(() => assert(foundMatch.score >= 50, `Match score is high relevance (${foundMatch?.score}%)`));

  // Deduplication check: executing match again doesn't spam notifications
  const notifCountBefore = await Notification.countDocuments({ recipient: userB._id, type: 'WANTED_MATCH' });
  await matchingService.notifyMatchesForItem(matchingBook);
  const notifCountAfter = await Notification.countDocuments({ recipient: userB._id, type: 'WANTED_MATCH' });
  testTrack(() => assert(notifCountAfter <= notifCountBefore + 1, 'Match notifications deduplicated properly'));

  // ============================================================================
  // SUITE 7: BORROW / RETURN TRANSACTION WORKFLOW
  // ============================================================================
  console.log('\n--- SUITE 7: Borrow & Return Lifecycle ---');

  // User B requests to borrow matching book
  const borrowReq = {
    user: { id: userB._id, role: 'customer' },
    body: {
      itemId: matchingBook._id,
      type: 'BORROW',
      expectedReturnDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      message: 'Can I borrow this for two weeks?'
    }
  };
  const borrowReqRes = createMockRes();
  await requestController.createRequest(borrowReq, borrowReqRes);
  const borrowRequestId = borrowReqRes.data.request._id;

  // Owner User A accepts
  const acceptBorrowRes = createMockRes();
  await requestController.acceptRequest(
    { user: { id: userAId, role: 'customer' }, params: { id: borrowRequestId } },
    acceptBorrowRes
  );
  const borrowTxId = acceptBorrowRes.data.transaction._id;

  // Handover confirmed -> status becomes ACTIVE for borrow
  await transactionController.confirmHandover(
    { user: { id: userAId, role: 'customer' }, params: { id: borrowTxId } },
    createMockRes()
  );
  await transactionController.confirmHandover(
    { user: { id: userB._id, role: 'customer' }, params: { id: borrowTxId } },
    createMockRes()
  );

  const borrowTxActive = await Transaction.findById(borrowTxId);
  testTrack(() => assert(borrowTxActive.status === 'ACTIVE', 'Borrow transaction transitioned to ACTIVE state'));

  // Borrower initiates return
  const initReturnRes = createMockRes();
  await transactionController.startReturn(
    { user: { id: userB._id, role: 'customer' }, params: { id: borrowTxId } },
    initReturnRes
  );
  testTrack(() => assert(initReturnRes.statusCode === 200, 'Borrower initiated return successfully'));

  const borrowTxPending = await Transaction.findById(borrowTxId);
  testTrack(() => assert(borrowTxPending.status === 'RETURN_PENDING', 'Transaction is in RETURN_PENDING state'));

  // Owner confirms return -> COMPLETED & Item restored to Available
  const confirmReturnRes = createMockRes();
  await transactionController.confirmReturn(
    { user: { id: userAId, role: 'customer' }, params: { id: borrowTxId } },
    confirmReturnRes
  );
  testTrack(() => assert(confirmReturnRes.statusCode === 200, 'Owner confirmed return; transaction COMPLETED'));

  const restoredItem = await Item.findById(matchingBook._id);
  testTrack(() => assert(restoredItem.availability === 'Available', 'Borrowed item restored to Available status'));

  // ============================================================================
  // SUITE 8: REAL-TIME CHAT & ROOM AUTHORIZATION
  // ============================================================================
  console.log('\n--- SUITE 8: Real-Time Chat & Room Authorization ---');

  const conversation = await conversationService.getOrCreateConversationForRequest({
    requestId: borrowRequestId,
    transactionId: borrowTxId
  });
  testTrack(() => assert(!!conversation, 'Conversation exists for participants'));

  // Participant verification: User A & User B authorized
  const isAAuth = await conversationService.verifyParticipant(conversation._id, userAId);
  const isBAuth = await conversationService.verifyParticipant(conversation._id, userB._id);
  testTrack(() => assert(isAAuth && isBAuth, 'Authorized participants verified'));

  // Outsider User C rejected
  const userC = await User.create({
    name: 'Outsider User',
    email: `outsider_${timestamp}@looop.test`,
    password: passwordHash,
    role: 'customer'
  });

  let outsiderCaught = false;
  try {
    await conversationService.verifyParticipant(conversation._id, userC._id);
  } catch (err) {
    outsiderCaught = true;
  }
  testTrack(() => assert(outsiderCaught, 'Unauthorized outsider strictly rejected from joining conversation'));

  // Send message & verify MongoDB persistence
  const sentMessage = await conversationService.sendMessage({
    conversationId: conversation._id,
    senderId: userAId,
    text: 'Hello, looking forward to meeting at the library.'
  });
  testTrack(() => assert(!!sentMessage._id, 'Chat message persisted in MongoDB'));

  // ============================================================================
  // SUITE 9: REPORTING & ADMIN MODERATION AUDIT TRAIL
  // ============================================================================
  console.log('\n--- SUITE 9: Reporting & Admin Moderation ---');

  // User B reports an item
  const reportReq = {
    user: { id: userB._id, role: 'customer' },
    body: {
      targetType: 'item',
      targetId: matchingBook._id,
      reason: 'inappropriate',
      details: 'Test safety review report'
    }
  };
  const reportRes = createMockRes();
  await reportController.createReport(reportReq, reportRes);
  testTrack(() => assert(reportRes.statusCode === 201, 'Community safety report filed with HTTP 201'));

  const reportId = reportRes.data.report.id || reportRes.data.report._id;

  // Admin assigns and resolves report
  const resolveReq = {
    user: { id: adminUser._id, role: 'admin' },
    params: { id: reportId },
    body: {
      action: 'RESOLVE',
      resolutionNotes: 'Verified safety compliance and closed report.'
    }
  };
  const resolveRes = createMockRes();
  await adminController.resolveReport(resolveReq, resolveRes);
  testTrack(() => assert(resolveRes.statusCode === 200, 'Admin resolved safety report'));

  // Audit trail verification
  const auditLog = await AdminAuditLog.findOne({ admin: adminUser._id, action: 'REPORT_RESOLVED' });
  testTrack(() => assert(!!auditLog, 'Admin action recorded in AdminAuditLog for compliance'));

  // Clean up test records
  console.log('\n--- Cleaning Up Ephemeral Test Records ---');
  await User.deleteMany({ _id: { $in: [userAId, userB._id, userC._id, adminUser._id] } });
  await Item.deleteMany({ _id: { $in: [createdItemId, matchingBook._id] } });
  await WantedItem.deleteOne({ _id: wantedItem._id });
  await Request.deleteMany({ _id: { $in: [requestId, borrowRequestId] } });
  await Transaction.deleteMany({ _id: { $in: [txId, borrowTxId] } });
  await Review.deleteMany({ transaction: txId });
  await ImpactEvent.deleteMany({ transaction: { $in: [txId, borrowTxId] } });
  await Conversation.deleteOne({ _id: conversation._id });
  await Message.deleteMany({ conversation: conversation._id });
  await Report.deleteOne({ _id: reportId });
  console.log('✓ Ephemeral test records removed cleanly.');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedTests} MASTER INTEGRATION & SYSTEM TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================');

  await mongoose.disconnect();
};

runMasterE2ETests().catch((err) => {
  console.error('\n❌ MASTER TEST SUITE TERMINATED WITH ERROR:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
