/**
 * Reusable Intelligent Search Engine for NearbyAI – OpenStreetMap Explorer
 * Supports:
 *  - Spelling variations (saloon -> salon, petrol pump -> fuel station, etc.)
 *  - Singular / plural & synonyms across 40+ categories
 *  - Natural language parsing ("restaurants in Vijayawada", "saloon near Vijayawada")
 *  - OSM tag mapping & category resolution
 *  - Strict Haversine geographic distance calculation & relevance filtering
 */

// Haversine formula to compute exact distance in meters between two lat/lng coordinates
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Format distance helper
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// Common spelling variations and synonyms dictionary
export const SPELLING_VARIATIONS = {
  saloon: 'salon',
  saloons: 'salon',
  centre: 'center',
  theatre: 'theater',
  theatres: 'theater',
  'petrol pump': 'fuel',
  'petrol pumps': 'fuel',
  'petrol station': 'fuel',
  'petrol stations': 'fuel',
  'gas station': 'fuel',
  'gas stations': 'fuel',
  'medical shop': 'pharmacy',
  'medical shops': 'pharmacy',
  'medical store': 'pharmacy',
  'medical stores': 'pharmacy',
  'medicine shop': 'pharmacy',
  chemist: 'pharmacy',
  chemists: 'pharmacy',
  'mobile shop': 'mobile_phone',
  'mobile shops': 'mobile_phone',
  'mobile store': 'mobile_phone',
  'phone shop': 'mobile_phone',
  'phone store': 'mobile_phone',
  smartphone: 'mobile_phone',
  'coffee shop': 'cafe',
  'coffee shops': 'cafe',
  'shopping mall': 'mall',
  'shopping malls': 'mall',
  'shopping center': 'mall',
  'shopping centre': 'mall',
  'grocery store': 'supermarket',
  'grocery stores': 'supermarket',
  groceries: 'supermarket',
  haircut: 'barber',
  'hair salon': 'salon',
  'barber shop': 'barber',
  'barbers shop': 'barber',
  'beauty parlour': 'salon',
  'beauty parlor': 'salon',
  'beauty salon': 'salon',
  'fitness center': 'gym',
  'fitness centre': 'gym',
  gymnasium: 'gym',
  'movie theater': 'cinema',
  'movie theatre': 'cinema',
  'bus stand': 'bus_station',
  'bus stop': 'bus_station',
  'train station': 'railway_station',
  'rail station': 'railway_station',
  railway: 'railway_station',
  pg: 'hostel',
  pgs: 'hostel',
  hostal: 'hostel',
  hostals: 'hostel',
  'paying guest': 'hostel',
  'paying guests': 'hostel',
  'pg hostel': 'hostel',
  'pg hostels': 'hostel',
  'pg and hostel': 'hostel',
  'pg and hostels': 'hostel',
  'pg and hos': 'hostel',
  'hostel and pg': 'hostel',
  hos: 'hospital',
  hosp: 'hospital',
};

// Comprehensive category mappings across 40+ categories
export const searchMappings = {
  restaurant: [
    'restaurant',
    'restaurants',
    'food',
    'dining',
    'eat',
    'eatery',
    'eateries',
    'bistro',
    'diner',
    'places to eat',
  ],
  cafe: [
    'cafe',
    'cafes',
    'coffee',
    'coffee shop',
    'coffee shops',
    'tea',
    'espresso',
    'bakery',
  ],
  fast_food: [
    'fast food',
    'fastfood',
    'burger',
    'burgers',
    'pizza',
    'pizzas',
    'fried chicken',
    'sandwich',
    'subway',
    'mcdonald',
  ],
  hotel: [
    'hotel',
    'hotels',
    'stay',
    'lodging',
    'accommodation',
    'resort',
    'motel',
    'guest house',
    'places to stay',
  ],
  hostel: [
    'hostel',
    'hostels',
    'pg',
    'pgs',
    'paying guest',
    'paying guests',
    'pg hostel',
    'pg hostels',
    'hostal',
    'hostals',
    'mens hostel',
    'womens hostel',
    'ladies hostel',
    'boys hostel',
    'girls hostel',
    'mens pg',
    'womens pg',
    'ladies pg',
    'gents pg',
    'dormitory',
    'dorm',
    'student accommodation',
    'shared room',
    'pg and hostel',
    'pg and hostels',
    'hostel and pg',
  ],
  hospital: [
    'hospital',
    'hospitals',
    'medical',
    'medical center',
    'healthcare',
    'emergency',
    'hos',
    'hosp',
  ],
  clinic: [
    'clinic',
    'clinics',
    'doctor',
    'doctors',
    'dentist',
    'dispensary',
    'polyclinic',
  ],
  pharmacy: [
    'pharmacy',
    'pharmacies',
    'medical shop',
    'medical store',
    'medicine shop',
    'chemist',
    'drugstore',
  ],
  salon: [
    'salon',
    'saloon',
    'beauty salon',
    'beauty parlour',
    'beauty parlor',
    'hair salon',
    'hairdresser',
    'parlour',
  ],
  barber: [
    'barber',
    'barbers',
    'barber shop',
    'haircut',
    'shave',
    'hair cutting',
  ],
  spa: [
    'spa',
    'spas',
    'massage',
    'wellness',
    'ayurveda',
  ],
  mall: [
    'mall',
    'malls',
    'shopping mall',
    'shopping malls',
    'shopping center',
    'shopping centre',
  ],
  supermarket: [
    'supermarket',
    'supermarkets',
    'grocery',
    'grocery store',
    'grocery stores',
    'department store',
    'hypermarket',
  ],
  clothing: [
    'clothing',
    'clothes',
    'clothing store',
    'fashion',
    'fashion store',
    'dress shop',
    'boutique',
    'apparel',
  ],
  shoes: [
    'shoes',
    'shoe store',
    'footwear',
    'footwear shop',
  ],
  electronics: [
    'electronics',
    'electronics store',
    'electronic shop',
    'appliances',
    'gadgets',
  ],
  mobile_phone: [
    'mobile',
    'mobile shop',
    'mobile store',
    'phone shop',
    'phone store',
    'smartphone',
    'cell phone',
  ],
  furniture: [
    'furniture',
    'furniture store',
    'home decor',
    'furnishing',
  ],
  book_store: [
    'book store',
    'books',
    'bookstore',
    'book shop',
    'stationery',
  ],
  bank: [
    'bank',
    'banks',
    'banking',
  ],
  atm: [
    'atm',
    'atms',
    'cash machine',
    'cash point',
    'money machine',
  ],
  fuel: [
    'petrol',
    'petrol pump',
    'petrol station',
    'gas station',
    'fuel',
    'fuel station',
    'diesel',
  ],
  ev_charging: [
    'ev charging',
    'ev charger',
    'electric vehicle charging',
    'charging station',
  ],
  police: [
    'police',
    'police station',
    'cop',
    'law enforcement',
  ],
  fire_station: [
    'fire station',
    'fire brigade',
    'fire department',
  ],
  school: [
    'school',
    'schools',
    'high school',
    'primary school',
  ],
  college: [
    'college',
    'colleges',
  ],
  university: [
    'university',
    'universities',
    'campus',
    'institute',
  ],
  library: [
    'library',
    'libraries',
    'public library',
  ],
  gym: [
    'gym',
    'gyms',
    'fitness',
    'fitness center',
    'fitness centre',
    'workout',
  ],
  cinema: [
    'movie',
    'movies',
    'cinema',
    'cinemas',
    'movie theater',
    'movie theatre',
    'theatre',
    'theater',
    'multiplex',
  ],
  park: [
    'park',
    'parks',
    'garden',
    'gardens',
    'public park',
  ],
  parking: [
    'parking',
    'car parking',
    'parking lot',
    'parking garage',
  ],
  temple: [
    'temple',
    'temples',
    'mandir',
    'kovil',
    'hindu temple',
  ],
  church: [
    'church',
    'churches',
    'cathedral',
    'chapel',
  ],
  mosque: [
    'mosque',
    'mosques',
    'masjid',
  ],
  tourist_attraction: [
    'tourist attraction',
    'tourist attractions',
    'attraction',
    'tourist place',
    'tourist places',
    'places to visit',
    'sightseeing',
    'monument',
    'museum',
  ],
  bus_station: [
    'bus station',
    'bus stand',
    'bus stop',
    'bus terminal',
  ],
  railway_station: [
    'railway station',
    'rail station',
    'train station',
    'railway',
    'metro station',
  ],
  airport: [
    'airport',
    'airports',
    'aerodrome',
    'flight terminal',
  ],
};

/**
 * Normalizes a raw user query string:
 * - Trims and converts to lowercase
 * - Extracts natural language location if present ("in Vijayawada", "near Hyderabad")
 * - Removes stop words / phrases ("near me", "around me", "good", "best")
 * - Maps common spelling variations (saloon -> salon, petrol pump -> fuel)
 */
export const normalizeSearchQuery = (rawQuery = '') => {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { cleanedQuery: '', extractedLocation: null };
  }

  let text = rawQuery.toLowerCase().trim();

  // Extract explicit natural-language location: "X in Location" or "X near Location"
  let extractedLocation = null;
  const inMatch = text.match(/\b(?:in|at|near|around)\s+([a-zA-Z0-9\s,]+)$/i);
  if (inMatch && inMatch[1]) {
    const candidateLoc = inMatch[1].trim();
    // Exclude noise like "near me" or "near my location"
    if (!candidateLoc.match(/^(me|my location|here|us)$/i)) {
      extractedLocation = candidateLoc;
      text = text.substring(0, inMatch.index).trim();
    }
  }

  // Remove common filler phrases
  text = text
    .replace(/\b(near me|near my location|around me|in my area|nearby|near by)\b/gi, '')
    .replace(/\b(best|good|top|find|popular|famous|local)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Check spelling variations
  if (SPELLING_VARIATIONS[text]) {
    text = SPELLING_VARIATIONS[text];
  } else {
    // Check word-by-word variations
    const words = text.split(' ');
    const normalizedWords = words.map((w) => SPELLING_VARIATIONS[w] || w);
    text = normalizedWords.join(' ');
  }

  return {
    cleanedQuery: text,
    extractedLocation,
  };
};

/**
 * Detects search intent from query:
 * Maps query to a canonical category if recognized in searchMappings.
 */
export const getSearchIntent = (rawQuery = '') => {
  const { cleanedQuery, extractedLocation } = normalizeSearchQuery(rawQuery);

  if (!cleanedQuery) {
    return {
      category: null,
      keyword: '',
      extractedLocation,
      isSpecificCategory: false,
    };
  }

  // 1. Direct key match in searchMappings
  if (searchMappings[cleanedQuery]) {
    return {
      category: cleanedQuery,
      keyword: cleanedQuery,
      extractedLocation,
      isSpecificCategory: true,
    };
  }

  // 2. Value array match in searchMappings
  for (const [catKey, keywords] of Object.entries(searchMappings)) {
    for (const kw of keywords) {
      if (cleanedQuery === kw || cleanedQuery.includes(kw) || kw.includes(cleanedQuery)) {
        return {
          category: catKey,
          keyword: cleanedQuery,
          extractedLocation,
          isSpecificCategory: true,
        };
      }
    }
  }

  // Fallback to keyword search
  return {
    category: null,
    keyword: cleanedQuery,
    extractedLocation,
    isSpecificCategory: false,
  };
};

/**
 * Maps raw OpenStreetMap tags into user-friendly professional category labels
 */
export const mapOSMCategory = (tags = {}, fallback = '') => {
  if (!tags) return fallback || 'Point of Interest';

  if (tags.amenity === 'restaurant') return 'Restaurant';
  if (tags.amenity === 'cafe') return 'Cafe';
  if (tags.amenity === 'fast_food') return 'Fast Food';
  if (tags.amenity === 'hospital') return 'Hospital';
  if (tags.amenity === 'clinic' || tags.amenity === 'doctors') return 'Clinic';
  if (tags.amenity === 'pharmacy') return 'Pharmacy';
  if (tags.amenity === 'police') return 'Police';
  if (tags.amenity === 'fire_station') return 'Fire Station';
  if (tags.amenity === 'atm') return 'ATM';
  if (tags.amenity === 'bank') return 'Bank';
  if (tags.amenity === 'fuel') return 'Petrol Pump';
  if (tags.amenity === 'charging_station') return 'EV Charging';
  if (tags.amenity === 'parking') return 'Parking';
  if (tags.amenity === 'cinema') return 'Cinema';
  if (tags.amenity === 'library') return 'Library';
  if (tags.amenity === 'school') return 'School';
  if (tags.amenity === 'college') return 'College';
  if (tags.amenity === 'university') return 'University';
  if (tags.amenity === 'place_of_worship') {
    if (tags.religion === 'hindu') return 'Temple';
    if (tags.religion === 'christian') return 'Church';
    if (tags.religion === 'muslim') return 'Mosque';
    return 'Place of Worship';
  }

  if (tags.shop === 'hairdresser' || tags.shop === 'beauty') return 'Salon';
  if (tags.shop === 'mall') return 'Shopping Mall';
  if (tags.shop === 'supermarket') return 'Supermarket';
  if (tags.shop === 'convenience') return 'Grocery';
  if (tags.shop === 'clothes' || tags.shop === 'fashion') return 'Clothing';
  if (tags.shop === 'shoes') return 'Shoes';
  if (tags.shop === 'electronics') return 'Electronics';
  if (tags.shop === 'mobile_phone') return 'Mobile Shop';
  if (tags.shop === 'furniture') return 'Furniture';
  if (tags.shop === 'books') return 'Bookstore';

  if (tags.tourism === 'hotel') return 'Hotel';
  if (tags.tourism === 'hostel' || tags.amenity === 'hostel') return 'Hostel';
  if (tags.tourism === 'guest_house') return 'PG / Guest House';
  if (tags.building === 'dormitory') return 'Hostel / Dormitory';
  if (tags.name && /\b(pg|hostel|paying guest)\b/i.test(tags.name)) return 'PG / Hostel';
  if (tags.tourism === 'attraction' || tags.tourism === 'museum') return 'Attraction';

  if (tags.leisure === 'fitness_centre') return 'Gym';
  if (tags.leisure === 'park') return 'Park';

  if (tags.railway === 'station') return 'Railway Station';
  if (tags.highway === 'bus_stop' || tags.amenity === 'bus_station') return 'Bus Station';
  if (tags.aeroway === 'aerodrome') return 'Airport';

  if (tags.amenity) return tags.amenity.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (tags.shop) return `${tags.shop.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`;
  if (tags.tourism) return tags.tourism.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return fallback ? fallback.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Place';
};

/**
 * Filter places strictly by user-specified maxDistanceKm (Haversine)
 * and by category relevance if a specific intent was detected.
 */
export const filterRelevantResults = (
  places = [],
  intent = {},
  centerLat = null,
  centerLng = null,
  maxDistanceKm = 5
) => {
  if (!Array.isArray(places)) return [];

  const maxMeters = Math.max(Number(maxDistanceKm) || 5, 1) * 1000;

  return places.filter((place) => {
    // 1. Strict distance check: recalculate Haversine distance if center is provided
    let distanceMeters = place.distance;
    if (centerLat !== null && centerLng !== null && place.lat && place.lng) {
      distanceMeters = calculateHaversineDistance(
        Number(centerLat),
        Number(centerLng),
        Number(place.lat),
        Number(place.lng)
      );
      place.distance = distanceMeters;
      place.distanceText = formatDistance(distanceMeters);
    }

    const maxAllowedDistance = place.isFallback ? maxMeters + 3500 : maxMeters + 300;
    if (typeof distanceMeters === 'number' && distanceMeters > maxAllowedDistance) {
      return false;
    }

    // Always preserve smart fallback places
    if (place.isFallback) {
      return true;
    }

    // 2. Category relevance check: if searching for specific category, ensure matching
    if (intent && intent.isSpecificCategory && intent.category) {
      const cat = (place.category || '').toLowerCase();
      const tags = place.tags || {};
      const targetCat = intent.category;

      if (targetCat === 'hostel') {
        const isHostel =
          tags.tourism === 'hostel' ||
          tags.amenity === 'hostel' ||
          tags.tourism === 'guest_house' ||
          tags.building === 'dormitory' ||
          cat.includes('hostel') ||
          cat.includes('pg') ||
          cat.includes('guest') ||
          /\b(hostel|pg|paying guest|dormitory|dorm|stay|residence)\b/i.test(place.name || '');
        if (!isHostel) return false;
      }
      if (targetCat === 'hospital' && !cat.includes('hospital') && !cat.includes('clinic') && tags.amenity !== 'hospital' && tags.amenity !== 'clinic') {
        return false;
      }
      if (targetCat === 'salon' || targetCat === 'barber') {
        const isHair =
          tags.shop === 'hairdresser' ||
          tags.shop === 'beauty' ||
          cat.includes('salon') ||
          cat.includes('barber') ||
          cat.includes('hair');
        if (!isHair && !place.name.toLowerCase().match(/\b(salon|saloon|barber|hair|parlour|parlor)\b/)) {
          return false;
        }
      }
      if (targetCat === 'fuel') {
        const isFuel = tags.amenity === 'fuel' || cat.includes('fuel') || cat.includes('petrol');
        if (!isFuel && !place.name.toLowerCase().match(/\b(petrol|fuel|gas|hp|bharat|indian oil|shell)\b/)) {
          return false;
        }
      }
      if (targetCat === 'mall') {
        const isMall = tags.shop === 'mall' || cat.includes('mall');
        if (!isMall && !place.name.toLowerCase().includes('mall')) {
          return false;
        }
      }
    }

    return true;
  });
};
