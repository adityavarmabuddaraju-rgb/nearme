import { getRouteDirections } from '../services/routingService.js';

// @desc    Get routing coordinates and directions via OSRM
// @route   GET /api/directions
// @access  Public
export const getDirections = async (req, res, next) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        message: 'startLat, startLng, endLat, and endLng parameters are required.',
      });
    }

    const routeData = await getRouteDirections(startLat, startLng, endLat, endLng);

    res.json({
      success: true,
      data: routeData,
    });
  } catch (error) {
    next(error);
  }
};
