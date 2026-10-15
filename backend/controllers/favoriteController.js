import Favorite from '../models/Favorite.js';

// @desc    Get all favorites of the current user
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a place to favorites
// @route   POST /api/favorites
// @access  Private
export const addFavorite = async (req, res, next) => {
  try {
    const {
      placeId,
      name,
      category,
      address,
      lat,
      lng,
      distance,
      phone,
      website,
      openingHours,
      tags,
    } = req.body;

    if (!placeId || !name || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'placeId, name, lat, and lng are required to save a favorite.',
      });
    }

    // Check if already favorited
    let favorite = await Favorite.findOne({ user: req.user._id, placeId });
    if (favorite) {
      return res.json({
        success: true,
        data: favorite,
        message: 'Place is already in your favorites.',
      });
    }

    favorite = await Favorite.create({
      user: req.user._id,
      placeId,
      name,
      category: category || 'place',
      address: address || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      distance: distance || 0,
      phone: phone || '',
      website: website || '',
      openingHours: openingHours || '',
      tags: tags || {},
    });

    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Place saved to favorites.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a place from favorites
// @route   DELETE /api/favorites/:placeId
// @access  Private
export const removeFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const cleanId = decodeURIComponent(placeId);

    const deleted = await Favorite.findOneAndDelete({
      user: req.user._id,
      placeId: cleanId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' });
    }

    res.json({
      success: true,
      message: 'Place removed from favorites.',
      data: { placeId: cleanId },
    });
  } catch (error) {
    next(error);
  }
};
