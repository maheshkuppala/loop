const mongoose = require('mongoose');

async function runDiscoveryMatchingTests() {
  console.log('--- STARTING PROMPT 21 DISCOVERY & MATCHING INTEGRATION TESTS ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/looop');
  console.log('MongoDB connected successfully');

  const User = require('../models/User');
  const Item = require('../models/Item');
  const WantedItem = require('../models/WantedItem');
  const Match = require('../models/Match');
  const Notification = require('../models/Notification');
  const matchingService = require('../services/matchingService');
  const itemController = require('../controllers/itemController');
  const wantedController = require('../controllers/wantedController');

  // Find two real distinct users in MongoDB
  const users = await User.find().limit(2);
  if (users.length < 2) {
    throw new Error('Need at least 2 users in MongoDB to test matching');
  }
  const userA = users[0];
  const userB = users[1];
  console.log(`User A (Owner): ${userA.name} (${userA._id})`);
  console.log(`User B (Requester): ${userB.name} (${userB._id})`);

  // Clean up any previous test items
  await Item.deleteMany({ title: { $regex: /^TEST_/ } });
  await WantedItem.deleteMany({ title: { $regex: /^TEST_/ } });
  await Match.deleteMany({ status: 'ACTIVE', score: { $gte: 0 } });

  // SCENARIO 1: Create an available item and a compatible WantedItem
  console.log('\n--- Scenario 1: Compatible Item & WantedItem Matching ---');
  const testItemA = new Item({
    title: 'TEST_Casio Scientific Calculator FX-991',
    description: 'Fully working scientific calculator in excellent condition, ideal for engineering students.',
    category: 'electronics',
    subcategory: 'Calculators',
    sharingType: 'give_away',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    location: {
      city: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      locality: 'Brodipet',
      approximateAddress: 'Brodipet, Guntur'
    },
    locationCoordinates: {
      type: 'Point',
      coordinates: [80.4365, 16.3067] // [lng, lat]
    },
    images: [{ url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd', isPrimary: true }],
    owner: userA._id
  });
  await testItemA.save();

  const testWantedB = new WantedItem({
    title: 'TEST_Scientific Calculator',
    description: 'Looking for a scientific calculator for college exams.',
    category: 'electronics',
    subcategory: 'Calculators',
    preferredSharingType: 'give_away',
    conditionPreference: 'good',
    urgency: 'high',
    status: 'ACTIVE',
    location: {
      city: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      locality: 'Brodipet',
      approximateAddress: 'Brodipet, Guntur'
    },
    locationCoordinates: {
      type: 'Point',
      coordinates: [80.4370, 16.3070] // [lng, lat] ~50 meters away
    },
    requester: userB._id
  });
  await testWantedB.save();

  const match1 = matchingService.calculateMatchScore(testItemA, testWantedB);
  console.log('Scenario 1 Match Result:', {
    isCompatible: match1.isCompatible,
    score: match1.score,
    distanceKm: match1.distanceKm,
    matchReasons: match1.matchReasons
  });
  if (!match1.isCompatible || match1.score < 70) {
    throw new Error(`Scenario 1 failed: Expected compatible match with score >= 70, got score ${match1.score}`);
  }
  console.log('✓ Scenario 1 Passed: Compatible match detected with high relevance score and reasons');

  // SCENARIO 2: Unrelated category item
  console.log('\n--- Scenario 2: Unrelated Category Matching ---');
  const unrelatedWanted = new WantedItem({
    title: 'TEST_Study Desk',
    description: 'Looking for a wooden study desk for reading.',
    category: 'furniture',
    preferredSharingType: 'give_away',
    conditionPreference: 'good',
    status: 'ACTIVE',
    location: { city: 'Guntur' },
    requester: userB._id
  });
  await unrelatedWanted.save();

  const match2 = matchingService.calculateMatchScore(testItemA, unrelatedWanted);
  console.log('Scenario 2 Match Result:', { isCompatible: match2.isCompatible, rejectionReason: match2.rejectionReason });
  if (match2.isCompatible) {
    throw new Error('Scenario 2 failed: Unrelated category should not match');
  }
  console.log('✓ Scenario 2 Passed: Unrelated category correctly rejected');

  // SCENARIO 3: Incompatible Sharing Type
  console.log('\n--- Scenario 3: Same Category, Incompatible Sharing Type ---');
  const incompatibleSharingItem = new Item({
    title: 'TEST_Exchange Only Calculator',
    description: 'Looking to strictly exchange for books.',
    category: 'electronics',
    sharingType: 'exchange',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    location: { city: 'Guntur' },
    images: [{ url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd' }],
    owner: userA._id
  });
  await incompatibleSharingItem.save();

  const borrowWanted = new WantedItem({
    title: 'TEST_Calculator to Borrow',
    description: 'Need to borrow for 2 days.',
    category: 'electronics',
    preferredSharingType: 'borrow',
    conditionPreference: 'good',
    status: 'ACTIVE',
    location: { city: 'Guntur' },
    requester: userB._id
  });
  await borrowWanted.save();

  const match3 = matchingService.calculateMatchScore(incompatibleSharingItem, borrowWanted);
  console.log('Scenario 3 Match Result:', { isCompatible: match3.isCompatible, rejectionReason: match3.rejectionReason });
  if (match3.isCompatible) {
    throw new Error('Scenario 3 failed: Incompatible sharing type (exchange vs borrow) should not match');
  }
  console.log('✓ Scenario 3 Passed: Incompatible sharing type correctly rejected');

  // SCENARIO 4: Outside Selected Radius
  console.log('\n--- Scenario 4: Distance Filtering Outside Selected Radius ---');
  const farItem = new Item({
    title: 'TEST_Delhi Calculator',
    description: 'Available calculator in Delhi.',
    category: 'electronics',
    sharingType: 'give_away',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    location: { city: 'New Delhi' },
    locationCoordinates: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi (~1300km from Guntur)
    },
    images: [{ url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd' }],
    owner: userA._id
  });
  await farItem.save();

  const match4 = matchingService.calculateMatchScore(farItem, testWantedB, { radiusKm: 25 });
  console.log('Scenario 4 Match Result:', { isCompatible: match4.isCompatible, distanceKm: match4.distanceKm, rejectionReason: match4.rejectionReason });
  if (match4.isCompatible || match4.distanceKm < 1000) {
    throw new Error(`Scenario 4 failed: Far distance item should exceed radius of 25km. Distance: ${match4.distanceKm}`);
  }
  console.log(`✓ Scenario 4 Passed: Far distance item correctly rejected (Distance: ~${match4.distanceKm} km > 25 km)`);

  // SCENARIO 5: Item Becomes Unavailable
  console.log('\n--- Scenario 5: Item Becomes Unavailable ---');
  testItemA.availability = 'Unavailable';
  await testItemA.save();

  const match5 = matchingService.calculateMatchScore(testItemA, testWantedB);
  console.log('Scenario 5 Match Result:', { isCompatible: match5.isCompatible, rejectionReason: match5.rejectionReason });
  if (match5.isCompatible) {
    throw new Error('Scenario 5 failed: Unavailable item must not be matched');
  }
  // Restore for subsequent tests
  testItemA.availability = 'Available';
  await testItemA.save();
  console.log('✓ Scenario 5 Passed: Unavailable items excluded from active matching');

  // SCENARIO 6: WantedItem Expires
  console.log('\n--- Scenario 6: WantedItem Expires ---');
  testWantedB.expiresAt = new Date(Date.now() - 3600000); // 1 hour ago
  await testWantedB.save();

  const match6 = matchingService.calculateMatchScore(testItemA, testWantedB);
  console.log('Scenario 6 Match Result:', { isCompatible: match6.isCompatible, rejectionReason: match6.rejectionReason });
  if (match6.isCompatible) {
    throw new Error('Scenario 6 failed: Expired wanted request must not be matched');
  }
  testWantedB.expiresAt = null;
  await testWantedB.save();
  console.log('✓ Scenario 6 Passed: Expired wanted items excluded from matching');

  // SCENARIO 7: Notification Deduplication
  console.log('\n--- Scenario 7: Notification Deduplication ---');
  // Trigger matching twice
  await matchingService.triggerMatchingForItem(testItemA);
  await matchingService.triggerMatchingForItem(testItemA);

  const notifications = await Notification.find({
    recipient: userB._id,
    type: 'WANTED_MATCH',
    relatedItem: testItemA._id,
    relatedWantedItem: testWantedB._id
  });
  console.log(`Scenario 7: Total WANTED_MATCH notifications created: ${notifications.length}`);
  if (notifications.length > 1) {
    throw new Error(`Scenario 7 failed: Duplicate notifications created (${notifications.length})`);
  }
  console.log('✓ Scenario 7 Passed: Duplicate notifications strictly prevented');

  // SCENARIO 8: City Search in Discovery API
  console.log('\n--- Scenario 8: Discover API with City Filter ---');
  let cityRes = null;
  const mockReqCity = {
    query: {
      city: 'Guntur',
      category: 'electronics'
    }
  };
  const mockResCity = {
    status: (code) => ({
      json: (data) => { cityRes = { code, data }; }
    })
  };
  await itemController.discoverItems(mockReqCity, mockResCity);
  console.log('Scenario 8 discoverItems response code:', cityRes.code);
  console.log('Items found in Guntur:', cityRes.data.items?.length);
  const foundGuntur = cityRes.data.items?.some((i) => i.location?.city === 'Guntur');
  if (!foundGuntur) {
    throw new Error('Scenario 8 failed: Discover API did not return items in Guntur');
  }
  console.log('✓ Scenario 8 Passed: City-based discovery returns real MongoDB results');

  // SCENARIO 9: "Near Me" Geospatial Distance Calculation
  console.log('\n--- Scenario 9: Discover API with Coordinates ("Near Me") ---');
  let nearRes = null;
  const mockReqNear = {
    query: {
      latitude: '16.3067',
      longitude: '80.4365',
      radius: '25',
      sort: 'nearest'
    }
  };
  const mockResNear = {
    status: (code) => ({
      json: (data) => { nearRes = { code, data }; }
    })
  };
  await itemController.discoverItems(mockReqNear, mockResNear);
  console.log('Scenario 9 discoverItems response code:', nearRes.code);
  console.log('Items found near Guntur coords:', nearRes.data.items?.length);
  const hasCalculatedDistance = nearRes.data.items?.some((i) => i.distanceKm !== null && i.distanceKm !== undefined);
  if (!hasCalculatedDistance) {
    throw new Error('Scenario 9 failed: Backend did not return calculated distanceKm for coordinates search');
  }
  console.log('✓ Scenario 9 Passed: Real distance calculated and returned by backend for coordinates query');

  // SCENARIO 10: Location Privacy Verification
  console.log('\n--- Scenario 10: Location Privacy Verification ---');
  const sampleItem = nearRes.data.items[0];
  console.log('Sample discovered item location payload:', sampleItem.location);
  if (sampleItem.location.streetAddress || sampleItem.location.houseNumber) {
    throw new Error('Scenario 10 failed: Private street address exposed!');
  }
  if (sampleItem.owner?.password || sampleItem.owner?.email) {
    throw new Error('Scenario 10 failed: Private owner credentials exposed in public discovery!');
  }
  console.log('✓ Scenario 10 Passed: No private addresses or credentials exposed in public discovery');

  // SCENARIO 11: Wanted Matches Endpoint
  console.log('\n--- Scenario 11: GET /api/wanted/:id/matches ---');
  let wantedMatchesRes = null;
  const mockReqMatches = {
    params: { id: testWantedB._id.toString() },
    query: { minScore: 50 }
  };
  const mockResMatches = {
    status: (code) => ({
      json: (data) => { wantedMatchesRes = { code, data }; }
    })
  };
  await wantedController.getWantedMatches(mockReqMatches, mockResMatches);
  console.log('Wanted matches count:', wantedMatchesRes.data.count);
  if (!wantedMatchesRes.data.matches || wantedMatchesRes.data.matches.length === 0) {
    throw new Error('Scenario 11 failed: Expected matching items for wanted request');
  }
  console.log('First matched item:', wantedMatchesRes.data.matches[0].item.title);
  console.log('Match score:', wantedMatchesRes.data.matches[0].score);
  console.log('✓ Scenario 11 Passed: Real matching items retrieved for WantedItem details page');

  // SCENARIO 12: Item Matches Endpoint
  console.log('\n--- Scenario 12: GET /api/items/:id/matches ---');
  let itemMatchesRes = null;
  const mockReqItemMatches = {
    params: { id: testItemA._id.toString() },
    query: { minScore: 50 }
  };
  const mockResItemMatches = {
    status: (code) => ({
      json: (data) => { itemMatchesRes = { code, data }; }
    })
  };
  await itemController.getItemMatches(mockReqItemMatches, mockResItemMatches);
  console.log('Item matches count:', itemMatchesRes.data.count);
  if (!itemMatchesRes.data.matches || itemMatchesRes.data.matches.length === 0) {
    throw new Error('Scenario 12 failed: Expected matching wanted requests for item');
  }
  console.log('First matched wanted request:', itemMatchesRes.data.matches[0].wantedItem.title);
  console.log('✓ Scenario 12 Passed: Real matching wanted requests retrieved for Item details page');

  // Cleanup test documents
  await Item.deleteMany({ title: { $regex: /^TEST_/ } });
  await WantedItem.deleteMany({ title: { $regex: /^TEST_/ } });

  console.log('\n===============================================================');
  console.log('🎉 ALL 12 DISCOVERY & MATCHING TEST SCENARIOS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');

  await mongoose.disconnect();
}

runDiscoveryMatchingTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
