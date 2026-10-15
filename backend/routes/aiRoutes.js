import express from 'express';
import { searchWithAI, recommendPlaces } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/search', optionalAuth, searchWithAI);
router.post('/recommend', recommendPlaces);

export default router;
