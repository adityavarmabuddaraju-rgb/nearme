import axios from 'axios';
import https from 'https';
import NodeCache from 'node-cache';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Cache geocoding requests for 15 minutes to respect Nominatim rate limit guidelines
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'NearbyAI-App/1.0 (NearbyAI FullStack Application; student/developer build)';

export const searchNominatim = async (query, limit = 5) => {
  if (!query || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `geo_${cleanQuery}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: cleanQuery,
        format: 'json',
        addressdetails: 1,
        limit,
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
      httpsAgent,
      timeout: 10000,
    });

    const results = (response.data || []).map((item) => ({
      placeId: item.place_id,
      osmId: item.osm_id,
      osmType: item.osm_type,
      name: item.name || (item.display_name ? item.display_name.split(',')[0] : 'Unknown'),
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      category: item.class,
      boundingBox: item.boundingbox,
      address: item.address || {},
    }));

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error(`[Nominatim] Geocoding error for "${query}":`, error.message);
    throw new Error('Nominatim geocoding service currently unavailable');
  }
};

export const reverseGeocodeNominatim = async (lat, lng) => {
  const cacheKey = `rev_${parseFloat(lat).toFixed(4)}_${parseFloat(lng).toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
      httpsAgent,
      timeout: 10000,
    });

    const data = response.data || {};
    const result = {
      displayName: data.display_name || `${lat}, ${lng}`,
      address: data.address || {},
      lat: parseFloat(data.lat || lat),
      lng: parseFloat(data.lon || lng),
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`[Nominatim] Reverse geocode error for (${lat}, ${lng}):`, error.message);
    return { displayName: `${lat}, ${lng}`, address: {}, lat, lng };
  }
};
