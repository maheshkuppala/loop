const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const AdminSetting = require('../models/AdminSetting');
const notificationService = require('./notificationService');
const { sendLooopEmail } = require('./brevoService');

/**
 * LOOOP Points Service
 * Central service for reading admin point configurations, calculating rewards,
 * preventing duplicate point awards, updating user balances, and creating ledger records.
 */
class PointsService {
  /**
   * Fetch current admin point configurations with safe defaults
   */
  async getPointsSettings() {
    try {
      const settings = await AdminSetting.find({
        key: { $in: ['points_enabled', 'points_reuse', 'points_borrow', 'points_return_borrow'] }
      });

      const settingMap = {};
      settings.forEach((s) => {
        settingMap[s.key] = s.value;
      });

      return {
        enabled: settingMap.points_enabled !== undefined ? Boolean(settingMap.points_enabled) : true,
        reusePoints: settingMap.points_reuse !== undefined ? Number(settingMap.points_reuse) : 100,
        borrowPoints: settingMap.points_borrow !== undefined ? Number(settingMap.points_borrow) : 50,
        returnPoints: settingMap.points_return_borrow !== undefined ? Number(settingMap.points_return_borrow) : 25
      };
    } catch (err) {
      console.warn('[PointsService] Error loading admin settings, using defaults:', err.message);
      return {
        enabled: true,
        reusePoints: 100,
        borrowPoints: 50,
        returnPoints: 25
      };
    }
  }

  /**
   * Award points for a completed transaction cleanly and idempotently.
   * STRICT SECURITY RULE: Recipient (customer) receives points. Prevents duplicate awards.
   */
  async awardPointsForTransaction(transactionId) {
    if (!transactionId) return null;

    try {
      const transaction = await Transaction.findById(transactionId)
        .populate('item', 'title sharingType')
        .populate('recipient', 'name email points');

      if (!transaction) {
        console.warn(`[PointsService] Transaction ${transactionId} not found.`);
        return null;
      }

      // IDEMPOTENCY GUARD: Do NOT award points multiple times!
      if (transaction.pointsAwarded) {
        console.log(`[PointsService] Transaction ${transactionId} has already been awarded points. Skipping duplicate award.`);
        return {
          alreadyAwarded: true,
          amount: transaction.pointsAwardedAmount,
          transactionId: transaction._id
        };
      }

      // Must be COMPLETED
      if (transaction.status !== 'COMPLETED') {
        console.warn(`[PointsService] Cannot award points for non-completed transaction status: ${transaction.status}`);
        return null;
      }

      const settings = await this.getPointsSettings();
      if (!settings.enabled) {
        console.log('[PointsService] Points system is currently disabled by Admin.');
        return null;
      }

      // Determine points & transaction classification
      const isBorrow = transaction.type === 'BORROW';
      const reward = isBorrow ? settings.borrowPoints : settings.reusePoints;
      const typeEnum = isBorrow ? 'BORROW_EARNED' : 'REUSE_EARNED';
      const itemTitle = transaction.item?.title || 'item';
      const reason = isBorrow ? `Borrowed ${itemTitle}` : `Received ${itemTitle}`;

      const recipientUser = transaction.recipient;
      if (!recipientUser) {
        console.error('[PointsService] Cannot award points: Recipient user missing.');
        return null;
      }

      const recipientId = recipientUser._id || recipientUser.id;

      // 1. Credit recipient points atomically
      const updatedUser = await User.findByIdAndUpdate(
        recipientId,
        { $inc: { points: reward } },
        { new: true }
      );

      const newBalance = updatedUser ? updatedUser.points : (recipientUser.points || 0) + reward;

      // 2. Create ledger entry
      const ledgerEntry = new PointsLedger({
        user: recipientId,
        amount: reward,
        type: typeEnum,
        reason: `${reason} (Completed)`,
        transaction: transaction._id,
        item: transaction.item?._id || transaction.item,
        balanceAfter: newBalance
      });
      await ledgerEntry.save();

      // 3. Mark transaction as points awarded
      transaction.pointsAwarded = true;
      transaction.pointsAwardedAmount = reward;
      transaction.pointsAwardedAt = new Date();
      await transaction.save();

      console.log(`[PointsService] Successfully awarded +${reward} points to customer ${recipientUser.email || recipientId}. New balance: ${newBalance}`);

      // 4. In-App Notification for Points Earned
      notificationService.createNotification({
        recipient: recipientId,
        type: 'POINTS_EARNED',
        category: 'ACCOUNT',
        title: `You earned +${reward} Points! 🎉`,
        message: `You earned ${reward} points for completing your ${isBorrow ? 'borrowing' : 'reuse'} of "${itemTitle}". Total balance: ${newBalance} points.`,
        link: '/points',
        dedupeKey: `POINTS_EARNED:${transaction._id}`,
        relatedEntityType: 'Transaction',
        relatedEntityId: transaction._id,
        relatedTransaction: transaction._id
      }).catch((err) => console.error('[PointsService] Notification error:', err.message));

      // 5. Transactional Email for Points Earned
      if (recipientUser.email) {
        sendLooopEmail({
          toEmail: recipientUser.email,
          recipientName: recipientUser.name || 'Member',
          templateType: 'pointsEarnedCustomer',
          templateParams: {
            pointsAmount: reward,
            itemTitle,
            transactionType: isBorrow ? 'Borrowing' : 'Reuse',
            newBalance,
            appUrl: process.env.CLIENT_URL || 'http://localhost:3000'
          }
        }).catch((err) => console.error('[PointsService] Email dispatch error:', err.message));
      }

      return {
        success: true,
        amount: reward,
        newBalance,
        recipientId
      };
    } catch (error) {
      console.error('[PointsService] Exception during points calculation/award:', error);
      return null;
    }
  }

  /**
   * Get complete points ledger and summary for a customer
   */
  async getPointsDashboard(userId) {
    try {
      const user = await User.findById(userId).select('points name email avatar');
      if (!user) {
        throw new Error('User not found');
      }

      const ledger = await PointsLedger.find({ user: userId })
        .populate('item', 'title images category')
        .populate('transaction', 'type status completedAt')
        .sort({ createdAt: -1 });

      let totalEarned = 0;
      let totalRedeemed = 0;

      ledger.forEach((entry) => {
        if (entry.amount > 0) {
          totalEarned += entry.amount;
        } else {
          totalRedeemed += Math.abs(entry.amount);
        }
      });

      const formatted = ledger.map((l) => ({
        ...l.toObject(),
        id: l._id
      }));

      return {
        pointsBalance: user.points || 0,
        totalEarned,
        totalRedeemed,
        historyCount: formatted.length,
        history: formatted
      };
    } catch (err) {
      console.error('[PointsService] Error in getPointsDashboard:', err);
      throw err;
    }
  }
}

module.exports = new PointsService();
