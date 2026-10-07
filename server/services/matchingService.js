const mongoose = require('mongoose');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const Match = require('../models/Match');
const notificationService = require('./notificationService');

/**
 * Matching System Configuration Constants
 */
const MATCH_NOTIFICATION_THRESHOLD = 70; // Score threshold to dispatch a WANTED_MATCH alert
const DEFAULT_SEARCH_RADIUS_KM = 25;
const MAX_SEARCH_RADIUS_KM = 100;

// Condition ranking scale (higher = better condition)
const CONDITION_RANK = {
  new: 5,
  like_new: 4,
  good: 3,
  fair: 2,
  needs_repair: 1
};

// Common stopwords to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'in', 'on', 'at', 'to', 'with', 'by',
  'is', 'it', 'of', 'from', 'as', 'any', 'item', 'product', 'used', 'unused',
  'looking', 'wanted', 'need', 'needs', 'urgent', 'please', 'help', 'good'
]);

/**
 * Calculate Haversine distance in kilometers between two [longitude, latitude] points.
 * Returns real distance in km rounded to 1 decimal place, or null if coordinates are invalid.
 */
function calculateHaversineDistanceKm(coords1, coords2) {
  if (!coords1 || !coords2 || !Array.isArray(coords1) || !Array.isArray(coords2)) {
    return null;
  }
  if (coords1.length < 2 || coords2.length < 2) {
    return null;
  }

  const [lon1, lat1] = coords1.map(Number);
  const [lon2, lat2] = coords2.map(Number);

  if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) {
    return null;
  }

  // Basic sanity check on latitude / longitude bounds
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) return null;
  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) return null;

  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Tokenize and normalize text into unique keywords
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

class MatchingService {
  constructor() {
    this.NOTIFICATION_THRESHOLD = MATCH_NOTIFICATION_THRESHOLD;
    this.DEFAULT_RADIUS_KM = DEFAULT_SEARCH_RADIUS_KM;
    this.MAX_RADIUS_KM = MAX_SEARCH_RADIUS_KM;
  }

  calculateHaversineDistanceKm(coords1, coords2) {
    return calculateHaversineDistanceKm(coords1, coords2);
  }

  /**
   * Check if sharing types are compatible
   */
  checkSharingCompatibility(itemSharing, wantedPreferred) {
    const itemType = (itemSharing || '').toLowerCase();
    const wantedType = (wantedPreferred || 'any').toLowerCase();

    if (wantedType === 'any') return true;
    if (wantedType === itemType) return true;

    // 'free' and 'give_away' are mutually compatible in community gifting
    if (
      (wantedType === 'free' || wantedType === 'give_away') &&
      (itemType === 'free' || itemType === 'give_away')
    ) {
      return true;
    }

    // If requester wanted to borrow, getting an item as free/give_away is also a welcome match
    if (wantedType === 'borrow' && (itemType === 'free' || itemType === 'give_away')) {
      return true;
    }

    return false;
  }

  /**
   * Check if condition meets requester's preference
   */
  checkConditionCompatibility(itemCondition, wantedConditionPref) {
    const itemCond = (itemCondition || 'good').toLowerCase();
    const wantedCond = (wantedConditionPref || 'any').toLowerCase();

    if (wantedCond === 'any') return true;

    const itemRank = CONDITION_RANK[itemCond] || 3;
    const wantedRank = CONDITION_RANK[wantedCond] || 3;

    return itemRank >= wantedRank;
  }

  /**
   * Calculate deterministic compatibility and relevance score between an Item and a WantedItem.
   * Returns: { isCompatible, score, matchReasons, distanceKm }
   */
  calculateMatchScore(item, wantedItem, options = {}) {
    // 1. Hard requirements check
    if (!item || !wantedItem) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null };
    }

    // Availability & Status
    const isItemActive =
      (item.status === 'active' || !item.status) &&
      (item.availability === 'Available' || !item.availability);
    if (!isItemActive) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Item is not available' };
    }

    const isWantedActive = wantedItem.status === 'ACTIVE' || !wantedItem.status;
    if (!isWantedActive) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Wanted request is not active' };
    }

    if (wantedItem.expiresAt && new Date(wantedItem.expiresAt) < new Date()) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Wanted request has expired' };
    }

    // Do not match user against their own listings
    const ownerId = item.owner?._id ? item.owner._id.toString() : item.owner?.toString();
    const requesterId = wantedItem.requester?._id ? wantedItem.requester._id.toString() : wantedItem.requester?.toString();
    if (ownerId && requesterId && ownerId === requesterId) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Cannot match own listing' };
    }

    // Category compatibility
    const itemCat = (item.category || '').toLowerCase().trim();
    const wantedCat = (wantedItem.category || '').toLowerCase().trim();
    if (itemCat !== wantedCat) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Different categories' };
    }

    // Sharing type compatibility
    const isSharingCompatible = this.checkSharingCompatibility(item.sharingType, wantedItem.preferredSharingType);
    if (!isSharingCompatible) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Incompatible sharing type' };
    }

    // Condition compatibility
    const isConditionCompatible = this.checkConditionCompatibility(item.condition, wantedItem.conditionPreference);
    if (!isConditionCompatible) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm: null, rejectionReason: 'Item condition lower than requested' };
    }

    // 2. Geographic Distance & Radius
    const itemCoords = item.locationCoordinates?.coordinates;
    const wantedCoords = wantedItem.locationCoordinates?.coordinates;
    const distanceKm = calculateHaversineDistanceKm(itemCoords, wantedCoords);

    // If max radius option was specified and coordinates exist, enforce radius check
    const maxRadius = options.radiusKm || DEFAULT_SEARCH_RADIUS_KM;
    if (distanceKm !== null && distanceKm > maxRadius) {
      return { isCompatible: false, score: 0, matchReasons: [], distanceKm, rejectionReason: `Outside radius of ${maxRadius}km` };
    }

    // 3. Multi-dimensional deterministic scoring (0 - 100)
    let score = 0;
    const matchReasons = [];

    // Dimension A: Category & Subcategory (up to 30 pts)
    score += 20;
    matchReasons.push(`Same category: ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`);

    const itemSub = (item.subcategory || 'General').toLowerCase().trim();
    const wantedSub = (wantedItem.subcategory || 'General').toLowerCase().trim();
    if (itemSub !== 'general' && wantedSub !== 'general' && itemSub === wantedSub) {
      score += 10;
      matchReasons.push(`Matching subcategory: ${item.subcategory}`);
    } else if (itemSub === wantedSub) {
      score += 5;
    }

    // Dimension B: Keyword & Title Similarity (up to 25 pts)
    const itemTitleNorm = (item.title || '').toLowerCase();
    const wantedTitleNorm = (wantedItem.title || '').toLowerCase();

    const itemTokens = extractKeywords(`${item.title} ${item.description || ''}`);
    const wantedTokens = extractKeywords(`${wantedItem.title} ${wantedItem.description || ''}`);

    let keywordScore = 0;
    if (itemTitleNorm.includes(wantedTitleNorm) || wantedTitleNorm.includes(itemTitleNorm)) {
      keywordScore = 25;
      matchReasons.push('Matching item title & keywords');
    } else if (wantedTokens.length > 0) {
      const itemTokenSet = new Set(itemTokens);
      const matches = wantedTokens.filter((token) => itemTokenSet.has(token));
      const overlapRatio = matches.length / wantedTokens.length;

      if (overlapRatio >= 0.75) {
        keywordScore = 25;
        matchReasons.push(`Strong keyword match (${matches.slice(0, 3).join(', ')})`);
      } else if (overlapRatio >= 0.4) {
        keywordScore = 18;
        matchReasons.push(`Relevant keywords found (${matches.slice(0, 2).join(', ')})`);
      } else if (overlapRatio > 0) {
        keywordScore = 10;
        matchReasons.push(`Shared keyword: ${matches[0]}`);
      }
    }
    score += keywordScore;

    // Dimension C: Sharing Compatibility (up to 15 pts)
    if (wantedItem.preferredSharingType === 'any') {
      score += 12;
      matchReasons.push(`Compatible with '${item.sharingType.replace('_', ' ')}'`);
    } else if (
      item.sharingType === wantedItem.preferredSharingType ||
      ((item.sharingType === 'free' || item.sharingType === 'give_away') &&
        (wantedItem.preferredSharingType === 'free' || wantedItem.preferredSharingType === 'give_away'))
    ) {
      score += 15;
      matchReasons.push(`Compatible sharing preference (${item.sharingType.replace('_', ' ')})`);
    } else {
      score += 8;
    }

    // Dimension D: Condition Compatibility (up to 15 pts)
    const itemRank = CONDITION_RANK[item.condition] || 3;
    const wantedRank = CONDITION_RANK[wantedItem.conditionPreference] || 3;

    if (wantedItem.conditionPreference === 'any') {
      score += 12;
      matchReasons.push(`Condition '${item.condition.replace('_', ' ')}' accepted`);
    } else if (itemRank > wantedRank) {
      score += 15;
      matchReasons.push(`Condition exceeds requested preference (${item.condition.replace('_', ' ')})`);
    } else if (itemRank === wantedRank) {
      score += 13;
      matchReasons.push(`Meets exact condition preference (${item.condition.replace('_', ' ')})`);
    }

    // Dimension E: Location Proximity (up to 15 pts)
    if (distanceKm !== null) {
      if (distanceKm <= 5) {
        score += 15;
        matchReasons.push(`Very close: approx. ${distanceKm} km away`);
      } else if (distanceKm <= 15) {
        score += 12;
        matchReasons.push(`Nearby: approx. ${distanceKm} km away`);
      } else if (distanceKm <= 30) {
        score += 8;
        matchReasons.push(`Within approx. ${distanceKm} km`);
      } else if (distanceKm <= 50) {
        score += 4;
        matchReasons.push(`Approx. ${distanceKm} km away`);
      }
    } else {
      // Coordinate fallback: compare text fields
      const itemCity = (item.location?.city || '').toLowerCase().trim();
      const wantedCity = (wantedItem.location?.city || '').toLowerCase().trim();
      const itemLocality = (item.location?.locality || '').toLowerCase().trim();
      const wantedLocality = (wantedItem.location?.locality || '').toLowerCase().trim();
      const itemDistrict = (item.location?.district || '').toLowerCase().trim();
      const wantedDistrict = (wantedItem.location?.district || '').toLowerCase().trim();

      if (itemLocality && wantedLocality && itemLocality === wantedLocality) {
        score += 14;
        matchReasons.push(`Located in same neighborhood (${item.location.locality})`);
      } else if (itemCity && wantedCity && itemCity === wantedCity) {
        score += 11;
        matchReasons.push(`Located in same city (${item.location.city})`);
      } else if (itemDistrict && wantedDistrict && itemDistrict === wantedDistrict) {
        score += 7;
        matchReasons.push(`Located in same district (${item.location.district})`);
      } else {
        score += 2;
      }
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      isCompatible: true,
      score: finalScore,
      matchReasons,
      distanceKm
    };
  }

  /**
   * Find and persist matches for a specific Item against active WantedItems
   */
  async findMatchesForItem(itemIdOrDoc, options = {}) {
    try {
      let item = itemIdOrDoc;
      if (!item || !item._id || !item.category) {
        item = await Item.findById(itemIdOrDoc);
      }
      if (!item || item.status !== 'active' || item.availability !== 'Available') {
        return [];
      }

      // Query active wanted items in the same category
      const wantedQuery = {
        category: item.category,
        status: 'ACTIVE',
        requester: { $ne: item.owner }
      };

      const candidates = await WantedItem.find(wantedQuery)
        .limit(50)
        .populate('requester', 'name avatar trustScore rating city');
      const matches = [];

      for (const wanted of candidates) {
        const result = this.calculateMatchScore(item, wanted, options);
        if (result.isCompatible && result.score >= (options.minScore || 40)) {
          // Upsert Match record
          const matchRecord = await Match.findOneAndUpdate(
            { item: item._id, wantedItem: wanted._id },
            {
              item: item._id,
              wantedItem: wanted._id,
              itemOwner: item.owner,
              requester: wanted.requester?._id || wanted.requester,
              score: result.score,
              matchReasons: result.matchReasons,
              distanceKm: result.distanceKm,
              status: 'ACTIVE',
              lastEvaluatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          matches.push({
            matchId: matchRecord._id,
            wantedItem: wanted,
            score: result.score,
            matchReasons: result.matchReasons,
            distanceKm: result.distanceKm,
            notified: matchRecord.notified
          });
        }
      }

      // Sort by highest score first
      matches.sort((a, b) => b.score - a.score);
      return matches;
    } catch (error) {
      console.error('[MatchingService] Error in findMatchesForItem:', error);
      return [];
    }
  }

  /**
   * Find and persist matches for a specific WantedItem against available Items
   */
  async findMatchesForWantedItem(wantedIdOrDoc, options = {}) {
    try {
      let wanted = wantedIdOrDoc;
      if (!wanted || !wanted._id || !wanted.category) {
        wanted = await WantedItem.findById(wantedIdOrDoc);
      }
      if (!wanted || wanted.status !== 'ACTIVE') {
        return [];
      }

      // Query available items in same category
      const itemQuery = {
        category: wanted.category,
        status: 'active',
        availability: 'Available',
        owner: { $ne: wanted.requester }
      };

      const candidates = await Item.find(itemQuery)
        .limit(50)
        .populate('owner', 'name avatar trustScore rating responseRate');
      const matches = [];

      for (const item of candidates) {
        const result = this.calculateMatchScore(item, wanted, options);
        if (result.isCompatible && result.score >= (options.minScore || 40)) {
          // Upsert Match record
          const matchRecord = await Match.findOneAndUpdate(
            { item: item._id, wantedItem: wanted._id },
            {
              item: item._id,
              wantedItem: wanted._id,
              itemOwner: item.owner?._id || item.owner,
              requester: wanted.requester,
              score: result.score,
              matchReasons: result.matchReasons,
              distanceKm: result.distanceKm,
              status: 'ACTIVE',
              lastEvaluatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          // Build privacy-safe item representation
          const safeItem = {
            _id: item._id,
            id: item._id,
            title: item.title,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            sharingType: item.sharingType,
            condition: item.condition,
            availability: item.availability,
            images: item.images,
            location: {
              city: item.location?.city,
              locality: item.location?.locality,
              district: item.location?.district,
              state: item.location?.state
            },
            owner: item.owner
          };

          matches.push({
            matchId: matchRecord._id,
            item: safeItem,
            score: result.score,
            matchReasons: result.matchReasons,
            distanceKm: result.distanceKm,
            notified: matchRecord.notified
          });
        }
      }

      // Sort by highest score first
      matches.sort((a, b) => b.score - a.score);
      return matches;
    } catch (error) {
      console.error('[MatchingService] Error in findMatchesForWantedItem:', error);
      return [];
    }
  }

  /**
   * Async trigger called when a new Item is published
   * Finds matching active WantedItems and sends real notifications where score >= 70
   */
  async triggerMatchingForItem(item) {
    try {
      if (!item || !item._id) return;
      const matches = await this.findMatchesForItem(item);

      for (const match of matches) {
        if (match.score >= this.NOTIFICATION_THRESHOLD && !match.notified) {
          await notificationService.notifyWantedMatch({
            requester: match.wantedItem.requester?._id || match.wantedItem.requester,
            item,
            wantedItem: match.wantedItem,
            distanceKm: match.distanceKm,
            matchScore: match.score
          });

          // Mark match as notified in DB to prevent duplicate alerts
          await Match.findByIdAndUpdate(match.matchId, { notified: true });
        }
      }
    } catch (error) {
      console.error('[MatchingService] Error in triggerMatchingForItem:', error.message);
    }
  }

  /**
   * Alias for triggerMatchingForItem
   */
  async notifyMatchesForItem(item) {
    return this.triggerMatchingForItem(item);
  }

  /**
   * Async trigger called when a new WantedItem is posted
   * Finds matching available Items and sends real notifications where score >= 70
   */
  async triggerMatchingForWanted(wantedItem) {
    try {
      if (!wantedItem || !wantedItem._id) return;
      const matches = await this.findMatchesForWantedItem(wantedItem);

      for (const match of matches) {
        if (match.score >= this.NOTIFICATION_THRESHOLD && !match.notified) {
          await notificationService.notifyWantedMatch({
            requester: wantedItem.requester,
            item: match.item,
            wantedItem,
            distanceKm: match.distanceKm,
            matchScore: match.score
          });

          // Mark match as notified in DB
          await Match.findByIdAndUpdate(match.matchId, { notified: true });
        }
      }
    } catch (error) {
      console.error('[MatchingService] Error in triggerMatchingForWanted:', error.message);
    }
  }

  /**
   * Invalidate matches when an item becomes unavailable or is deleted
   */
  async invalidateItemMatches(itemId) {
    try {
      await Match.updateMany(
        { item: itemId, status: 'ACTIVE' },
        { status: 'EXPIRED' }
      );
    } catch (error) {
      console.error('[MatchingService] Error invalidating item matches:', error);
    }
  }

  /**
   * Invalidate matches when a wanted item is fulfilled, closed, or expired
   */
  async invalidateWantedMatches(wantedItemId, newStatus = 'EXPIRED') {
    try {
      await Match.updateMany(
        { wantedItem: wantedItemId, status: 'ACTIVE' },
        { status: newStatus }
      );
    } catch (error) {
      console.error('[MatchingService] Error invalidating wanted matches:', error);
    }
  }
}

module.exports = new MatchingService();
