import { searchNominatim, reverseGeocodeNominatim } from '../services/nominatimService.js';

// @desc    Geocode place query using Nominatim
// @route   GET /api/geocode/search
// @access  Public
export const searchGeocode = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query "q" is required.' });
    }

    const results = await searchNominatim(q, parseInt(limit, 10));

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reverse geocode coordinates using Nominatim
// @route   GET /api/geocode/reverse
// @access  Public
export const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

    const result = await reverseGeocodeNominatim(parseFloat(lat), parseFloat(lng));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
