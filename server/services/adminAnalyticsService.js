const User = require('../models/User');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const { getStartDateForRange } = require('./adminDashboardService');

const analyticsCache = new Map();
const CACHE_TTL_MS = 15000;

/**
 * Returns aggregated platform analytics using real MongoDB data
 */
const getPlatformAnalytics = async (range = '30d') => {
  const cacheKey = `analytics_${range.toLowerCase()}`;
  const cached = analyticsCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const startDate = getStartDateForRange(range);

  // Execute all aggregations and counts in parallel for optimal throughput
  const [
    userGrowth,
    itemGrowth,
    transactionTrends,
    requestTrends,
    itemsByCategory,
    wantedByCategory,
    sharingTypeBreakdown,
    reportsByStatus,
    reportsByTargetType,
    topCities,
    totalUsers,
    totalItems,
    totalWanted,
    totalTransactions,
    totalReports
  ] = await Promise.all([
    // 1. User Growth Over Time
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    // 2. Items Created Over Time
    Item.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    // 3. Transactions Completed Over Time
    Transaction.aggregate([
      { $match: { status: 'COMPLETED', updatedAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    // 4. Requests Created Over Time
    Request.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    // 5. Category Distribution for Items
    Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // 6. Category Distribution for Wanted Items
    WantedItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // 7. Sharing Type Breakdown
    Item.aggregate([
      { $group: { _id: '$sharingType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // 8. Reports by Status
    Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // 9. Reports by Target Type
    Report.aggregate([
      { $group: { _id: '$targetType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    // 10. Privacy-Safe Geographic Aggregation
    Item.aggregate([
      { $match: { 'location.city': { $exists: true, $ne: '' } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    // Summary counts
    User.countDocuments(),
    Item.countDocuments(),
    WantedItem.countDocuments(),
    Transaction.countDocuments(),
    Report.countDocuments()
  ]);

  const result = {
    range,
    totals: {
      users: totalUsers,
      items: totalItems,
      wanted: totalWanted,
      transactions: totalTransactions,
      reports: totalReports
    },
    trends: {
      users: userGrowth.map(u => ({ date: u._id, count: u.count })),
      items: itemGrowth.map(i => ({ date: i._id, count: i.count })),
      transactions: transactionTrends.map(t => ({ date: t._id, count: t.count })),
      requests: requestTrends.map(r => ({ date: r._id, count: r.count }))
    },
    distributions: {
      itemsByCategory: itemsByCategory.map(c => ({ category: c._id || 'other', count: c.count })),
      wantedByCategory: wantedByCategory.map(c => ({ category: c._id || 'other', count: c.count })),
      sharingTypes: sharingTypeBreakdown.map(s => ({ type: s._id || 'give_away', count: s.count })),
      reportsByStatus: reportsByStatus.map(r => ({ status: r._id || 'PENDING', count: r.count })),
      reportsByTargetType: reportsByTargetType.map(r => ({ targetType: r._id || 'ITEM', count: r.count })),
      topCities: topCities.map(c => ({ city: c._id, count: c.count }))
    }
  };

  analyticsCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
};

module.exports = {
  getPlatformAnalytics
};
