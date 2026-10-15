import { parseSearchQueryWithAI, rankPlacesWithAI } from '../services/aiService.js';
import { fetchNearbyPlacesFromOverpass } from '../services/overpassService.js';
import SearchHistory from '../models/SearchHistory.js';

// @desc    Parse natural language query with AI and search real OpenStreetMap places
// @route   POST /api/ai/search
// @access  Public (Optional Auth)
export const searchWithAI = async (req, res, next) => {
  try {
    const { prompt, lat, lng, defaultRadius = 5000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a search prompt.' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Current location coordinates are required.' });
    }

    // 1. Convert natural language prompt to structured criteria
    const structuredQuery = await parseSearchQueryWithAI(prompt);
    const searchRadius = structuredQuery.radius || defaultRadius;

    // 2. Fetch verified places from Overpass API (NEVER fake or invented)
    let places = await fetchNearbyPlacesFromOverpass({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: searchRadius,
      category: structuredQuery.category,
      query: structuredQuery.query,
      limit: 40,
    });

    // 3. Post-process filters if user specified "open now" and OSM tags contain opening hours
    if (structuredQuery.openNow) {
      const filtered = places.filter((p) => {
        if (!p.openingHours) return true; // Keep if unspecified to avoid dropping valid places
        return !/closed/i.test(p.openingHours);
      });
      if (filtered.length > 0) {
        places = filtered;
      }
    }

    // 4. Rank and explain matches using AI strictly on retrieved OSM dataset
    const aiAnalysis = await rankPlacesWithAI(prompt, places);

    // 5. Store in search history
    try {
      await SearchHistory.create({
        user: req.user ? req.user._id : null,
        query: prompt,
        category: structuredQuery.category || 'ai-search',
        radius: searchRadius,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        resultsCount: places.length,
      });
    } catch (err) {
      console.warn('[History] Search history save skipped:', err.message);
    }

    res.json({
      success: true,
      data: {
        structuredQuery,
        count: places.length,
        places,
        aiAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask AI to rank/recommend an already loaded list of places
// @route   POST /api/ai/recommend
// @access  Public
export const recommendPlaces = async (req, res, next) => {
  try {
    const { prompt, places } = req.body;

    if (!prompt || !places) {
      return res.status(400).json({ success: false, message: 'Prompt and places array are required.' });
    }

    const aiAnalysis = await rankPlacesWithAI(prompt, places);

    res.json({
      success: true,
      data: aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};
