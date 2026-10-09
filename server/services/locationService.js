const Location = require('../models/Location');

const POPULAR_CITIES_DATA = [
  { name: 'Guntur', city: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', latitude: 16.3067, longitude: 80.4365, isPopular: true, order: 1 },
  { name: 'Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR', latitude: 16.5062, longitude: 80.6480, isPopular: true, order: 2 },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, isPopular: true, order: 3 },
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', latitude: 12.9716, longitude: 77.5946, isPopular: true, order: 4 },
  { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', latitude: 13.0827, longitude: 80.2707, isPopular: true, order: 5 },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', latitude: 19.0760, longitude: 72.8777, isPopular: true, order: 6 },
  { name: 'Delhi', city: 'Delhi', state: 'Delhi', district: 'Central Delhi', latitude: 28.6139, longitude: 77.2090, isPopular: true, order: 7 },
  { name: 'Pune', city: 'Pune', state: 'Maharashtra', district: 'Pune', latitude: 18.5204, longitude: 73.8567, isPopular: true, order: 8 },
  { name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, isPopular: true, order: 9 },
  { name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati', latitude: 13.6288, longitude: 79.4192, isPopular: true, order: 10 }
];

const LOCALITIES_DATA = [
  { name: 'Broadipet', type: 'LOCALITY', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3050, longitude: 80.4320 },
  { name: 'Arundelpet', type: 'LOCALITY', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3080, longitude: 80.4380 },
  { name: 'Lakshmipuram', type: 'LOCALITY', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.2990, longitude: 80.4450 },
  { name: 'Mangalagiri', type: 'TOWN', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.4300, longitude: 80.5500 },
  { name: 'Benz Circle', type: 'LOCALITY', city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5020, longitude: 80.6550 },
  { name: 'Labbipet', type: 'LOCALITY', city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5080, longitude: 80.6400 },
  { name: 'Indiranagar', type: 'LOCALITY', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9784, longitude: 77.6408 },
  { name: 'Whitefield', type: 'LOCALITY', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9698, longitude: 77.7499 },
  { name: 'HSR Layout', type: 'LOCALITY', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9121, longitude: 77.6446 },
  { name: 'Koramangala', type: 'LOCALITY', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9352, longitude: 77.6245 },
  { name: 'Hitech City', type: 'LOCALITY', city: 'Hyderabad', state: 'Telangana', latitude: 17.4435, longitude: 78.3772 },
  { name: 'Gachibowli', type: 'LOCALITY', city: 'Hyderabad', state: 'Telangana', latitude: 17.4401, longitude: 78.3489 }
];

const CITY_ALIASES = {
  hyd: 'Hyderabad',
  hyder: 'Hyderabad',
  hydera: 'Hyderabad',
  hyderabad: 'Hyderabad',
  gunt: 'Guntur',
  guntu: 'Guntur',
  guntur: 'Guntur',
  vij: 'Vijayawada',
  vija: 'Vijayawada',
  vijaya: 'Vijayawada',
  vijayawada: 'Vijayawada',
  beng: 'Bengaluru',
  bengal: 'Bengaluru',
  bang: 'Bengaluru',
  bangal: 'Bengaluru',
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  vizag: 'Visakhapatnam',
  visak: 'Visakhapatnam',
  visakha: 'Visakhapatnam',
  visakhapatnam: 'Visakhapatnam',
  chen: 'Chennai',
  chenn: 'Chennai',
  chennai: 'Chennai',
  mum: 'Mumbai',
  mumb: 'Mumbai',
  mumbai: 'Mumbai',
  del: 'Delhi',
  delh: 'Delhi',
  delhi: 'Delhi',
  pune: 'Pune',
  tiru: 'Tirupati',
  tirup: 'Tirupati',
  tirupati: 'Tirupati'
};

let hasSeeded = false;

/**
 * Seed initial popular cities into database if collection is empty
 */
async function seedDefaultLocations() {
  if (hasSeeded) return;
  try {
    const count = await Location.countDocuments();
    if (count === 0) {
      const allSeedData = [...POPULAR_CITIES_DATA, ...LOCALITIES_DATA];
      await Location.insertMany(allSeedData);
      console.log('[LocationService] Successfully seeded default popular locations and areas.');
    }
    hasSeeded = true;
  } catch (err) {
    console.warn('[LocationService] Seed warning:', err.message);
  }
}

/**
 * Get popular locations for location modal
 */
async function getPopularLocations() {
  await seedDefaultLocations();
  try {
    const populars = await Location.find({ isPopular: true, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    if (populars && populars.length > 0) {
      return populars;
    }
  } catch (err) {
    console.error('[LocationService] Error getting popular locations:', err.message);
  }
  return POPULAR_CITIES_DATA;
}

/**
 * Intelligent Location Search Autocomplete (DB + Geocoding Fallback)
 */
async function searchLocations(queryStr) {
  await seedDefaultLocations();
  const rawQuery = String(queryStr || '').trim();

  if (!rawQuery || rawQuery.length < 1) {
    return await getPopularLocations();
  }

  const aliasTarget = CITY_ALIASES[rawQuery.toLowerCase()];
  const cleanQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchTerms = [cleanQuery];
  if (aliasTarget) {
    searchTerms.push(aliasTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  const orConditions = [];
  searchTerms.forEach(term => {
    const termRegex = new RegExp(term, 'i');
    orConditions.push(
      { name: termRegex },
      { city: termRegex },
      { state: termRegex },
      { district: termRegex }
    );
  });

  const exactRegex = new RegExp(`^${cleanQuery}$`, 'i');
  const startsWithRegex = new RegExp(`^${cleanQuery}`, 'i');

  try {
    // 1. Search local DB locations
    const dbMatches = await Location.find({
      isActive: true,
      $or: orConditions
    }).lean();

    // Rank DB matches
    const ranked = dbMatches.sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      const aCity = a.city || '';
      const bCity = b.city || '';

      const aExact = exactRegex.test(aName) || exactRegex.test(aCity);
      const bExact = exactRegex.test(bName) || exactRegex.test(bCity);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = startsWithRegex.test(aName) || startsWithRegex.test(aCity);
      const bStarts = startsWithRegex.test(bName) || startsWithRegex.test(bCity);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;

      return aName.localeCompare(bName);
    });

    if (ranked.length >= 3) {
      return ranked.slice(0, 15);
    }

    // 2. Geocoding API Fallback for custom typing
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(rawQuery)}&countrycodes=in&limit=8&addressdetails=1`;
      const response = await fetch(geoUrl, {
        headers: {
          'User-Agent': 'LooopMarketplace/1.0 (location-search-service)'
        }
      });

      if (response.ok) {
        const geoResults = await response.json();
        const formattedGeo = geoResults.map((item) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || item.name;
          const state = addr.state || addr.region || '';
          const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || item.name;
          const country = addr.country || 'India';

          return {
            _id: `geo_${item.place_id || Math.random()}`,
            name: locality || city,
            city: city,
            state: state,
            district: addr.county || addr.state_district || '',
            country: country,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            type: addr.suburb || addr.neighbourhood ? 'LOCALITY' : 'CITY',
            isPopular: false
          };
        });

        // Merge DB results + Geocoding results without duplicates
        const existingNames = new Set(ranked.map((r) => `${r.name.toLowerCase()}_${r.city.toLowerCase()}`));
        const merged = [...ranked];

        for (const g of formattedGeo) {
          const key = `${g.name.toLowerCase()}_${g.city.toLowerCase()}`;
          if (!existingNames.has(key)) {
            existingNames.add(key);
            merged.push(g);
          }
        }

        return merged.slice(0, 15);
      }
    } catch (geoErr) {
      console.warn('[LocationService] External geocoding search notice:', geoErr.message);
    }

    return ranked;
  } catch (err) {
    console.error('[LocationService] Error searching locations:', err.message);
    return POPULAR_CITIES_DATA;
  }
}

module.exports = {
  seedDefaultLocations,
  getPopularLocations,
  searchLocations
};
