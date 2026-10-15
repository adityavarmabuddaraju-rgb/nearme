import express from 'express';
import { getHistory, deleteHistoryItem, clearHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All history management routes are authenticated

router.get('/', getHistory);
router.delete('/:id', deleteHistoryItem);
router.delete('/', clearHistory);

export default router;
