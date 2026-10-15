import { fetchNearbyPlacesFromOverpass } from '../services/overpassService.js';
import SearchHistory from '../models/SearchHistory.js';
import axios from 'axios';

// @desc    Get nearby places from OpenStreetMap
// @route   GET /api/places/nearby
// @access  Public (Optional User Auth for History)
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, category = '', query = '', location = '', limit = 60 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

    const places = await fetchNearbyPlacesFromOverpass({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius, 10),
      category,
      query,
      location,
      limit: parseInt(limit, 10),
    });

    // Record search history if user is authenticated or query provided
    try {
      if (req.user) {
        await SearchHistory.create({
          user: req.user ? req.user._id : null,
          query: query || category || 'Nearby Places',
          category: category || 'all',
          radius: parseInt(radius, 10),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          resultsCount: places.length,
        });
      }
    } catch (e) {
      // Non-blocking log
      console.warn('[History] Could not record history entry:', e.message);
    }

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search places by custom keywords
// @route   GET /api/places/search
// @access  Public
export const searchPlaces = async (req, res, next) => {
  try {
    const { q, lat, lng, radius = 5000, location = '' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required for search.' });
    }

    const places = await fetchNearbyPlacesFromOverpass({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius, 10),
      query: q || '',
      location,
      limit: 60,
    });

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single place by OSM ID
// @route   GET /api/places/:id
// @access  Public
export const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params; // e.g. "node-12345" or "node/12345"
    const cleanId = decodeURIComponent(id).replace('-', '/');
    const [osmType, osmId] = cleanId.includes('/') ? cleanId.split('/') : ['node', cleanId];

    const overpassQL = `
      [out:json][timeout:15];
      ${osmType}(${osmId});
      out center tags;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQL)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'NearbyAI-App/1.0',
        },
        timeout: 10000,
      }
    );

    const elements = response.data?.elements || [];
    if (elements.length === 0) {
      return res.status(404).json({ success: false, message: 'Place not found on OpenStreetMap' });
    }

    const item = elements[0];
    const tags = item.tags || {};
    const itemLat = item.lat || (item.center && item.center.lat);
    const itemLng = item.lon || (item.center && item.center.lon);

    res.json({
      success: true,
      data: {
        id: `${item.type}/${item.id}`,
        name: tags.name || tags.amenity || 'Unnamed Location',
        category: tags.amenity || tags.shop || tags.tourism || 'Place',
        lat: itemLat,
        lng: itemLng,
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
};
