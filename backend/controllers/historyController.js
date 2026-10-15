import SearchHistory from '../models/SearchHistory.js';

// @desc    Get user search history
// @route   GET /api/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single history entry
// @route   DELETE /api/history/:id
// @access  Private
export const deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await SearchHistory.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    res.json({
      success: true,
      message: 'History item removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all user search history
// @route   DELETE /api/history
// @access  Private
export const clearHistory = async (req, res, next) => {
  try {
    await SearchHistory.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'Search history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};
