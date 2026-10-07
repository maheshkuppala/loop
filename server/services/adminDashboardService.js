const User = require('../models/User');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const Review = require('../models/Review');
const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Parses time range string into a Date filter
 */
const getStartDateForRange = (range = '30d') => {
  const now = new Date();
  switch (range.toLowerCase()) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '12m':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

const dashboardCache = new Map();
const CACHE_TTL_MS = 15000; // 15-second TTL to avoid duplicate database scans on fast page loads

/**
 * Returns comprehensive real MongoDB statistics for the admin dashboard
 */
const getDashboardOverview = async (range = '30d') => {
  const cacheKey = `dashboard_${range.toLowerCase()}`;
  const cached = dashboardCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const startDate = getStartDateForRange(range);

  // Execute count queries concurrently using Promise.all for high performance
  const [
    totalUsers,
    activeUsers,
    totalItems,
    availableItems,
    activeWantedItems,
    pendingRequests,
    activeTransactions,
    completedTransactions,
    openReports,
    totalReviews,
    newUsersInPeriod,
    newItemsInPeriod,
    completedInPeriod
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: 'active' }),
    Item.countDocuments(),
    Item.countDocuments({ availability: 'Available', status: 'active' }),
    WantedItem.countDocuments({ status: 'ACTIVE' }),
    Request.countDocuments({ status: 'PENDING' }),
    Transaction.countDocuments({
      status: { $in: ['PENDING_HANDOVER', 'HANDOVER_SCHEDULED', 'HANDED_OVER', 'ACTIVE', 'RETURN_PENDING'] }
    }),
    Transaction.countDocuments({ status: 'COMPLETED' }),
    Report.countDocuments({ status: { $in: ['PENDING', 'REVIEWED'] } }),
    Review.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Item.countDocuments({ createdAt: { $gte: startDate } }),
    Transaction.countDocuments({ status: 'COMPLETED', updatedAt: { $gte: startDate } })
  ]);

  // Real Category Distribution aggregation from Item collection
  const categoryDistribution = await Item.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  // Real Sharing Type Distribution aggregation
  const sharingTypeDistribution = await Item.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$sharingType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Recent 5 Pending Moderation Reports
  const urgentReports = await Report.find({ status: { $in: ['PENDING', 'REVIEWED'] } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('reporter', 'name email avatar')
    .populate('targetUser', 'name email avatar')
    .populate('targetItem', 'title category images')
    .lean();

  // Recent 5 Admin Audit Logs
  const recentAuditLogs = await AdminAuditLog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('admin', 'name email avatar')
    .lean();

  // Calculate platform completion rate
  const totalCompletedOrCancelled = await Transaction.countDocuments({
    status: { $in: ['COMPLETED', 'CANCELLED'] }
  });
  const completionRate = totalCompletedOrCancelled > 0
    ? Math.round((completedTransactions / totalCompletedOrCancelled) * 100)
    : 0;

  return {
    metrics: {
      totalUsers,
      activeUsers,
      totalItems,
      availableItems,
      activeWantedItems,
      pendingRequests,
      activeTransactions,
      completedTransactions,
      openReports,
      totalReviews,
      completionRate
    },
    periodMetrics: {
      range,
      newUsers: newUsersInPeriod,
      newItems: newItemsInPeriod,
      completedTransactions: completedInPeriod
    },
    distributions: {
      categories: categoryDistribution.map(c => ({
        category: c._id || 'other',
        count: c.count
      })),
      sharingTypes: sharingTypeDistribution.map(s => ({
        type: s._id || 'give_away',
        count: s.count
      }))
    },
    urgentReports,
    recentAuditLogs
  };

  dashboardCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
};

module.exports = {
  getDashboardOverview,
  getStartDateForRange
};
