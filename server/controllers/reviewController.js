const mongoose = require('mongoose');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Item = require('../models/Item');
const notificationService = require('../services/notificationService');

/**
 * Helper to recalculate and persist average rating and review counts
 * for a user based strictly on Review documents.
 */
const recalculateUserRating = async (userId) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const stats = await Review.aggregate([
      { $match: { reviewee: objectId } },
      {
        $group: {
          _id: '$reviewee',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    const count = stats.length > 0 ? stats[0].count : 0;

    await User.findByIdAndUpdate(objectId, {
      rating: averageRating,
      reviewsCount: count
    });

    return { averageRating, count };
  } catch (err) {
    console.error('Error recalculating user rating:', err);
    return null;
  }
};

/**
 * 1. Create a Review for a Completed Transaction
 * POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const reviewerId = req.user?.id || req.user?._id;
    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { transactionId, rating, comment } = req.body;

    if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ success: false, message: 'A valid transaction ID is required.' });
    }

    // Validate Rating: Must be an integer between 1 and 5
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.'
      });
    }

    // Validate Transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Rule: Transaction MUST be COMPLETED
    if (transaction.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'You can review this member only after the transaction is completed.'
      });
    }

    // Rule: Reviewer must be a verified participant (owner or recipient)
    const isOwner = transaction.owner.toString() === reviewerId.toString();
    const isRecipient = transaction.recipient.toString() === reviewerId.toString();

    if (!isOwner && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not an authorized participant in this transaction.'
      });
    }

    // Rule: Identify reviewee (opposite participant)
    const revieweeId = isOwner ? transaction.recipient : transaction.owner;

    // Rule: Cannot review oneself
    const requestedTarget = req.body.reviewedUserId || req.body.revieweeId || req.body.reviewee;
    if (
      reviewerId.toString() === revieweeId.toString() ||
      (requestedTarget && requestedTarget.toString() === reviewerId.toString())
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself.'
      });
    }

    if (requestedTarget && requestedTarget.toString() !== revieweeId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Target user is not the other participant in this transaction.'
      });
    }

    // Rule: Prevent duplicate review for the same transaction/reviewer/reviewee
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      transaction: transactionId,
      reviewee: revieweeId
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this transaction.'
      });
    }

    // Sanitize comment
    const cleanComment = typeof comment === 'string'
      ? comment.replace(/<[^>]*>/g, '').trim().slice(0, 1000)
      : '';

    // Create and save Review
    const newReview = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      transaction: transaction._id,
      item: transaction.item,
      rating: numRating,
      comment: cleanComment
    });

    // Recalculate real ratings for the reviewee in MongoDB
    await recalculateUserRating(revieweeId);

    // Notify reviewee in real-time
    try {
      const reviewerUser = await User.findById(reviewerId).select('name');
      const reviewerName = reviewerUser?.name || 'A community member';

      await notificationService.createNotification({
        recipient: revieweeId,
        actor: reviewerId,
        type: 'REVIEW_RECEIVED',
        title: 'New Community Review Received',
        message: `${reviewerName} gave you a ${numRating}-star rating for your completed handover.`,
        relatedEntityType: 'Review',
        relatedEntityId: newReview._id,
        relatedTransaction: transaction._id,
        relatedItem: transaction.item
      });
    } catch (notifErr) {
      console.warn('Could not dispatch review notification:', notifErr.message);
    }

    // Populate reviewer information for immediate response
    const populated = await Review.findById(newReview._id)
      .populate('reviewer', 'name avatar city state verified')
      .populate('item', 'title images category condition');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for building community trust!',
      review: populated
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this transaction.'
      });
    }
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit review. Please try again.'
    });
  }
};

/**
 * 2. Get Reviews received by a specific user (Paginated)
 * GET /api/reviews/user/:userId
 */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = { reviewee: userId };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('reviewer', 'name avatar city state verified createdAt')
        .populate('item', 'title images category condition sharingType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    const formattedReviews = reviews.map((r) => ({
      id: r._id,
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      transaction: r.transaction,
      reviewer: r.reviewer
        ? {
            id: r.reviewer._id,
            _id: r.reviewer._id,
            name: r.reviewer.name,
            avatar: r.reviewer.avatar,
            city: r.reviewer.city,
            state: r.reviewer.state,
            verified: r.reviewer.verified
          }
        : null,
      item: r.item
        ? {
            id: r.item._id,
            _id: r.item._id,
            title: r.item.title,
            images: r.item.images,
            category: r.item.category,
            condition: r.item.condition,
            sharingType: r.item.sharingType
          }
        : null
    }));

    return res.status(200).json({
      success: true,
      count: formattedReviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user reviews.'
    });
  }
};

/**
 * 3. Get Real Rating Summary & Distribution for a User
 * GET /api/reviews/user/:userId/summary
 */
exports.getUserReviewSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const [reviewAgg, reviewDistribution] = await Promise.all([
      Review.aggregate([
        { $match: { reviewee: objectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            total: { $sum: 1 }
          }
        }
      ]),
      Review.aggregate([
        { $match: { reviewee: objectId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const averageRating = reviewAgg.length > 0 ? Math.round(reviewAgg[0].averageRating * 10) / 10 : 0;
    const totalReviews = reviewAgg.length > 0 ? reviewAgg[0].total : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewDistribution.forEach((d) => {
      if (distribution[d._id] !== undefined) {
        distribution[d._id] = d.count;
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        averageRating,
        totalReviews,
        distribution
      }
    });
  } catch (error) {
    console.error('Error in getUserReviewSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve review summary.'
    });
  }
};

/**
 * 4. Get Reviews for a specific Transaction (and check review eligibility)
 * GET /api/reviews/transaction/:transactionId
 */
exports.getTransactionReviews = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const currentUserId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID format.' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const reviews = await Review.find({ transaction: transactionId })
      .populate('reviewer', 'name avatar city state verified')
      .populate('reviewee', 'name avatar city state verified')
      .sort({ createdAt: -1 });

    let canReview = false;
    let reviewedByCurrentUser = false;
    let myReview = null;

    if (currentUserId) {
      const isOwner = transaction.owner.toString() === currentUserId.toString();
      const isRecipient = transaction.recipient.toString() === currentUserId.toString();
      const isParticipant = isOwner || isRecipient;

      myReview = reviews.find((r) => r.reviewer?._id?.toString() === currentUserId.toString()) || null;
      reviewedByCurrentUser = !!myReview;

      canReview = isParticipant && transaction.status === 'COMPLETED' && !reviewedByCurrentUser;
    }

    return res.status(200).json({
      success: true,
      transactionStatus: transaction.status,
      canReview,
      reviewedByCurrentUser,
      myReview,
      reviews
    });
  } catch (error) {
    console.error('Error in getTransactionReviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve transaction reviews.'
    });
  }
};

/**
 * 5. Get Single Review by ID
 * GET /api/reviews/:id
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = await Review.findById(id)
      .populate('reviewer', 'name avatar city state verified')
      .populate('reviewee', 'name avatar city state verified')
      .populate('item', 'title images category condition');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error in getReviewById:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve review.'
    });
  }
};

/**
 * 6. Update Own Review
 * PATCH /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
  try {
    const reviewerId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Authorization: Only the author can update their own review
    if (review.reviewer.toString() !== reviewerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review.'
      });
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5 stars.'
        });
      }
      review.rating = numRating;
    }

    if (comment !== undefined) {
      review.comment = typeof comment === 'string'
        ? comment.replace(/<[^>]*>/g, '').trim().slice(0, 1000)
        : '';
    }

    await review.save();

    // Recalculate reviewee stats
    await recalculateUserRating(review.reviewee);

    const updated = await Review.findById(id)
      .populate('reviewer', 'name avatar city state verified')
      .populate('item', 'title images category condition');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review: updated
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update review.'
    });
  }
};

/**
 * 7. Delete Own Review (or by Admin)
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?._id;
    const isAdmin = req.user?.role === 'admin';
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Authorization: Author or Admin
    if (review.reviewer.toString() !== currentUserId.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.'
      });
    }

    const revieweeId = review.reviewee;
    await Review.findByIdAndDelete(id);

    // Recalculate reviewee stats
    await recalculateUserRating(revieweeId);

    return res.status(200).json({
      success: true,
      message: 'Review removed successfully.'
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to remove review.'
    });
  }
};
