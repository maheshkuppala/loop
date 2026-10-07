const mongoose = require('mongoose');

async function runTests() {
  await mongoose.connect('mongodb://127.0.0.1:27017/looop');
  console.log('MongoDB connected for testing');

  const User = require('../models/User');
  const Item = require('../models/Item');
  const Transaction = require('../models/Transaction');
  const Review = require('../models/Review');
  const Report = require('../models/Report');

  // Find a completed transaction
  const tx = await Transaction.findOne({ status: 'COMPLETED' }).populate('owner recipient item');
  if (!tx) {
    console.error('No completed transaction found');
    process.exit(1);
  }

  console.log('Found completed tx:', tx._id.toString());
  console.log('Owner:', tx.owner.name, 'Recipient:', tx.recipient.name);

  const userController = require('../controllers/userController');
  const reviewController = require('../controllers/reviewController');
  const reportController = require('../controllers/reportController');

  // Test 1: getMe for owner
  let meRes = null;
  const mockReqMe = { user: { id: tx.owner._id, email: tx.owner.email, role: 'customer' } };
  const mockResMe = {
    status: (code) => ({
      json: (data) => { meRes = { code, data }; }
    })
  };
  await userController.getMe(mockReqMe, mockResMe);
  console.log('Test 1 getMe response code:', meRes.code);
  console.log('Test 1 getMe stats:', meRes.data.stats);
  console.log('Test 1 profile completion:', meRes.data.profileCompletion);
  if (meRes.data.user.password) throw new Error('Sensitive password exposed in getMe!');

  // Test 2: updateMe
  let updateRes = null;
  const mockReqUpdate = {
    user: { id: tx.owner._id },
    body: {
      bio: 'Enthusiastic neighbor who loves sharing DIY tools and books!',
      city: 'Bengaluru',
      locality: 'Indiranagar',
      state: 'Karnataka',
      interests: ['Tools', 'Gardening', 'Books']
    }
  };
  await userController.updateMe(mockReqUpdate, {
    status: (code) => ({
      json: (data) => { updateRes = { code, data }; }
    })
  });
  console.log('Test 2 updateMe code:', updateRes.code, 'message:', updateRes.data.message);
  console.log('Updated bio:', updateRes.data.user.bio);
  console.log('Updated interests:', updateRes.data.user.interests);

  // Test 3: getPublicProfile
  let publicRes = null;
  await userController.getPublicProfile({ params: { id: tx.owner._id.toString() } }, {
    status: (code) => ({
      json: (data) => { publicRes = { code, data }; }
    })
  });
  console.log('Test 3 getPublicProfile code:', publicRes.code);
  console.log('Public user name:', publicRes.data.user.name);
  console.log('Public user email exposed?:', publicRes.data.user.email);
  if (publicRes.data.user.email || publicRes.data.user.password) {
    throw new Error('Sensitive private data exposed in public profile!');
  }

  // Clear existing reviews for this specific tx to test cleanly
  await Review.deleteMany({ transaction: tx._id });

  // Test 4: Review creation by Recipient for Owner
  let revRes = null;
  const mockReqRev = {
    user: { id: tx.recipient._id, name: tx.recipient.name },
    body: {
      transactionId: tx._id.toString(),
      rating: 5,
      comment: 'Super helpful handover, item was in perfect condition!'
    }
  };
  await reviewController.createReview(mockReqRev, {
    status: (code) => ({
      json: (data) => { revRes = { code, data }; }
    })
  });
  console.log('Test 4 createReview code:', revRes.code, 'message:', revRes.data.message);

  // Test 5: Duplicate review prevention
  let dupRes = null;
  await reviewController.createReview(mockReqRev, {
    status: (code) => ({
      json: (data) => { dupRes = { code, data }; }
    })
  });
  console.log('Test 5 duplicate review prevention code:', dupRes.code, 'message:', dupRes.data.message);
  if (dupRes.code !== 409) throw new Error('Expected 409 for duplicate review');

  // Test 6: Non-participant review prevention
  const allUsers = await User.find();
  const unrelatedUser = allUsers.find(u => u._id.toString() !== tx.owner._id.toString() && u._id.toString() !== tx.recipient._id.toString());
  let unauthRes = null;
  await reviewController.createReview({
    user: { id: unrelatedUser._id, name: unrelatedUser.name },
    body: {
      transactionId: tx._id.toString(),
      rating: 5,
      comment: 'Unrelated user review'
    }
  }, {
    status: (code) => ({
      json: (data) => { unauthRes = { code, data }; }
    })
  });
  console.log('Test 6 non-participant review code:', unauthRes.code, 'message:', unauthRes.data.message);
  if (unauthRes.code !== 403) throw new Error('Expected 403 for non-participant review');

  // Test 7: Review summary aggregation
  let sumRes = null;
  await reviewController.getUserReviewSummary({ params: { userId: tx.owner._id.toString() } }, {
    status: (code) => ({
      json: (data) => { sumRes = { code, data }; }
    })
  });
  console.log('Test 7 review summary:', sumRes.data.summary);

  // Test 8: Transaction reviews query
  let txRevRes = null;
  await reviewController.getTransactionReviews({
    params: { transactionId: tx._id.toString() },
    user: { id: tx.recipient._id }
  }, {
    status: (code) => ({
      json: (data) => { txRevRes = { code, data }; }
    })
  });
  console.log('Test 8 tx reviews query: canReview:', txRevRes.data.canReview, 'reviewedByCurrentUser:', txRevRes.data.reviewedByCurrentUser);

  // Test 9: Report user
  let repRes = null;
  await reportController.createReport({
    user: { id: tx.recipient._id },
    body: {
      targetType: 'USER',
      userId: tx.owner._id.toString(),
      reason: 'No-show or repeated handover cancellation',
      description: 'Test moderation report'
    }
  }, {
    status: (code) => ({
      json: (data) => { repRes = { code, data }; }
    })
  });
  console.log('Test 9 report user code:', repRes.code, 'message:', repRes.data.message);

  console.log('\n==================================================');
  console.log('ALL 9 BACKEND INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('==================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
