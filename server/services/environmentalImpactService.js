const mongoose = require('mongoose');
const ImpactEvent = require('../models/ImpactEvent');
const ImpactFactor = require('../models/ImpactFactor');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');

/**
 * LOOOP Environmental Impact Service
 * Core business logic for deterministic, traceable, and scientifically grounded
 * impact calculations based strictly on real completed transactions.
 */

/**
 * 1. Create or retrieve an ImpactEvent for a completed transaction (IDEMPOTENT)
 */
const createImpactForTransaction = async (transactionId) => {
  if (!transactionId) return null;

  // Idempotency check: if an ImpactEvent already exists, return it immediately
  const existingEvent = await ImpactEvent.findOne({ transaction: transactionId });
  if (existingEvent) {
    return existingEvent;
  }

  // Retrieve transaction with populated details
  const transaction = await Transaction.findById(transactionId)
    .populate('item', 'title category condition sharingType')
    .populate('offeredItem', 'title category condition sharingType');

  if (!transaction) {
    console.warn(`[ImpactService] Transaction ${transactionId} not found`);
    return null;
  }

  // STRICT RULE: Only COMPLETED transactions can generate impact
  if (transaction.status !== 'COMPLETED') {
    console.warn(`[ImpactService] Transaction ${transactionId} is status "${transaction.status}". Only COMPLETED transactions generate impact.`);
    return null;
  }

  // Determine all items qualifying for reuse in this transaction
  const qualifyingItems = [];

  // Primary item
  if (transaction.item) {
    qualifyingItems.push({
      itemId: transaction.item._id,
      title: transaction.item.title || 'Untitled Item',
      category: transaction.item.category || 'Other',
      quantity: 1
    });
  }

  // In an EXCHANGE transaction, secondary item is also handed over and reused
  if (transaction.type === 'EXCHANGE' && transaction.offeredItem) {
    qualifyingItems.push({
      itemId: transaction.offeredItem._id,
      title: transaction.offeredItem.title || 'Exchanged Item',
      category: transaction.offeredItem.category || 'Other',
      quantity: 1
    });
  }

  if (qualifyingItems.length === 0) {
    console.warn(`[ImpactService] No items associated with transaction ${transactionId}`);
    return null;
  }

  // Fetch all currently active impact factors
  const activeFactors = await ImpactFactor.find({ active: true }).lean();

  let totalReuseCount = 0;
  let totalCo2e = null;
  let totalWaste = null;
  let totalWater = null;
  let hasCo2Factor = false;
  let hasWasteFactor = false;
  let hasWaterFactor = false;

  const itemsWithFactors = [];

  for (const qItem of qualifyingItems) {
    totalReuseCount += qItem.quantity;
    const itemFactorsApplied = [];

    // Find applicable factors for this item's category or fallback 'ALL'
    const categoryLower = (qItem.category || '').toLowerCase();

    // Helper to find factor for a specific metricType
    const findFactorFor = (metricType) => {
      // 1st preference: exact category match
      const exactMatch = activeFactors.find(
        (f) => f.metricType === metricType && (f.category || '').toLowerCase() === categoryLower
      );
      if (exactMatch) return exactMatch;

      // 2nd preference: category 'ALL' fallback if defined
      return activeFactors.find(
        (f) => f.metricType === metricType && (f.category || '').toUpperCase() === 'ALL'
      );
    };

    // CO2E_AVOIDED
    const co2Factor = findFactorFor('CO2E_AVOIDED');
    if (co2Factor) {
      hasCo2Factor = true;
      const calculated = parseFloat((qItem.quantity * co2Factor.value).toFixed(2));
      totalCo2e = (totalCo2e || 0) + calculated;
      itemFactorsApplied.push({
        factorId: co2Factor._id,
        metricType: 'CO2E_AVOIDED',
        factorValue: co2Factor.value,
        unit: co2Factor.unit,
        basis: co2Factor.basis,
        source: co2Factor.source,
        calculatedValue: calculated
      });
    }

    // WASTE_AVOIDED
    const wasteFactor = findFactorFor('WASTE_AVOIDED');
    if (wasteFactor) {
      hasWasteFactor = true;
      const calculated = parseFloat((qItem.quantity * wasteFactor.value).toFixed(2));
      totalWaste = (totalWaste || 0) + calculated;
      itemFactorsApplied.push({
        factorId: wasteFactor._id,
        metricType: 'WASTE_AVOIDED',
        factorValue: wasteFactor.value,
        unit: wasteFactor.unit,
        basis: wasteFactor.basis,
        source: wasteFactor.source,
        calculatedValue: calculated
      });
    }

    // WATER_SAVED
    const waterFactor = findFactorFor('WATER_SAVED');
    if (waterFactor) {
      hasWaterFactor = true;
      const calculated = parseFloat((qItem.quantity * waterFactor.value).toFixed(2));
      totalWater = (totalWater || 0) + calculated;
      itemFactorsApplied.push({
        factorId: waterFactor._id,
        metricType: 'WATER_SAVED',
        factorValue: waterFactor.value,
        unit: waterFactor.unit,
        basis: waterFactor.basis,
        source: waterFactor.source,
        calculatedValue: calculated
      });
    }

    itemsWithFactors.push({
      ...qItem,
      factorsApplied: itemFactorsApplied
    });
  }

  // Construct notes
  const notesParts = [
    `Completed ${transaction.type} transaction.`,
    `${totalReuseCount} item(s) kept in active circulation.`
  ];
  if (!hasCo2Factor && !hasWasteFactor && !hasWaterFactor) {
    notesParts.push('Environmental conversion metrics currently unavailable pending verified impact factors for these item categories.');
  } else {
    notesParts.push('Deterministic calculation applied from verified active impact factors.');
  }

  try {
    const impactEvent = await ImpactEvent.create({
      transaction: transaction._id,
      ownerUser: transaction.owner,
      recipientUser: transaction.recipient,
      impactType: transaction.type,
      category: qualifyingItems[0]?.category || 'Other',
      quantity: totalReuseCount,
      items: itemsWithFactors,
      metrics: {
        reuseCount: totalReuseCount,
        estimatedCo2eAvoided: hasCo2Factor ? parseFloat(totalCo2e.toFixed(2)) : null,
        estimatedWasteAvoided: hasWasteFactor ? parseFloat(totalWaste.toFixed(2)) : null,
        estimatedWaterSaved: hasWaterFactor ? parseFloat(totalWater.toFixed(2)) : null
      },
      methodologyVersion: '1.0',
      factorVersion: '1.0',
      source: activeFactors.length > 0 ? 'Verified active factors snapshot' : 'No active factors configured',
      calculationNotes: notesParts.join(' ')
    });

    // Check and notify genuinely earned sustainability milestones for both participants
    checkAndNotifyMilestones(transaction.owner).catch((e) => console.warn('[MilestoneCheck] Owner check failed:', e.message));
    checkAndNotifyMilestones(transaction.recipient).catch((e) => console.warn('[MilestoneCheck] Recipient check failed:', e.message));

    return impactEvent;
  } catch (err) {
    // If unique key collision occurred due to concurrent execution, return the existing document
    if (err.code === 11000) {
      return await ImpactEvent.findOne({ transaction: transaction._id });
    }
    throw err;
  }
};

/**
 * Helper to evaluate and trigger deterministic milestone notifications
 */
const checkAndNotifyMilestones = async (userId) => {
  if (!userId) return;
  try {
    const summary = await getUserImpactSummary(userId);
    if (!summary || !summary.milestones) return;
    const notificationService = require('./notificationService');

    for (const m of summary.milestones) {
      if (m.achieved) {
        await notificationService.notifyImpactMilestone({
          userId,
          milestoneTitle: m.title,
          targetCount: m.target,
          milestoneKey: m.id
        });
      }
    }
  } catch (err) {
    console.warn(`[ImpactService] Milestone notification check error for user ${userId}:`, err.message);
  }
};

/**
 * 2. Get authenticated user's real impact summary
 */
const getUserImpactSummary = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);

  // Find all impact events involving this user
  const events = await ImpactEvent.find({
    $or: [{ ownerUser: uid }, { recipientUser: uid }]
  }).sort({ createdAt: -1 });

  let completedReuseTransactions = events.length;
  let itemsShared = 0;
  let itemsReceived = 0;
  let itemsBorrowed = 0;
  let exchangeItemsReused = 0;

  let totalCo2e = 0;
  let hasCo2e = false;
  let totalWaste = 0;
  let hasWaste = false;
  let totalWater = 0;
  let hasWater = false;

  for (const ev of events) {
    const isOwner = ev.ownerUser.toString() === userId.toString();
    const isRecipient = ev.recipientUser.toString() === userId.toString();

    if (ev.impactType === 'EXCHANGE') {
      // In exchange, both parties shared an item and received an item
      itemsShared += 1;
      itemsReceived += 1;
      exchangeItemsReused += ev.quantity;
    } else if (ev.impactType === 'BORROW') {
      if (isOwner) itemsShared += 1;
      if (isRecipient) {
        itemsReceived += 1;
        itemsBorrowed += 1;
      }
    } else {
      // FREE or GIVEAWAY
      if (isOwner) itemsShared += 1;
      if (isRecipient) itemsReceived += 1;
    }

    // Accumulate verified environmental metrics
    if (ev.metrics.estimatedCo2eAvoided !== null && ev.metrics.estimatedCo2eAvoided !== undefined) {
      totalCo2e += ev.metrics.estimatedCo2eAvoided;
      hasCo2e = true;
    }
    if (ev.metrics.estimatedWasteAvoided !== null && ev.metrics.estimatedWasteAvoided !== undefined) {
      totalWaste += ev.metrics.estimatedWasteAvoided;
      hasWaste = true;
    }
    if (ev.metrics.estimatedWaterSaved !== null && ev.metrics.estimatedWaterSaved !== undefined) {
      totalWater += ev.metrics.estimatedWaterSaved;
      hasWater = true;
    }
  }

  const totalItemsReused = itemsShared + itemsReceived;

  // Available metrics list
  const availableMetrics = [];
  if (hasCo2e) availableMetrics.push('co2eAvoided');
  if (hasWaste) availableMetrics.push('wasteAvoided');
  if (hasWater) availableMetrics.push('waterSaved');

  // Sustainability Milestones (Strictly based on real completed activity)
  const milestones = [
    {
      id: 'first_reuse',
      title: 'First Circulation',
      description: 'Completed your first successful item reuse transaction',
      target: 1,
      current: completedReuseTransactions,
      achieved: completedReuseTransactions >= 1,
      achievedAt: completedReuseTransactions >= 1 && events[events.length - 1]?.createdAt ? events[events.length - 1].createdAt : null,
      icon: 'Sparkles'
    },
    {
      id: 'giver_5',
      title: 'Community Sharer',
      description: 'Shared 5 or more items with neighbors',
      target: 5,
      current: itemsShared,
      achieved: itemsShared >= 5,
      achievedAt: null,
      icon: 'HeartHandshake'
    },
    {
      id: 'reuse_10',
      title: 'Reuse Champion',
      description: 'Participated in 10 or more item reuses in the circular loop',
      target: 10,
      current: completedReuseTransactions,
      achieved: completedReuseTransactions >= 10,
      achievedAt: null,
      icon: 'Award'
    },
    {
      id: 'reuse_25',
      title: 'Eco Guardian',
      description: 'Kept 25 or more items active in community circulation',
      target: 25,
      current: completedReuseTransactions,
      achieved: completedReuseTransactions >= 25,
      achievedAt: null,
      icon: 'ShieldCheck'
    },
    {
      id: 'reuse_50',
      title: 'Circular Pioneer',
      description: 'Helped build a zero-waste neighborhood with 50+ item handovers',
      target: 50,
      current: completedReuseTransactions,
      achieved: completedReuseTransactions >= 50,
      achievedAt: null,
      icon: 'Globe'
    }
  ];

  // Recent 5 activity records
  const recentActivity = events.slice(0, 5).map((ev) => {
    const isOwner = ev.ownerUser.toString() === userId.toString();
    const primaryItem = ev.items[0];
    return {
      id: ev._id,
      transactionId: ev.transaction,
      date: ev.createdAt,
      itemTitle: primaryItem?.title || 'Shared item',
      category: ev.category,
      impactType: ev.impactType,
      role: isOwner ? 'shared' : 'received',
      quantity: ev.quantity,
      reuseStatus: 'Completed Handover',
      co2eAvoided: ev.metrics.estimatedCo2eAvoided,
      wasteAvoided: ev.metrics.estimatedWasteAvoided,
      waterSaved: ev.metrics.estimatedWaterSaved,
      calculationNotes: ev.calculationNotes
    };
  });

  return {
    completedReuseTransactions,
    itemsShared,
    itemsReceived,
    itemsBorrowed,
    exchangeItemsReused,
    totalItemsReused,
    environmentalMetrics: {
      co2eAvoided: hasCo2e ? parseFloat(totalCo2e.toFixed(2)) : null,
      wasteAvoided: hasWaste ? parseFloat(totalWaste.toFixed(2)) : null,
      waterSaved: hasWater ? parseFloat(totalWater.toFixed(2)) : null
    },
    availableMetrics,
    methodologyVersion: '1.0',
    milestones,
    recentActivity
  };
};

/**
 * 3. Get user's paginated impact history
 */
const getUserImpactHistory = async (userId, { page = 1, limit = 10, type, category }) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const filter = {
    $or: [{ ownerUser: uid }, { recipientUser: uid }]
  };

  if (type && type !== 'all') {
    filter.impactType = type.toUpperCase();
  }
  if (category && category !== 'all') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const [total, events] = await Promise.all([
    ImpactEvent.countDocuments(filter),
    ImpactEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean()
  ]);

  const history = events.map((ev) => {
    const isOwner = ev.ownerUser.toString() === userId.toString();
    const primaryItem = ev.items[0];
    return {
      id: ev._id,
      transactionId: ev.transaction,
      date: ev.createdAt,
      itemTitle: primaryItem?.title || 'Shared item',
      category: ev.category,
      impactType: ev.impactType,
      role: isOwner ? 'shared' : 'received',
      quantity: ev.quantity,
      reuseStatus: 'Completed Handover',
      co2eAvoided: ev.metrics.estimatedCo2eAvoided,
      wasteAvoided: ev.metrics.estimatedWasteAvoided,
      waterSaved: ev.metrics.estimatedWaterSaved,
      calculationNotes: ev.calculationNotes,
      source: ev.source,
      items: ev.items
    };
  });

  return {
    total,
    page: p,
    totalPages: Math.ceil(total / l) || 1,
    history
  };
};

/**
 * 4. Get user's real monthly/yearly activity trends
 */
const getUserImpactTrends = async (userId, { range = '6m' }) => {
  const uid = new mongoose.Types.ObjectId(userId);

  let startDate = new Date();
  if (range === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (range === '3m') {
    startDate.setMonth(startDate.getMonth() - 3);
  } else if (range === '6m') {
    startDate.setMonth(startDate.getMonth() - 6);
  } else if (range === '12m') {
    startDate.setMonth(startDate.getMonth() - 12);
  } else {
    // all time
    startDate = new Date(2020, 0, 1);
  }

  const matchStage = {
    $or: [{ ownerUser: uid }, { recipientUser: uid }],
    createdAt: { $gte: startDate }
  };

  const groupFormat = range === '30d' ? '%Y-%m-%d' : '%Y-%m';

  const results = await ImpactEvent.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        transactionsCount: { $sum: 1 },
        itemsReused: { $sum: '$quantity' },
        co2eAvoided: { $sum: { $ifNull: ['$metrics.estimatedCo2eAvoided', 0] } },
        wasteAvoided: { $sum: { $ifNull: ['$metrics.estimatedWasteAvoided', 0] } },
        waterSaved: { $sum: { $ifNull: ['$metrics.estimatedWaterSaved', 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return results.map((r) => ({
    period: r._id,
    label: r._id,
    transactionsCount: r.transactionsCount,
    itemsReused: r.itemsReused,
    co2eAvoided: r.co2eAvoided ? parseFloat(r.co2eAvoided.toFixed(2)) : null,
    wasteAvoided: r.wasteAvoided ? parseFloat(r.wasteAvoided.toFixed(2)) : null,
    waterSaved: r.waterSaved ? parseFloat(r.waterSaved.toFixed(2)) : null
  }));
};

let platformSummaryCache = null;
let platformSummaryCacheTime = 0;
const PLATFORM_SUMMARY_TTL = 30000; // 30 seconds

/**
 * 5. Get platform-wide aggregated sustainability summary
 */
const getPlatformImpactSummary = async () => {
  const now = Date.now();
  if (platformSummaryCache && (now - platformSummaryCacheTime) < PLATFORM_SUMMARY_TTL) {
    return platformSummaryCache;
  }

  const [totalCompletedTransactions, categoryStats, metricSums, activeFactorsCount] = await Promise.all([
    ImpactEvent.countDocuments(),
    ImpactEvent.aggregate([
      {
        $group: {
          _id: '$category',
          itemsReused: { $sum: '$quantity' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { itemsReused: -1 } }
    ]),
    ImpactEvent.aggregate([
      {
        $group: {
          _id: null,
          totalItemsReused: { $sum: '$quantity' },
          totalCo2e: { $sum: { $ifNull: ['$metrics.estimatedCo2eAvoided', 0] } },
          hasCo2eCount: {
            $sum: {
              $cond: [{ $ne: ['$metrics.estimatedCo2eAvoided', null] }, 1, 0]
            }
          },
          totalWaste: { $sum: { $ifNull: ['$metrics.estimatedWasteAvoided', 0] } },
          hasWasteCount: {
            $sum: {
              $cond: [{ $ne: ['$metrics.estimatedWasteAvoided', null] }, 1, 0]
            }
          },
          totalWater: { $sum: { $ifNull: ['$metrics.estimatedWaterSaved', 0] } },
          hasWaterCount: {
            $sum: {
              $cond: [{ $ne: ['$metrics.estimatedWaterSaved', null] }, 1, 0]
            }
          },
          totalFree: {
            $sum: { $cond: [{ $in: ['$impactType', ['FREE', 'GIVEAWAY']] }, 1, 0] }
          },
          totalBorrow: {
            $sum: { $cond: [{ $eq: ['$impactType', 'BORROW'] }, 1, 0] }
          },
          totalExchange: {
            $sum: { $cond: [{ $eq: ['$impactType', 'EXCHANGE'] }, 1, 0] }
          }
        }
      }
    ]),
    ImpactFactor.countDocuments({ active: true })
  ]);

  const metrics = metricSums[0] || {
    totalItemsReused: 0,
    totalCo2e: 0,
    hasCo2eCount: 0,
    totalWaste: 0,
    hasWasteCount: 0,
    totalWater: 0,
    hasWaterCount: 0,
    totalFree: 0,
    totalBorrow: 0,
    totalExchange: 0
  };

  return {
    totalCompletedTransactions,
    totalItemsReused: metrics.totalItemsReused,
    totalShared: metrics.totalFree,
    totalBorrowed: metrics.totalBorrow,
    totalExchanged: metrics.totalExchange,
    environmentalMetrics: {
      co2eAvoided: metrics.hasCo2eCount > 0 ? parseFloat(metrics.totalCo2e.toFixed(2)) : null,
      wasteAvoided: metrics.hasWasteCount > 0 ? parseFloat(metrics.totalWaste.toFixed(2)) : null,
      waterSaved: metrics.hasWaterCount > 0 ? parseFloat(metrics.totalWater.toFixed(2)) : null
    },
    activeFactorsCount,
    categoryBreakdown: categoryStats.map((c) => ({
      category: c._id || 'Other',
      itemsReused: c.itemsReused,
      transactions: c.transactions
    })),
    methodologyVersion: '1.0'
  };

  platformSummaryCache = result;
  platformSummaryCacheTime = Date.now();
  return result;
};

/**
 * 6. Platform trends for admin analytics
 */
const getPlatformImpactTrends = async ({ range = '12m' }) => {
  let startDate = new Date();
  if (range === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (range === '90d' || range === '3m') startDate.setMonth(startDate.getMonth() - 3);
  else if (range === '12m') startDate.setMonth(startDate.getMonth() - 12);
  else startDate = new Date(2020, 0, 1);

  const groupFormat = range === '7d' || range === '30d' ? '%Y-%m-%d' : '%Y-%m';

  const results = await ImpactEvent.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        transactionsCount: { $sum: 1 },
        itemsReused: { $sum: '$quantity' },
        co2eAvoided: { $sum: { $ifNull: ['$metrics.estimatedCo2eAvoided', 0] } },
        wasteAvoided: { $sum: { $ifNull: ['$metrics.estimatedWasteAvoided', 0] } },
        waterSaved: { $sum: { $ifNull: ['$metrics.estimatedWaterSaved', 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return results.map((r) => ({
    period: r._id,
    label: r._id,
    transactionsCount: r.transactionsCount,
    itemsReused: r.itemsReused,
    co2eAvoided: r.co2eAvoided ? parseFloat(r.co2eAvoided.toFixed(2)) : null,
    wasteAvoided: r.wasteAvoided ? parseFloat(r.wasteAvoided.toFixed(2)) : null,
    waterSaved: r.waterSaved ? parseFloat(r.waterSaved.toFixed(2)) : null
  }));
};

/**
 * 7. Recalculate impact for a specific transaction (Admin only with audit)
 */
const recalculateImpactForTransaction = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');
  if (transaction.status !== 'COMPLETED') throw new Error('Cannot calculate impact for non-completed transaction');

  // Remove existing ImpactEvent if any, and re-create with current active factors
  await ImpactEvent.deleteOne({ transaction: transactionId });
  return await createImpactForTransaction(transactionId);
};

/**
 * 8. Sync utility for any existing completed transactions in database
 */
const syncCompletedTransactions = async () => {
  try {
    if (mongoose.connection?.readyState !== 1) {
      return { totalCompleted: 0, newlySynced: 0, message: 'Database not connected or using PostgreSQL directly' };
    }
    const completedTransactions = await Transaction.find({ status: 'COMPLETED' }).select('_id');
    let synced = 0;
    for (const t of completedTransactions) {
      const exists = await ImpactEvent.exists({ transaction: t._id });
      if (!exists) {
        await createImpactForTransaction(t._id);
        synced++;
      }
    }
    return { totalCompleted: completedTransactions.length, newlySynced: synced };
  } catch (err) {
    console.error('Error syncing completed transactions to impact:', err);
    return { error: err.message };
  }
};

module.exports = {
  createImpactForTransaction,
  getUserImpactSummary,
  getUserImpactHistory,
  getUserImpactTrends,
  getPlatformImpactSummary,
  getPlatformImpactTrends,
  recalculateImpactForTransaction,
  syncCompletedTransactions
};
