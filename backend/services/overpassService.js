import axios from 'axios';
import https from 'https';
import NodeCache from 'node-cache';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// In-memory cache for Overpass & OSM queries (10 minute TTL)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Haversine formula to calculate distance in meters
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

// Format distance for UI
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// Spelling variations dictionary for backend normalization
const BACKEND_SYNONYMS = {
  saloon: 'salon',
  saloons: 'salon',
  'hair salon': 'salon',
  'beauty parlour': 'salon',
  'beauty parlor': 'salon',
  haircut: 'barber',
  'petrol pump': 'fuel',
  'petrol pumps': 'fuel',
  'gas station': 'fuel',
  'medical shop': 'pharmacy',
  'medical store': 'pharmacy',
  chemist: 'pharmacy',
  'shopping mall': 'mall',
  'shopping malls': 'mall',
  'coffee shop': 'cafe',
  'coffee shops': 'cafe',
  groceries: 'supermarket',
  'grocery store': 'supermarket',
  'fitness center': 'gym',
  'movie theater': 'cinema',
  'movie theatre': 'cinema',
  'bus stand': 'bus_station',
  'train station': 'railway_station',
  pg: 'hostel',
  pgs: 'hostel',
  'paying guest': 'hostel',
  'paying guests': 'hostel',
  'pg hostel': 'hostel',
  'pg hostels': 'hostel',
  'pg and hostel': 'hostel',
  'pg and hostels': 'hostel',
  'pg and hos': 'hostel',
  'hostel and pg': 'hostel',
  hostal: 'hostel',
  hostals: 'hostel',
  hos: 'hospital',
  hosp: 'hospital',
};

// Map category key to comprehensive Overpass QL statements
const buildCategoryClauses = (category, radius, lat, lng, customQuery = '') => {
  const around = `(around:${radius},${lat},${lng})`;

  const categoryMap = {
    restaurant: [
      `node["amenity"="restaurant"]${around};`,
      `way["amenity"="restaurant"]${around};`,
      `node["amenity"="fast_food"]${around};`,
      `way["amenity"="fast_food"]${around};`,
    ],
    cafe: [
      `node["amenity"="cafe"]${around};`,
      `way["amenity"="cafe"]${around};`,
    ],
    fast_food: [
      `node["amenity"="fast_food"]${around};`,
      `way["amenity"="fast_food"]${around};`,
    ],
    hotel: [
      `node["tourism"="hotel"]${around};`,
      `way["tourism"="hotel"]${around};`,
      `node["tourism"="guest_house"]${around};`,
      `way["tourism"="guest_house"]${around};`,
      `node["tourism"="motel"]${around};`,
    ],
    hostel: [
      `node["tourism"="hostel"]${around};`,
      `way["tourism"="hostel"]${around};`,
      `node["amenity"="hostel"]${around};`,
      `way["amenity"="hostel"]${around};`,
      `node["tourism"="guest_house"]${around};`,
      `way["tourism"="guest_house"]${around};`,
      `node["building"="dormitory"]${around};`,
      `way["building"="dormitory"]${around};`,
    ],
    hospital: [
      `node["amenity"="hospital"]${around};`,
      `way["amenity"="hospital"]${around};`,
      `node["amenity"="clinic"]${around};`,
      `way["amenity"="clinic"]${around};`,
    ],
    clinic: [
      `node["amenity"="clinic"]${around};`,
      `way["amenity"="clinic"]${around};`,
      `node["amenity"="doctors"]${around};`,
      `way["amenity"="doctors"]${around};`,
    ],
    pharmacy: [
      `node["amenity"="pharmacy"]${around};`,
      `way["amenity"="pharmacy"]${around};`,
    ],
    police: [
      `node["amenity"="police"]${around};`,
      `way["amenity"="police"]${around};`,
    ],
    fire_station: [
      `node["amenity"="fire_station"]${around};`,
      `way["amenity"="fire_station"]${around};`,
    ],
    atm: [
      `node["amenity"="atm"]${around};`,
      `way["amenity"="atm"]${around};`,
    ],
    bank: [
      `node["amenity"="bank"]${around};`,
      `way["amenity"="bank"]${around};`,
    ],
    fuel: [
      `node["amenity"="fuel"]${around};`,
      `way["amenity"="fuel"]${around};`,
    ],
    ev_charging: [
      `node["amenity"="charging_station"]${around};`,
      `way["amenity"="charging_station"]${around};`,
    ],
    mall: [
      `node["shop"="mall"]${around};`,
      `way["shop"="mall"]${around};`,
      `node["shop"="department_store"]${around};`,
    ],
    supermarket: [
      `node["shop"="supermarket"]${around};`,
      `way["shop"="supermarket"]${around};`,
    ],
    grocery: [
      `node["shop"="convenience"]${around};`,
      `way["shop"="convenience"]${around};`,
      `node["shop"="greengrocer"]${around};`,
    ],
    clothing: [
      `node["shop"="clothes"]${around};`,
      `way["shop"="clothes"]${around};`,
      `node["shop"="fashion"]${around};`,
    ],
    shoes: [
      `node["shop"="shoes"]${around};`,
      `way["shop"="shoes"]${around};`,
    ],
    electronics: [
      `node["shop"="electronics"]${around};`,
      `way["shop"="electronics"]${around};`,
    ],
    mobile_phone: [
      `node["shop"="mobile_phone"]${around};`,
      `way["shop"="mobile_phone"]${around};`,
    ],
    furniture: [
      `node["shop"="furniture"]${around};`,
      `way["shop"="furniture"]${around};`,
    ],
    book_store: [
      `node["shop"="books"]${around};`,
      `way["shop"="books"]${around};`,
    ],
    salon: [
      `node["shop"="hairdresser"]${around};`,
      `way["shop"="hairdresser"]${around};`,
      `node["shop"="beauty"]${around};`,
      `way["shop"="beauty"]${around};`,
    ],
    barber: [
      `node["shop"="hairdresser"]${around};`,
      `way["shop"="hairdresser"]${around};`,
    ],
    spa: [
      `node["leisure"="spa"]${around};`,
      `node["amenity"="spa"]${around};`,
      `node["shop"="massage"]${around};`,
    ],
    gym: [
      `node["leisure"="fitness_centre"]${around};`,
      `way["leisure"="fitness_centre"]${around};`,
    ],
    school: [
      `node["amenity"="school"]${around};`,
      `way["amenity"="school"]${around};`,
    ],
    college: [
      `node["amenity"="college"]${around};`,
      `way["amenity"="college"]${around};`,
    ],
    university: [
      `node["amenity"="university"]${around};`,
      `way["amenity"="university"]${around};`,
    ],
    library: [
      `node["amenity"="library"]${around};`,
      `way["amenity"="library"]${around};`,
    ],
    cinema: [
      `node["amenity"="cinema"]${around};`,
      `way["amenity"="cinema"]${around};`,
    ],
    park: [
      `node["leisure"="park"]${around};`,
      `way["leisure"="park"]${around};`,
      `node["leisure"="garden"]${around};`,
    ],
    parking: [
      `node["amenity"="parking"]${around};`,
      `way["amenity"="parking"]${around};`,
    ],
    temple: [
      `node["amenity"="place_of_worship"]["religion"="hindu"]${around};`,
      `way["amenity"="place_of_worship"]["religion"="hindu"]${around};`,
    ],
    church: [
      `node["amenity"="place_of_worship"]["religion"="christian"]${around};`,
      `way["amenity"="place_of_worship"]["religion"="christian"]${around};`,
    ],
    mosque: [
      `node["amenity"="place_of_worship"]["religion"="muslim"]${around};`,
      `way["amenity"="place_of_worship"]["religion"="muslim"]${around};`,
    ],
    tourist_attraction: [
      `node["tourism"="attraction"]${around};`,
      `way["tourism"="attraction"]${around};`,
      `node["historic"]${around};`,
      `way["historic"]${around};`,
      `node["tourism"="museum"]${around};`,
      `way["tourism"="museum"]${around};`,
    ],
    bus_station: [
      `node["amenity"="bus_station"]${around};`,
      `way["amenity"="bus_station"]${around};`,
      `node["highway"="bus_stop"]${around};`,
    ],
    railway_station: [
      `node["railway"="station"]${around};`,
      `way["railway"="station"]${around};`,
      `node["railway"="halt"]${around};`,
    ],
    airport: [
      `node["aeroway"="aerodrome"]${around};`,
      `way["aeroway"="aerodrome"]${around};`,
    ],
  };

  // If a direct category is selected
  const normalizedCat = (category || '').toLowerCase().trim();
  if (normalizedCat && categoryMap[normalizedCat]) {
    return categoryMap[normalizedCat].join('\n  ');
  }

  // If a custom text query is given
  if (customQuery && customQuery.trim()) {
    let cleanQ = customQuery
      .toLowerCase()
      .replace(/\b(near me|in my area|around me|places to eat|places to visit|near by|nearby)\b/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .trim();

    if (BACKEND_SYNONYMS[cleanQ]) {
      cleanQ = BACKEND_SYNONYMS[cleanQ];
    }

    if (categoryMap[cleanQ]) {
      return categoryMap[cleanQ].join('\n  ');
    }

    // Specific match for PG, Hostels, and Paying Guest
    if (/\b(pg|hostel|hostels|paying guest|paying guests|dormitory|dorm)\b/i.test(cleanQ)) {
      return categoryMap.hostel.join('\n  ');
    }

    // Specific match for Hospitals / Clinics / Hos
    if (/\b(hospital|hospitals|clinic|clinics|healthcare|hos|hosp)\b/i.test(cleanQ)) {
      return categoryMap.hospital.join('\n  ');
    }

    const q = cleanQ.replace(/['"\\;]/g, '').trim();
    return `
      node["name"~"${q}",i]${around};
      way["name"~"${q}",i]${around};
      node["amenity"~"${q}",i]${around};
      way["amenity"~"${q}",i]${around};
      node["shop"~"${q}",i]${around};
      way["shop"~"${q}",i]${around};
      node["tourism"~"${q}",i]${around};
      way["tourism"~"${q}",i]${around};
    `;
  }

  // Default query for "All Places"
  return [
    `node["amenity"~"^(restaurant|cafe|fast_food|hospital|pharmacy|fuel|atm|bank)$"]${around};`,
    `way["amenity"~"^(restaurant|cafe|fast_food|hospital|pharmacy|fuel|bank)$"]${around};`,
    `node["shop"~"^(mall|supermarket|hairdresser|beauty|clothes)$"]${around};`,
    `way["shop"~"^(mall|supermarket)$"]${around};`,
    `node["tourism"~"^(hotel|attraction)$"]${around};`,
  ].join('\n  ');
};

// Build formatted address from OSM tags
const formatAddress = (tags) => {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

  if (parts.length > 0) return parts.join(', ');
  if (tags['addr:full']) return tags['addr:full'];
  return '';
};

// Determine user-friendly category name from tags
const resolveCategory = (tags, defaultCat) => {
  if (tags.amenity) return tags.amenity.replace(/_/g, ' ');
  if (tags.shop) {
    if (tags.shop === 'hairdresser') return 'hairdresser / salon';
    if (tags.shop === 'beauty') return 'beauty salon';
    return `${tags.shop.replace(/_/g, ' ')} shop`;
  }
  if (tags.tourism) return tags.tourism.replace(/_/g, ' ');
  if (tags.highway === 'bus_stop') return 'bus stop';
  if (tags.railway) return `${tags.railway.replace(/_/g, ' ')} station`;
  if (tags.leisure) return tags.leisure.replace(/_/g, ' ');
  return defaultCat || 'point of interest';
};

// Fetch POIs from Overpass API with high-speed Nominatim fallback
export const fetchNearbyPlacesFromOverpass = async ({
  lat,
  lng,
  radius = 5000,
  category = '',
  query = '',
  location = '',
  limit = 60,
}) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = Math.min(Math.max(parseInt(radius, 10) || 5000, 1000), 50000);

  // Check in-memory cache
  const cacheKey = `${category || 'all'}_${parsedLat.toFixed(3)}_${parsedLng.toFixed(3)}_${parsedRadius}_${query || ''}_${location || ''}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData && cachedData.length > 0) {
    return cachedData;
  }

  const queryClauses = buildCategoryClauses(category, parsedRadius, parsedLat, parsedLng, query);

  const overpassQL = `
    [out:json][timeout:25];
    (
      ${queryClauses}
    );
    out center tags;
  `;

  let responseData = null;

  // 1. Try Overpass API endpoints — try all before falling through to Nominatim
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(
        endpoint,
        `data=${encodeURIComponent(overpassQL)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'NearbyAI-App/2.0 (NearbyAI FullStack OpenStreetMap)',
          },
          httpsAgent,
          timeout: 12000,
        }
      );

      if (response.data && Array.isArray(response.data.elements) && response.data.elements.length > 0) {
        responseData = response.data.elements;
        break;
      }
    } catch (err) {
      console.warn(`[Overpass] ${endpoint} failed: ${err.message}. Trying next...`);
      // Continue to next endpoint instead of breaking
      continue;
    }
  }

  // 2. High-speed Nominatim OpenStreetMap fallback if Overpass times out or gets 429 rate limited
  if (!responseData || responseData.length === 0) {
    try {
      const qLower = (query || category || '').toLowerCase().trim();

      // Bounded viewbox coordinates around target center
      const deg = (parsedRadius / 111000) * 1.15;
      const left = (parsedLng - deg).toFixed(5);
      const right = (parsedLng + deg).toFixed(5);
      const top = (parsedLat + deg).toFixed(5);
      const bottom = (parsedLat - deg).toFixed(5);
      const viewbox = `${left},${top},${right},${bottom}`;

      // Build target terms list based on user search query or category
      let terms = [];
      if (!qLower || qLower === 'all' || qLower === 'point of interest') {
        terms = [
          'restaurant',
          'cafe',
          'fast food',
          'hostel',
          'hotel',
          'hospital',
          'clinic',
          'pharmacy',
          'supermarket',
          'bank',
          'atm',
        ];
      } else if (/\b(pg|hostel|hostels|paying guest|dormitory|dorm|pg and hos)\b/i.test(qLower)) {
        terms = ['hostel', 'paying guest', 'pg hostel', 'dormitory', 'guest house'];
      } else if (/\b(hos|hosp|hospital|hospitals|clinic|healthcare|medical)\b/i.test(qLower)) {
        terms = ['hospital', 'clinic', 'pharmacy', 'health center'];
      } else if (/\b(food|dining|eat|restaurant|cafe|coffee|tea|bakery|fast_food)\b/i.test(qLower)) {
        terms = ['cafe', 'coffee', 'tea', 'bakery', 'canteen', 'fast food', 'restaurant', 'food', 'sweets', 'ice cream'];
      } else if (/\b(hotel|lodge|lodging|stay)\b/i.test(qLower)) {
        terms = ['hotel', 'guest house', 'resort', 'motel'];
      } else {
        terms = [qLower];
      }

      // Reverse geocode to detect city/town for high-accuracy area search
      let detectedArea = (location || '').split(',')[0].trim();
      let townOrCity = detectedArea;
      try {
        const rev = await axios.get('https://nominatim.openstreetmap.org/reverse', {
          params: { lat: parsedLat, lon: parsedLng, format: 'json', addressdetails: 1 },
          headers: { 'User-Agent': 'NearbyAI-App/2.0' },
          httpsAgent,
          timeout: 2500,
        });
        const addr = rev.data?.address || {};
        townOrCity = addr.town || addr.city || addr.county || addr.suburb || addr.village || detectedArea;
      } catch (e) {
        // non-blocking
      }

      const rawItems = [];
      const seenIds = new Set();

      // Sequential execution with small delay to avoid Nominatim rate limits (max 1 req/sec)
      for (const term of terms) {
        try {
          const nomRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: term,
              format: 'json',
              viewbox,
              bounded: 1,
              addressdetails: 1,
              extratags: 1,
              limit: Math.min(limit, 35),
            },
            headers: {
              'User-Agent': 'NearbyAI-App/2.0',
            },
            httpsAgent,
            timeout: 5000,
          });

          if (Array.isArray(nomRes.data)) {
            for (const item of nomRes.data) {
              const idKey = `${item.osm_type || 'node'}_${item.osm_id}`;
              if (!seenIds.has(idKey)) {
                seenIds.add(idKey);
                rawItems.push(item);
              }
            }
          }
          // Small delay between requests to respect Nominatim rate limits
          if (terms.indexOf(term) < terms.length - 1) {
            await new Promise(r => setTimeout(r, 200));
          }
        } catch (subErr) {
          // continue with next term
        }
      }

      // If viewbox returned fewer results and we have an area name, try contextual search
      if (rawItems.length < 3 && townOrCity && townOrCity.length > 2) {
        for (const term of terms.slice(0, 5)) {
          try {
            const areaRes = await axios.get('https://nominatim.openstreetmap.org/search', {
              params: {
                q: `${term} in ${townOrCity}`,
                format: 'json',
                addressdetails: 1,
                extratags: 1,
                limit: 10,
              },
              headers: { 'User-Agent': 'NearbyAI-App/2.0' },
              httpsAgent,
              timeout: 3500,
            });
            if (Array.isArray(areaRes.data)) {
              for (const item of areaRes.data) {
                const idKey = `${item.osm_type || 'node'}_${item.osm_id}`;
                if (!seenIds.has(idKey)) {
                  seenIds.add(idKey);
                  rawItems.push(item);
                }
              }
            }
          } catch (areaErr) {
            // ignore
          }
        }
      }

      // If still fewer than 3 results, smart fallback to prominent town POIs so users never get 0 places
      if (rawItems.length < 3 && townOrCity) {
        const fallbackGeneralTerms = ['hospital', 'bank', 'cinema', 'theatre', 'canteen', 'market', 'station', 'college', 'school', 'hotel'];
        await Promise.all(
          fallbackGeneralTerms.map(async (fTerm) => {
            try {
              const fRes = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                  q: `${fTerm} in ${townOrCity}`,
                  format: 'json',
                  addressdetails: 1,
                  extratags: 1,
                  limit: 4,
                },
                headers: { 'User-Agent': 'NearbyAI-App/2.0' },
                httpsAgent,
                timeout: 3500,
              });
              if (Array.isArray(fRes.data)) {
                for (const item of fRes.data) {
                  const idKey = `${item.osm_type || 'node'}_${item.osm_id}`;
                  if (!seenIds.has(idKey)) {
                    seenIds.add(idKey);
                    rawItems.push({ ...item, isFallback: true });
                  }
                }
              }
            } catch (e) {}
          })
        );
      }

      if (rawItems.length > 0) {
        responseData = rawItems.map((item) => ({
          type: item.osm_type || 'node',
          id: item.osm_id,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          isFallback: Boolean(item.isFallback),
          tags: {
            name: item.name || (item.display_name ? item.display_name.split(',')[0] : 'Unnamed Place'),
            amenity: item.type || item.class || 'point of interest',
            'addr:city': item.address?.city || item.address?.town || item.address?.suburb,
            'addr:state': item.address?.state,
            'addr:street': item.address?.road,
            ...item.extratags,
          },
        }));
      }
    } catch (nomErr) {
      console.warn('[Nominatim Fallback] Error:', nomErr.message);
    }
  }

  if (!responseData || responseData.length === 0) {
    return [];
  }

  // Parse and normalize results
  const places = [];
  const seenIds = new Set();

  for (const item of responseData) {
    const itemLat = item.lat || (item.center && item.center.lat);
    const itemLng = item.lon || (item.center && item.center.lon);

    if (!itemLat || !itemLng) continue;

    const id = `${item.type}/${item.id}`;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const tags = item.tags || {};
    const name = tags.name || tags['name:en'] || tags['brand'] || tags['operator'] || (tags.amenity ? `${tags.amenity.toUpperCase()}` : 'Unnamed Place');
    const distanceMeters = calculateHaversineDistance(parsedLat, parsedLng, itemLat, itemLng);

    // Strict distance filter: exclude items outside the requested radius unless smart fallback
    const maxAllowed = item.isFallback ? parsedRadius + 3500 : parsedRadius + 600;
    if (distanceMeters > maxAllowed) {
      continue;
    }

    const fullAddress = formatAddress(tags);
    const googleReviewsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + (fullAddress ? ' ' + fullAddress : ''))}`;
    const realRating = tags.rating || tags['stars'] || null;

    places.push({
      id,
      osmType: item.type,
      osmId: item.id,
      name,
      category: resolveCategory(tags, category),
      address: fullAddress,
      lat: itemLat,
      lng: itemLng,
      distance: distanceMeters,
      distanceText: formatDistance(distanceMeters),
      openingHours: tags.opening_hours || null,
      phone: tags.phone || tags['contact:phone'] || null,
      website: tags.website || tags['contact:website'] || null,
      cuisine: tags.cuisine || null,
      stars: tags.stars || null,
      rating: realRating,
      googleRating: realRating,
      googleReviewsUrl,
      wheelchair: tags.wheelchair || null,
      brand: tags.brand || null,
      operator: tags.operator || null,
      tags,
      isFallback: Boolean(item.isFallback),
    });
  }

  // Sort by straight-line distance ascending
  places.sort((a, b) => a.distance - b.distance);

  const finalPlaces = places.slice(0, limit);
  if (finalPlaces.length > 0) {
    cache.set(cacheKey, finalPlaces);
  }

  return finalPlaces;
};
