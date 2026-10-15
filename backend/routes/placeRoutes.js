import express from 'express';
import { getNearbyPlaces, searchPlaces, getPlaceById } from '../controllers/placeController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/nearby', optionalAuth, getNearbyPlaces);
router.get('/search', optionalAuth, searchPlaces);
router.get('/:id', getPlaceById);

export default router;
