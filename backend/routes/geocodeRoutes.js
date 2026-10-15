import express from 'express';
import { searchGeocode, reverseGeocode } from '../controllers/geocodeController.js';

const router = express.Router();

router.get('/search', searchGeocode);
router.get('/reverse', reverseGeocode);

export default router;
